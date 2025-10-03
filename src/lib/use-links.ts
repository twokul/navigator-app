import { useMemo } from "react";
import { links, getLink, hasLink, searchLinks, type LinkKey } from "./links";
import { createLinkObject, getAllExternalLinks } from "./link-utils";

/**
 * React hook for working with centralized links
 */
export function useLinks() {
  return useMemo(
    () => ({
      // Direct access to the links object
      links,

      // Utility functions
      getLink,
      hasLink,
      searchLinks,

      // Helper functions
      createLink: createLinkObject,
      getAllLinks: getAllExternalLinks,

      // Quick access to common link categories
      study: links.study,
      official: links.official,
      states: links.states,
      programs: links.programs,
      professional: links.professional,
      financial: links.financial,
      volunteer: links.volunteer,
      social: links.social,
      shopping: links.shopping,
      personalStatement: links.personalStatement,
      youtube: links.youtube,
      additional: links.additional,
    }),
    [],
  );
}

/**
 * Hook for getting a specific link
 */
export function useLink(keyPath: string) {
  return useMemo(() => {
    const url = getLink(keyPath);
    return {
      url: url || "#",
      isValid: !!url,
      key: keyPath,
    };
  }, [keyPath]);
}

/**
 * Hook for getting all links in a category
 */
export function useCategoryLinks(category: LinkKey) {
  return useMemo(() => {
    return links[category] || {};
  }, [category]);
}

/**
 * Hook for searching links
 */
export function useSearchLinks(query: string) {
  return useMemo(() => {
    if (!query.trim()) return [];
    return searchLinks(query);
  }, [query]);
}
