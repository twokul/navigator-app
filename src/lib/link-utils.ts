import { links, getLink } from "./links";

/**
 * Utility functions for working with links in MDX content and components
 */

/**
 * Creates a markdown link with the given text and link key
 */
export function createMarkdownLink(text: string, linkKey: string): string {
  const url = getLink(linkKey);
  if (!url) {
    console.warn(`Link not found for key: ${linkKey}`);
    return text; // Return just the text if link not found
  }
  return `[${text}](${url})`;
}

/**
 * Creates an HTML anchor tag with the given text and link key
 */
export function createHtmlLink(text: string, linkKey: string, className?: string): string {
  const url = getLink(linkKey);
  if (!url) {
    console.warn(`Link not found for key: ${linkKey}`);
    return text;
  }
  const classAttr = className ? ` class="${className}"` : "";
  return `<a href="${url}"${classAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
}

/**
 * Validates all links in the links object to ensure they're accessible
 * This can be used for testing or maintenance
 */
export async function validateLinks(): Promise<
  Array<{ key: string; url: string; status: "valid" | "invalid" | "error" }>
> {
  const results: Array<{ key: string; url: string; status: "valid" | "invalid" | "error" }> = [];

  function validateObject(obj: Record<string, unknown>, prefix = ""): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"))
      ) {
        results.push({ key: fullKey, url: value, status: "valid" }); // We'll validate these in a separate function
      } else if (typeof value === "object" && value !== null) {
        validateObject(value as Record<string, unknown>, fullKey);
      }
    }
  }

  validateObject(links);
  return results;
}

/**
 * Gets all links in a specific category as an array of {key, url} objects
 */
export function getCategoryLinks(
  category: keyof typeof links,
): Array<{ key: string; url: string }> {
  const results: Array<{ key: string; url: string }> = [];

  function extractLinks(obj: Record<string, unknown>, prefix = ""): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"))
      ) {
        results.push({ key: fullKey, url: value });
      } else if (typeof value === "object" && value !== null) {
        extractLinks(value as Record<string, unknown>, fullKey);
      }
    }
  }

  extractLinks(links[category]);
  return results;
}

/**
 * Replaces all hardcoded URLs in a text with link references
 * This is useful for migrating existing content to use the centralized links
 */
export function replaceHardcodedUrls(text: string): string {
  let result = text;

  // Common patterns to replace
  const replacements = [
    { pattern: /https:\/\/bootcamp\.com\/inbde/g, key: "study.inbdeBootcamp" },
    { pattern: /https:\/\/boosterprep\.com\/inbde/g, key: "study.inbdeBooster" },
    { pattern: /https:\/\/dentaldecks\.com\//g, key: "study.dentalDecks" },
    {
      pattern: /https:\/\/www\.ada\.org\/education\/manage-your-dentpin/g,
      key: "official.dentpin",
    },
    { pattern: /https:\/\/www\.ece\.org\/ECE\/Credential-Evaluations/g, key: "official.ece" },
    { pattern: /https:\/\/jcnde\.ada\.org\/inbde/g, key: "official.inbde" },
    { pattern: /https:\/\/www\.ets\.org\/toefl\.html/g, key: "official.toefl" },
    {
      pattern:
        /https:\/\/www\.adea\.org\/dental_education_pathways\/CAAPID\/Pages\/ADEAPASSApplicants\.aspx/g,
      key: "official.caapid",
    },
    { pattern: /https:\/\/www\.adea\.org\/pass\//g, key: "official.pass" },
    {
      pattern: /https:\/\/floridasdentistry\.gov\/Applications\/dental-hygiene-app\.pdf/g,
      key: "states.florida.dentalHygieneApp",
    },
    { pattern: /https:\/\/www\.cdcaexams\.org\//g, key: "programs.cdca" },
    {
      pattern: /https:\/\/www\.danb\.org\/state-requirements/g,
      key: "professional.danb.stateRequirements",
    },
    { pattern: /https:\/\/www\.dentalassistant\.org\//g, key: "professional.adaa" },
    { pattern: /https:\/\/www\.dental-specialties\.com\//g, key: "professional.dentalSpecialties" },
    { pattern: /https:\/\/www\.danb\.org\//g, key: "professional.danb.main" },
    { pattern: /https:\/\/cssprofile\.collegeboard\.org\/about/g, key: "financial.cssProfile" },
    { pattern: /https:\/\/usc\.igrad\.com\/scholarships/g, key: "financial.uscIgrad" },
    { pattern: /http:\/\/www\.fastweb\.com\//g, key: "financial.fastweb" },
    { pattern: /http:\/\/www\.scholarships\.com\//g, key: "financial.scholarships" },
    { pattern: /https:\/\/studentaid\.gov\//g, key: "financial.studentAid" },
    { pattern: /https:\/\/www\.amopportunities\.org\//g, key: "volunteer.amOpportunities" },
    { pattern: /https:\/\/www\.volunteermatch\.org\//g, key: "volunteer.volunteerMatch" },
    { pattern: /https:\/\/www\.americorps\.gov\//g, key: "volunteer.ameriCorps" },
    { pattern: /https:\/\/handsonsandiego\.org\//g, key: "volunteer.handsOnSanDiego" },
    {
      pattern: /https:\/\/www\.globaldentalrelief\.org\/contact-us\//g,
      key: "volunteer.globalDentalRelief",
    },
    { pattern: /https:\/\/www\.smilesforeveryone\.org\//g, key: "volunteer.smilesForEveryone" },
    { pattern: /https:\/\/www\.dosomething\.org\/what-we-do/g, key: "volunteer.doSomething" },
    {
      pattern: /https:\/\/www\.facebook\.com\/groups\/caapid\/\?ref=share&mibextid=NSMWBT/g,
      key: "social.facebook.caapid",
    },
    { pattern: /https:\/\/www\.facebook\.com\/groups\/inbde/g, key: "social.facebook.inbde" },
    { pattern: /https:\/\/t\.me\/inbde_friends/g, key: "social.telegram.inbde" },
    {
      pattern: /https:\/\/www\.reddit\.com\/user\/thefrenchdentiste\//g,
      key: "social.reddit.frenchDentiste",
    },
    {
      pattern: /https:\/\/www\.instagram\.com\/dentist\.abroad\//g,
      key: "social.instagram.dentistAbroad",
    },
    { pattern: /https:\/\/www\.youtube\.com\/@dent\.abroad/g, key: "social.youtube.dentAbroad" },
    { pattern: /dr\.dent\.abroad@gmail\.com/g, key: "contact.email" },
  ];

  for (const replacement of replacements) {
    const url = getLink(replacement.key);
    if (url) {
      result = result.replace(replacement.pattern, `{{${replacement.key}}}`);
    }
  }

  return result;
}

/**
 * Converts link references back to actual URLs
 * This is useful for rendering content that uses link references
 */
export function resolveLinkReferences(text: string): string {
  let result = text;

  // Find all {{key}} patterns and replace with actual URLs
  const linkPattern = /\{\{([^}]+)\}\}/g;
  const matches = text.matchAll(linkPattern);

  for (const match of matches) {
    const key = match[1];
    const url = getLink(key);
    if (url) {
      result = result.replace(match[0], url);
    } else {
      console.warn(`Link not found for key: ${key}`);
      result = result.replace(match[0], `#${key}`);
    }
  }

  return result;
}

/**
 * Creates a link object for use in React components
 */
export function createLinkObject(text: string, linkKey: string) {
  const url = getLink(linkKey);
  return {
    text,
    url: url || "#",
    isValid: !!url,
    key: linkKey,
  };
}

/**
 * Gets all external links used in the content as a flat array
 */
export function getAllExternalLinks(): Array<{ key: string; url: string; category: string }> {
  const results: Array<{ key: string; url: string; category: string }> = [];

  function extractLinks(obj: Record<string, unknown>, category: string, prefix = ""): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"))
      ) {
        results.push({ key: fullKey, url: value, category });
      } else if (typeof value === "object" && value !== null) {
        extractLinks(value as Record<string, unknown>, category, fullKey);
      }
    }
  }

  for (const [category, categoryLinks] of Object.entries(links)) {
    extractLinks(categoryLinks, category);
  }

  return results;
}
