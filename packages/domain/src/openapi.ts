import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the generated OpenAPI specification
// When running from compiled JS in dist/, we need to go back to package root, then to tsp-output
const openApiPath = resolve(__dirname, "../tsp-output/@typespec/openapi3/openapi.json");

let cachedSpec: any = null;

/**
 * Load and return the generated OpenAPI specification
 * This will be used by the API package to get the schema definitions
 */
export function getOpenApiSpec(): any {
  if (!cachedSpec) {
    try {
      const specContent = readFileSync(openApiPath, "utf-8");
      cachedSpec = JSON.parse(specContent);
    } catch (error) {
      throw new Error(
        `Failed to load OpenAPI specification from ${openApiPath}. ` +
          `Make sure to run 'npm run build:tsp' in the domain package first. ` +
          `Error: ${error}`,
      );
    }
  }
  return cachedSpec;
}

/**
 * Cached access to OpenAPI spec
 */
export const openApiSpec = {
  get spec() {
    return getOpenApiSpec();
  },
  getSchemas() {
    return this.spec.components?.schemas || {};
  },
  getPaths() {
    return this.spec.paths || {};
  },
  getComponents() {
    return this.spec.components || {};
  },
};

/**
 * Reset the cached specification (useful for testing)
 */
export function resetCache(): void {
  cachedSpec = null;
}

/**
 * Check if the OpenAPI specification file exists
 */
export function isOpenApiSpecAvailable(): boolean {
  try {
    existsSync(openApiPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the path to the OpenAPI specification file
 */
export function getOpenApiSpecPath(): string {
  return openApiPath;
}

/**
 * Get schema definition by name
 */
export function getSchemaByName(schemaName: string): any {
  const schemas = openApiSpec.getSchemas();
  return schemas[schemaName];
}

/**
 * Get all schema names
 */
export function getSchemaNames(): string[] {
  const schemas = openApiSpec.getSchemas();
  return Object.keys(schemas);
}

/**
 * Validate that a schema exists
 */
export function hasSchema(schemaName: string): boolean {
  const schemas = openApiSpec.getSchemas();
  return schemaName in schemas;
}

/**
 * Get operation definitions from paths
 */
export function getOperations(): Array<{
  path: string;
  method: string;
  operation: any;
}> {
  const paths = openApiSpec.getPaths();
  const operations: Array<{
    path: string;
    method: string;
    operation: any;
  }> = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    if (typeof pathItem === "object" && pathItem !== null) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (typeof operation === "object" && operation !== null && method !== "parameters") {
          operations.push({
            path,
            method: method.toUpperCase(),
            operation,
          });
        }
      }
    }
  }

  return operations;
}

/**
 * Get the OpenAPI specification info
 */
export function getApiInfo(): any {
  return openApiSpec.spec.info || {};
}

/**
 * Get server definitions
 */
export function getServers(): any[] {
  return openApiSpec.spec.servers || [];
}
