import * as fs from "fs";
import * as path from "path";

/**
 * Recursively scans the given directory for files and extracts all getEnv('...') parameters.
 * @param {string} dirPath - The starting directory (e.g., './src')
 * @returns {string[]} - List of extracted keys
 */
export function extractAppEnvKeys(dirPath) {
  let keys = [];

  function walkDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDirectory(fullPath); // Recurse into subdirectory
      } else if (stat.isFile() && fullPath.endsWith(".ts")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const regex = /getEnv\(\s*['"]([^'"]+)['"]\s*\)/g;

        let match;
        while ((match = regex.exec(content)) !== null) {
          keys.push(match[1]);
        }
      }
    }
  }

  walkDirectory(dirPath);

  return keys;
}
