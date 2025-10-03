import { expect, test } from "vitest";
import { links, getLink, hasLink, searchLinks } from "@/lib/links";
import {
  createMarkdownLink,
  createHtmlLink,
  replaceHardcodedUrls,
  resolveLinkReferences,
} from "@/lib/link-utils";

test("links object has expected structure", () => {
  expect(links).toBeDefined();
  expect(links.study).toBeDefined();
  expect(links.official).toBeDefined();
  expect(links.states).toBeDefined();
});

test("getLink retrieves correct URLs", () => {
  expect(getLink("study.inbdeBootcamp")).toBe("https://bootcamp.com/inbde");
  expect(getLink("official.dentpin")).toBe("https://www.ada.org/education/manage-your-dentpin");
  expect(getLink("states.florida.dentalHygieneApp")).toBe(
    "https://floridasdentistry.gov/Applications/dental-hygiene-app.pdf",
  );
});

test("getLink returns undefined for non-existent keys", () => {
  expect(getLink("non.existent.key")).toBeUndefined();
  expect(getLink("study.nonExistent")).toBeUndefined();
});

test("hasLink correctly identifies existing links", () => {
  expect(hasLink("study.inbdeBootcamp")).toBe(true);
  expect(hasLink("non.existent.key")).toBe(false);
});

test("searchLinks finds relevant links", () => {
  const results = searchLinks("inbde");
  expect(results.length).toBeGreaterThan(0);
  expect(results.some((r) => r.key.includes("inbde"))).toBe(true);
});

test("createMarkdownLink generates correct markdown", () => {
  const markdown = createMarkdownLink("INBDE Bootcamp", "study.inbdeBootcamp");
  expect(markdown).toBe("[INBDE Bootcamp](https://bootcamp.com/inbde)");
});

test("createHtmlLink generates correct HTML", () => {
  const html = createHtmlLink("INBDE Bootcamp", "study.inbdeBootcamp", "text-blue-600");
  expect(html).toContain('<a href="https://bootcamp.com/inbde"');
  expect(html).toContain('class="text-blue-600"');
  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noopener noreferrer"');
});

test("createMarkdownLink handles non-existent links gracefully", () => {
  const markdown = createMarkdownLink("Test", "non.existent.key");
  expect(markdown).toBe("Test");
});

test("replaceHardcodedUrls converts URLs to link references", () => {
  const text = "Check out [INBDE Bootcamp](https://bootcamp.com/inbde) for study materials.";
  const result = replaceHardcodedUrls(text);
  expect(result).toContain("{{study.inbdeBootcamp}}");
});

test("resolveLinkReferences converts link references back to URLs", () => {
  const text = "Check out {{study.inbdeBootcamp}} for study materials.";
  const result = resolveLinkReferences(text);
  expect(result).toContain("https://bootcamp.com/inbde");
});

test("resolveLinkReferences handles unknown link references", () => {
  const text = "Check out {{unknown.key}} for study materials.";
  const result = resolveLinkReferences(text);
  expect(result).toContain("#unknown.key");
});

test("study links are properly defined", () => {
  expect(links.study.inbdeBootcamp).toBeDefined();
  expect(links.study.inbdeBooster).toBeDefined();
  expect(links.study.dentalDecks).toBeDefined();
});

test("official links are properly defined", () => {
  expect(links.official.dentpin).toBeDefined();
  expect(links.official.ece).toBeDefined();
  expect(links.official.inbde).toBeDefined();
});

test("state-specific links are properly defined", () => {
  expect(links.states.florida.dentalHygieneApp).toBeDefined();
  expect(links.states.massachusetts.hygienistLicense).toBeDefined();
});

test("social media links are properly defined", () => {
  expect(links.social.facebook.caapid).toBeDefined();
  expect(links.social.telegram.inbde).toBeDefined();
});
