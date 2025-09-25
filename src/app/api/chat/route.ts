import { ProvideLinksToolSchema } from "@/lib/ai-tools-schema";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { getRelevantContent } from "@/lib/semantic-search";

export const runtime = "edge";

export async function POST(req: Request) {
  const reqJson = await req.json();

  // Get the user's latest message to search for relevant content
  const userMessages = reqJson.messages.filter((msg: any) => msg.role === "user");
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
          .filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join(" ");
      } else if (latestUserMessage.content.text) {
        query = latestUserMessage.content.text;
      }
    } else if (latestUserMessage.parts) {
      // Handle direct parts array (as shown in the debug log)
      query = latestUserMessage.parts
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
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
  const relevantContent = await getRelevantContent(query, 3);

  // Create context from relevant content
  const contextContent = relevantContent
    .map(
      (content: { title: string; url: string; text: string }) =>
        `# ${content.title}\nURL: ${content.url}\n\n${content.text}`,
    )
    .join("\n\n---\n\n");

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

User's question: ${query}`,
  };

  const result = streamText({
    model: openai("gpt-4o"),
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
