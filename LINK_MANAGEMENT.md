# Link Management System

This document explains how to use the centralized link management system for managing all external URLs in the content.

## Overview

The link management system provides a single source of truth for all external URLs used throughout the content. This makes it easier to:

- Update URLs when they change
- Ensure consistency across content
- Validate link accessibility
- Track link usage

## Files

- `src/lib/links.ts` - Centralized links object with all external URLs
- `src/lib/link-utils.ts` - Utility functions for working with links
- `src/lib/use-links.ts` - React hooks for using links in components
- `src/lib/migrate-links.ts` - Migration script for converting existing content
- `src/components/link.tsx` - React components for rendering links
- `src/mdx-components.tsx` - MDX components including link utilities

## Usage

### In MDX Content

You can now use link references instead of hardcoded URLs:

```mdx
<!-- Instead of -->

[INBDE Bootcamp](https://bootcamp.com/inbde)

<!-- Use -->

[INBDE Bootcamp](study.inbdeBootcamp)
```

### In React Components

```tsx
import { useLinks, useLink } from "@/lib/use-links";

function MyComponent() {
  const { getLink, study } = useLinks();
  const inbdeLink = useLink("study.inbdeBootcamp");

  return (
    <div>
      <a href={getLink("study.inbdeBootcamp")}>INBDE Bootcamp</a>
      <a href={inbdeLink.url}>INBDE Bootcamp (with validation)</a>
    </div>
  );
}
```

### Using Link Components

```tsx
import { Link, ExternalLink, InternalLink } from "@/components/link";

function MyComponent() {
  return (
    <div>
      {/* Automatically detects if it's a link key or URL */}
      <Link href="study.inbdeBootcamp">INBDE Bootcamp</Link>
      <Link href="https://example.com">External URL</Link>

      {/* Explicitly external link */}
      <ExternalLink href="study.inbdeBootcamp">INBDE Bootcamp</ExternalLink>

      {/* Internal link */}
      <InternalLink href="/some-page">Internal Page</InternalLink>
    </div>
  );
}
```

## Link Structure

Links are organized by category:

```typescript
{
  study: {
    inbdeBootcamp: "https://bootcamp.com/inbde",
    inbdeBooster: "https://boosterprep.com/inbde",
    // ...
  },
  official: {
    dentpin: "https://www.ada.org/education/manage-your-dentpin",
    ece: "https://www.ece.org/ECE/Credential-Evaluations",
    // ...
  },
  states: {
    florida: {
      dentalHygieneApp: "https://floridasdentistry.gov/Applications/dental-hygiene-app.pdf",
    },
    // ...
  },
  // ... more categories
}
```

## Migration

### Migrating Existing Content

1. **Dry run** to see what would be changed:

```bash
npx tsx src/lib/migrate-links.ts --dry-run
```

2. **Create backups** and migrate:

```bash
npx tsx src/lib/migrate-links.ts --backup
```

3. **Validate** the migration:

```bash
npx tsx -e "import { validateLinkReferences } from './src/lib/migrate-links'; console.log(validateLinkReferences());"
```

### Manual Migration

You can also manually replace URLs in content files:

```mdx
<!-- Before -->

[INBDE Bootcamp](https://bootcamp.com/inbde)

<!-- After -->

[INBDE Bootcamp](study.inbdeBootcamp)
```

## Adding New Links

1. Add the link to the appropriate category in `src/lib/links.ts`:

```typescript
export const links = {
  study: {
    // ... existing links
    newStudyResource: "https://example.com/new-resource",
  },
  // ... other categories
} as const;
```

2. Use the link in your content:

```mdx
[New Study Resource](study.newStudyResource)
```

## Utility Functions

### Getting Links

```typescript
import { getLink, hasLink, searchLinks } from "@/lib/links";

// Get a specific link
const url = getLink("study.inbdeBootcamp");

// Check if a link exists
const exists = hasLink("study.inbdeBootcamp");

// Search for links
const results = searchLinks("inbde");
```

### Working with Content

```typescript
import { createMarkdownLink, createHtmlLink } from "@/lib/link-utils";

// Create markdown link
const markdown = createMarkdownLink("INBDE Bootcamp", "study.inbdeBootcamp");

// Create HTML link
const html = createHtmlLink("INBDE Bootcamp", "study.inbdeBootcamp", "text-blue-600");
```

## Validation

### Validate All Links

```typescript
import { validateLinks } from "@/lib/link-utils";

const results = await validateLinks();
console.log(results);
```

### Validate Link References in Content

```typescript
import { validateLinkReferences } from "@/lib/migrate-links";

const results = validateLinkReferences();
console.log(`Valid: ${results.valid}, Invalid: ${results.invalid}`);
```

## Best Practices

1. **Use descriptive keys**: `study.inbdeBootcamp` instead of `study.link1`
2. **Group related links**: Keep related links in the same category
3. **Validate regularly**: Run validation to ensure all links are working
4. **Update consistently**: When a URL changes, update it in the centralized location
5. **Use TypeScript**: The system is fully typed for better IDE support

## Troubleshooting

### Link Not Found

If you get a "Link not found" warning:

1. Check the key path is correct
2. Ensure the link exists in `src/lib/links.ts`
3. Verify the category and subcategory names

### Migration Issues

If migration fails:

1. Check file permissions
2. Ensure the content directory path is correct
3. Run with `--dry-run` first to see what would change

### TypeScript Errors

If you get TypeScript errors:

1. Ensure you're using the correct key paths
2. Check that the link exists in the links object
3. Use the `LinkKey` type for type safety

## Examples

### Complete Example

```mdx
---
title: INBDE Study Guide
---

# INBDE Study Materials

Here are the best resources for INBDE preparation:

## Study Platforms

- [INBDE Bootcamp](study.inbdeBootcamp) - Comprehensive course with practice questions
- [INBDE Booster](study.inbdeBooster) - Affordable option with extensive question bank
- [Dental Decks](study.dentalDecks) - Traditional flashcard system

## Official Resources

- [Register for INBDE](official.inbde) - Official registration portal
- [Get your DENTPIN](official.dentpin) - Required for registration
- [ECE Evaluation](official.ece) - Credential evaluation service

## State-Specific Information

- [Florida Dental Hygiene Application](states.florida.dentalHygieneApp) - For hygienist licensure
- [Massachusetts Hygienist License](states.massachusetts.hygienistLicense) - State requirements

<ExternalLink href="study.inbdeBootcamp">Start with INBDE Bootcamp</ExternalLink>
```

This system makes it much easier to manage links across your entire content base!
