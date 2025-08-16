/**
 * Generate TypeScript types from OpenAPI schema using openapi-typescript
 */
import { OpenApiSpec } from "@video-rental/domain";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import openapiTS, { astToString } from "openapi-typescript";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_PATH = join(__dirname, "../src/domain/types.d.ts");

async function main() {
  try {
    console.log("🔄 Generating TypeScript types from OpenAPI schema...");

    // Get the spec as a JavaScript object for openapi-typescript
    const oas = OpenApiSpec.getParsedSpec();

    // Generate TypeScript definitions
    const ast = await openapiTS(oas);
    const contents = astToString(ast);

    // Write to output file
    writeFileSync(OUTPUT_PATH, contents, "utf8");

    console.log("✅ Generated TypeScript types from OpenAPI schema");
    console.log(`📁 Types saved to: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("❌ Failed to generate types:", error);
    process.exit(1);
  }
}

main();
