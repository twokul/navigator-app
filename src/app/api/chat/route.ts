import { ProvideLinksToolSchema } from "@/lib/ai-tools-schema";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { getRelevantContentServer } from "@/lib/semantic-search-server";

export const runtime = "nodejs";

// In-memory rate limiting
const userQueries = new Map<string, { count: number; resetTime: number }>();
const DAILY_LIMIT = 15; // queries per day per user
const HOURLY_LIMIT = 5; // queries per hour per user

// In-memory query caching
const queryCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting function
function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const user = userQueries.get(userId) || { count: 0, resetTime: now + 24 * 60 * 60 * 1000 };

  // Reset daily limit if 24 hours have passed
  if (now > user.resetTime) {
    user.count = 0;
    user.resetTime = now + 24 * 60 * 60 * 1000;
  }

  // Check hourly limit (simple implementation)
  const hourlyReset = now + 60 * 60 * 1000; // 1 hour from now
  const isNewHour =
    !userQueries.has(userId + "_hourly") ||
    (userQueries.get(userId + "_hourly")?.resetTime || 0) < now;

  if (isNewHour) {
    userQueries.set(userId + "_hourly", { count: 0, resetTime: hourlyReset });
  }

  const hourlyCount = userQueries.get(userId + "_hourly")?.count || 0;

  // Check limits
  if (user.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: user.resetTime };
  }

  if (hourlyCount >= HOURLY_LIMIT) {
    return {
      allowed: false,
      remaining: Math.max(0, DAILY_LIMIT - user.count),
      resetTime: hourlyReset,
    };
  }

  // Update counts
  user.count++;
  userQueries.set(userId, user);

  const hourly = userQueries.get(userId + "_hourly")!;
  hourly.count++;
  userQueries.set(userId + "_hourly", hourly);

  return {
    allowed: true,
    remaining: DAILY_LIMIT - user.count,
    resetTime: user.resetTime,
  };
}

// Query caching function
function getCachedResponse(query: string, contextHash: string): string | null {
  const cacheKey = `${query}:${contextHash}`;
  const cached = queryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }

  return null;
}

export async function POST(req: Request) {
  const reqJson = await req.json();

  // Extract user ID from request (you may need to adjust this based on your auth setup)
  const userId = reqJson.userId || req.headers.get("x-user-id") || "anonymous";

  // Check rate limiting
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    const resetTime = new Date(rateLimit.resetTime);
    const timeUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60)); // minutes

    // Return a streaming response that the frontend can handle
    const errorMessage = `🚫 **Rate Limit Reached**

You've used all ${DAILY_LIMIT} of your daily queries. 

**Time until reset:** ${timeUntilReset} minutes
**Remaining queries:** ${rateLimit.remaining}

Please try again later or consider upgrading your plan for higher limits.`;

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Respond with the exact message provided by the user.",
        },
        {
          role: "user",
          content: errorMessage,
        },
      ],
    });

    return result.toUIMessageStreamResponse();
  }

  // Get the user's latest message to search for relevant content
  const userMessages = reqJson.messages.filter((msg: { role: string }) => msg.role === "user");
  const latestUserMessage = userMessages[userMessages.length - 1];

  // Debug: log the message structure
  console.log("Latest user message:", JSON.stringify(latestUserMessage, null, 2));

  // Extract content from the message - handle different message formats
  let query = "";
  if (latestUserMessage) {
    if (typeof latestUserMessage.content === "string") {
      query = latestUserMessage.content;
    } else if (latestUserMessage.content && typeof latestUserMessage.content === "object") {
      // Handle structured content (e.g., with parts)
      if (latestUserMessage.content.parts) {
        query = latestUserMessage.content.parts
          .filter((part: { type: string }) => part.type === "text")
          .map((part: { text: string }) => part.text)
          .join(" ");
      } else if (latestUserMessage.content.text) {
        query = latestUserMessage.content.text;
      }
    } else if (latestUserMessage.parts) {
      // Handle direct parts array (as shown in the debug log)
      query = latestUserMessage.parts
        .filter((part: { type: string }) => part.type === "text")
        .map((part: { text: string }) => part.text)
        .join(" ");
    }
  }

  console.log("Extracted query:", query);

  // Fallback if query is still empty - use a generic search
  if (!query || query.trim().length === 0) {
    console.log("Query is empty, using fallback search");
    query = "dental school application requirements international dentists";
  }

  // Get relevant content using semantic search
  const relevantContent = await getRelevantContentServer(query, 3);

  // Create context hash for caching (based on relevant content)
  const contextHash = relevantContent
    .map((c) => c.path)
    .sort()
    .join("|");

  // Check cache first
  const cachedResponse = getCachedResponse(query, contextHash);
  if (cachedResponse) {
    console.log("Returning cached response for query:", query);
    return new Response(cachedResponse, {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Create context from relevant content
  const contextContent = relevantContent
    .map(
      (content: { title: string; url: string; text: string }) =>
        `# ${content.title}\nURL: ${content.url}\n\n${content.text}`,
    )
    .join("\n\n---\n\n");

  // Debug: log the context content to see what URLs are being passed
  console.log(
    "Context content URLs:",
    relevantContent.map((c) => c.url),
  );

  // Create system message with only relevant documentation context
  const systemMessage = {
    role: "system" as const,
    content: `You are a helpful assistant for the Dentist Abroad Navigator website. You help international dentists understand the process of applying to dental schools in the United States.

IMPORTANT: Only use the information provided in the documentation below. Do not make up information or provide generic responses.

Relevant documentation:
${contextContent}

Instructions:
1. Answer questions based ONLY on the documentation provided above
2. If the documentation doesn't contain the answer, say "I don't have specific information about that in the documentation"
3. When providing links, use relative URLs starting with "/c/" (e.g., "/c/applying-to-advanced-standing/applications")
4. Be specific and reference the actual content from the documentation
5. If you find relevant pages, provide links to those specific pages using relative URLs
6. For Advanced Standing Program questions, focus on the comprehensive information about ASP requirements, process, and benefits
7. Always provide actionable next steps when discussing the application process
8. NEVER use absolute URLs with domains - always use relative URLs starting with "/c/"
9. CRITICAL: All URLs must be relative paths like "/c/toefl" NOT absolute URLs like "https://domain.com/c/toefl"

User's question: ${query}`,
  };

  const result = streamText({
    model: openai("gpt-4o-mini"),
    tools: {
      provideLinks: {
        inputSchema: ProvideLinksToolSchema,
      },
    },
    messages: [
      systemMessage,
      ...convertToModelMessages(reqJson.messages, {
        ignoreIncompleteToolCalls: true,
      }),
    ],
    toolChoice: "auto",
  });

  return result.toUIMessageStreamResponse();
}
