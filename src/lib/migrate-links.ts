import fs from "fs";
import path from "path";
import { replaceHardcodedUrls, resolveLinkReferences } from "./link-utils";

/**
 * Migration script to convert hardcoded URLs to centralized link references
 */

interface MigrationOptions {
  dryRun?: boolean;
  backup?: boolean;
  contentDir?: string;
}

/**
 * Migrates a single file from hardcoded URLs to link references
 */
export function migrateFile(
  filePath: string,
  options: MigrationOptions = {},
): { success: boolean; changes: number; errors: string[] } {
  const errors: string[] = [];
  let changes = 0;

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const originalContent = content;

    // Replace hardcoded URLs with link references
    const migratedContent = replaceHardcodedUrls(content);

    // Count changes
    const originalUrls = (content.match(/https?:\/\/[^\s\)]+/g) || []).length;
    const migratedUrls = (migratedContent.match(/https?:\/\/[^\s\)]+/g) || []).length;
    changes = originalUrls - migratedUrls;

    if (!options.dryRun && changes > 0) {
      // Create backup if requested
      if (options.backup) {
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, originalContent);
        console.log(`Backup created: ${backupPath}`);
      }

      // Write migrated content
      fs.writeFileSync(filePath, migratedContent);
    }

    return { success: true, changes, errors };
  } catch (error) {
    errors.push(
      `Error processing ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return { success: false, changes: 0, errors };
  }
}

/**
 * Migrates all MDX files in the content directory
 */
export function migrateContentDirectory(options: MigrationOptions = {}): {
  totalFiles: number;
  successfulFiles: number;
  totalChanges: number;
  errors: string[];
} {
  const contentDir = options.contentDir || path.join(process.cwd(), "content");
  const errors: string[] = [];
  let totalFiles = 0;
  let successfulFiles = 0;
  let totalChanges = 0;

  function processDirectory(dirPath: string): void {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        processDirectory(itemPath);
      } else if (item.endsWith(".mdx")) {
        totalFiles++;
        const result = migrateFile(itemPath, options);

        if (result.success) {
          successfulFiles++;
          totalChanges += result.changes;
          if (result.changes > 0) {
            console.log(`✓ ${itemPath}: ${result.changes} URLs converted to link references`);
          }
        } else {
          errors.push(...result.errors);
        }
      }
    }
  }

  try {
    processDirectory(contentDir);
  } catch (error) {
    errors.push(
      `Error processing directory ${contentDir}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return { totalFiles, successfulFiles, totalChanges, errors };
}

/**
 * Validates that all link references can be resolved
 */
export function validateLinkReferences(contentDir: string = path.join(process.cwd(), "content")): {
  valid: number;
  invalid: number;
  errors: Array<{ file: string; key: string; error: string }>;
} {
  const errors: Array<{ file: string; key: string; error: string }> = [];
  let valid = 0;
  let invalid = 0;

  function processDirectory(dirPath: string): void {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        processDirectory(itemPath);
      } else if (item.endsWith(".mdx")) {
        try {
          const content = fs.readFileSync(itemPath, "utf-8");
          const linkPattern = /\{\{([^}]+)\}\}/g;
          const matches = content.matchAll(linkPattern);

          for (const match of matches) {
            const key = match[1];
            const resolved = resolveLinkReferences(match[0]);

            if (resolved === `#${key}`) {
              invalid++;
              errors.push({ file: itemPath, key, error: "Link key not found" });
            } else {
              valid++;
            }
          }
        } catch (error) {
          errors.push({
            file: itemPath,
            key: "unknown",
            error: `File read error: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      }
    }
  }

  try {
    processDirectory(contentDir);
  } catch (error) {
    errors.push({
      file: contentDir,
      key: "unknown",
      error: `Directory error: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  return { valid, invalid, errors };
}

/**
 * CLI function for running migrations
 */
export function runMigration(options: MigrationOptions = {}) {
  console.log("Starting link migration...");
  console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Backup: ${options.backup ? "YES" : "NO"}`);
  console.log("");

  const result = migrateContentDirectory(options);

  console.log("\nMigration Summary:");
  console.log(`Total files processed: ${result.totalFiles}`);
  console.log(`Successful migrations: ${result.successfulFiles}`);
  console.log(`Total URLs converted: ${result.totalChanges}`);
  console.log(`Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    result.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (options.dryRun) {
    console.log("\nThis was a dry run. No files were modified.");
    console.log("Run with dryRun: false to apply changes.");
  }

  return result;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    dryRun: args.includes("--dry-run"),
    backup: args.includes("--backup"),
    contentDir: args.find((arg) => arg.startsWith("--dir="))?.split("=")[1],
  };

  runMigration(options);
}
