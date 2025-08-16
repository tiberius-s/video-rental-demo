#!/usr/bin/env tsx

/**
 * Generate SQLite database schema from domain models
 */

import { generateSqlSchemaFile, loadComponentsSchemasFromFile } from "@video-rental/db";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the generated OpenAPI specification from domain package
const openApiPath = resolve(__dirname, "../../domain/tsp-output/@typespec/openapi3/openapi.json");

// Path where to output the schema
const schemaOutputPath = resolve(__dirname, "../database/schema.sql");

console.log("🔧 Generating database schema from domain models...");
console.log(`📖 Reading OpenAPI spec from: ${openApiPath}`);
console.log(`📝 Writing schema to: ${schemaOutputPath}`);

try {
  // Load schemas from the generated OpenAPI specification
  const schemas = loadComponentsSchemasFromFile(openApiPath);

  console.log(`✅ Found ${Object.keys(schemas).length} schemas:`, Object.keys(schemas).join(", "));

  // Generate optimized SQLite schema
  generateSqlSchemaFile(schemas, schemaOutputPath, {
    useStrictMode: true, // Use WITHOUT ROWID for better performance with UUIDs
    includeIndexes: true, // Auto-generate indexes for optimal queries
    includeTimestamps: true, // Add created_at/updated_at columns
    includeFilePragmas: true, // Include performance pragmas
  });

  console.log("✅ Database schema generated successfully!");
  console.log(`📁 Schema file created at: ${schemaOutputPath}`);
} catch (error) {
  console.error("❌ Failed to generate database schema:", error);
  process.exit(1);
}
