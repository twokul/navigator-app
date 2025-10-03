/**
 * "Us dental licensure" -> "US Dental Licensure"
 * "Toefl guide" -> "TOEFL Guide"
 * "Bench test preparation" -> "Bench Test Preparation"
 * "Inbde guide" -> "INBDE Guide"
 * "Caapid" -> "CAAPID"
 * "Advanced standing program application" -> "Advanced Standing Program Application"
 * "Getting started" -> "Getting Started"
 * "Choosing your path" -> "Choosing Your Path"
 * "Researching schools" -> "Researching Schools"
 * "Finances and logistics" -> "Finances and Logistics"
 * "Related paths and resources" -> "Related Paths and Resources"
 * "Tools" -> "Tools"
 *
 * @param str - The string to convert to capital case.
 * @returns
 */
export function toCapitalCase(str: string) {
  // Define known acronyms that should be fully capitalized
  const acronyms = new Set(["us", "toefl", "inbde", "caapid"]);

  // Define common words that should remain lowercase (except at the beginning)
  const lowercaseWords = new Set([
    "or",
    "the",
    "a",
    "an",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ]);

  return str
    .split(" ")
    .map((word, index) => {
      const lowerWord = word.toLowerCase();

      // Always capitalize the first word
      if (index === 0) {
        if (acronyms.has(lowerWord)) {
          return lowerWord.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Handle acronyms
      if (acronyms.has(lowerWord)) {
        return lowerWord.toUpperCase();
      }

      // Handle common lowercase words
      if (lowercaseWords.has(lowerWord)) {
        return lowerWord;
      }

      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
