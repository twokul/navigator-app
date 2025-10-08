import { source } from "@/lib/source";
import { getLLMText } from "@/lib/get-llm-text";
import { openai } from "@ai-sdk/openai";
import { embedMany, cosineSimilarity } from "ai";

// Cache for embeddings to avoid recomputing
const embeddingsCache = new Map<string, number[]>();

export async function getRelevantContentServer(query: string, maxResults = 5) {
  try {
    // Validate query input
    if (!query || query.trim().length === 0) {
      console.warn("Empty query provided to semantic search");
      return [];
    }

    // Get all pages dynamically from the source
    const pages = source.getPages();
    const pageTexts = await Promise.all(pages.map(getLLMText));

    // Create searchable content with metadata and filter out empty content
    const searchableContent = pages
      .map((page, index) => ({
        text: pageTexts[index],
        url: page.url,
        title: page.data.title,
        path: page.path,
      }))
      .filter((content) => content.text && content.text.trim().length > 0);

    // Ensure we have content to work with
    if (searchableContent.length === 0) {
      console.warn("No valid content found for semantic search");
      return [];
    }

    // Generate embeddings for the query
    const { embeddings: queryEmbeddings } = await embedMany({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      values: [query],
    });

    // Get embeddings for all content (with caching)
    const contentEmbeddings = await Promise.all(
      searchableContent.map(async (content) => {
        const cacheKey = content.path;
        if (embeddingsCache.has(cacheKey)) {
          return embeddingsCache.get(cacheKey)!;
        }

        // Validate content text before embedding
        if (!content.text || content.text.trim().length === 0) {
          console.warn(`Empty content for ${content.path}, skipping embedding`);
          return new Array(1536).fill(0); // Return zero vector for empty content
        }

        const { embeddings } = await embedMany({
          model: openai.textEmbeddingModel("text-embedding-3-small"),
          values: [content.text],
        });

        const embeddingVector = embeddings[0];
        embeddingsCache.set(cacheKey, embeddingVector);
        return embeddingVector;
      }),
    );

    // Calculate similarity scores using AI SDK cosineSimilarity
    const similarities = contentEmbeddings.map((embedding: number[], index: number) => ({
      content: searchableContent[index],
      similarity: cosineSimilarity(queryEmbeddings[0], embedding),
    }));

    // Sort by similarity and return top results
    const relevantContent = similarities
      .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity)
      .slice(0, maxResults)
      .filter((item: { similarity: number }) => item.similarity > 0.1) // Higher threshold for better quality
      .map(
        (item: { content: { title: string; url: string; text: string; path: string } }) =>
          item.content,
      );

    // If no results meet the threshold, return the top 3 results anyway
    if (relevantContent.length === 0) {
      const fallbackContent = similarities
        .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity)
        .slice(0, 3)
        .map(
          (item: { content: { title: string; url: string; text: string; path: string } }) =>
            item.content,
        );
      console.log("No results met similarity threshold, using fallback content");
      return fallbackContent;
    }

    console.log(`Found ${relevantContent.length} relevant pages for query: "${query}"`);
    console.log(
      "Relevant pages:",
      relevantContent.map((c) => c.title),
    );

    return relevantContent;
  } catch (error) {
    console.error("Error in semantic search:", error);
    // Fallback: return first few pages if embedding fails
    const pages = source.getPages().slice(0, 3);
    return Promise.all(
      pages.map(async (page) => ({
        text: await getLLMText(page),
        url: page.url,
        title: page.data.title,
        path: page.path,
      })),
    );
  }
}
