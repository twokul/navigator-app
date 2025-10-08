import { source } from "@/lib/source";
import type { InferPageType } from "fumadocs-core/source";

/**
 * Get LLM-friendly text content from a page using Fumadocs' built-in processing
 * This follows the official Fumadocs pattern for AI integration
 */
export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}
URL: ${page.url}

${processed}`;
}
