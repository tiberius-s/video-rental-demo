import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Static class for accessing OpenAPI specification generated from TypeSpec
 */
export class OpenApiSpec {
  private static readonly specPath = resolve(
    __dirname,
    "../tsp-output/@typespec/openapi3/openapi.json",
  );

  private static cachedRawSpec: string | null = null;

  private static cachedParsedSpec: any = null;

  /**
   * Get the raw OpenAPI specification as JSON string
   */
  static getRawSpec(): string {
    if (!this.cachedRawSpec) {
      this.loadSpec();
    }
    return this.cachedRawSpec!;
  }

  /**
   * Get the parsed OpenAPI specification as JavaScript object
   */
  static getParsedSpec(): any {
    if (!this.cachedParsedSpec) {
      this.loadSpec();
    }
    return this.cachedParsedSpec!;
  }

  /**
   * Load and cache the OpenAPI specification
   */
  private static loadSpec(): void {
    try {
      this.cachedRawSpec = readFileSync(this.specPath, "utf-8");
      this.cachedParsedSpec = JSON.parse(this.cachedRawSpec);
    } catch (error) {
      throw new Error(
        `Failed to load OpenAPI specification from ${this.specPath}. ` +
          `Make sure to run 'npm run build:tsp' in the domain package first. ` +
          `Error: ${error}`,
      );
    }
  }

  /**
   * Check if the OpenAPI specification file exists
   */
  static isAvailable(): boolean {
    return existsSync(this.specPath);
  }

  /**
   * Get the path to the OpenAPI specification file
   */
  static getSpecPath(): string {
    return this.specPath;
  }

  /**
   * Clear the cached specifications (useful for testing)
   */
  static clearCache(): void {
    this.cachedRawSpec = null;
    this.cachedParsedSpec = null;
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use OpenApiSpec.getRawSpec() or OpenApiSpec.getParsedSpec() instead
 */
export function getOpenApiSpec(format: "json" | "js" = "json"): any {
  return format === "js" ? OpenApiSpec.getParsedSpec() : OpenApiSpec.getRawSpec();
}

/**
 * Helper class for accessing OpenAPI specification components
 */
export class OpenApiHelper {
  /**
   * Get schema definitions from the OpenAPI spec
   */
  static getSchemas(): Record<string, any> {
    return OpenApiSpec.getParsedSpec().components?.schemas || {};
  }

  /**
   * Get path definitions from the OpenAPI spec
   */
  static getPaths(): Record<string, any> {
    return OpenApiSpec.getParsedSpec().paths || {};
  }

  /**
   * Get components from the OpenAPI spec
   */
  static getComponents(): Record<string, any> {
    return OpenApiSpec.getParsedSpec().components || {};
  }

  /**
   * Get schema definition by name
   */
  static getSchemaByName(schemaName: string): any {
    const schemas = this.getSchemas();
    return schemas[schemaName];
  }

  /**
   * Get all schema names
   */
  static getSchemaNames(): string[] {
    const schemas = this.getSchemas();
    return Object.keys(schemas);
  }

  /**
   * Validate that a schema exists
   */
  static hasSchema(schemaName: string): boolean {
    const schemas = this.getSchemas();
    return schemaName in schemas;
  }

  /**
   * Get operation definitions from paths
   */
  static getOperations(): Array<{
    path: string;
    method: string;
    operation: any;
  }> {
    const paths = this.getPaths();
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
  static getApiInfo(): any {
    return OpenApiSpec.getParsedSpec().info || {};
  }

  /**
   * Get server definitions
   */
  static getServers(): any[] {
    return OpenApiSpec.getParsedSpec().servers || [];
  }
}

// Legacy compatibility exports
export const openApiSpec = {
  get spec() {
    return OpenApiSpec.getParsedSpec();
  },
  getSchemas() {
    return OpenApiHelper.getSchemas();
  },
  getPaths() {
    return OpenApiHelper.getPaths();
  },
  getComponents() {
    return OpenApiHelper.getComponents();
  },
};

export function isOpenApiSpecAvailable(): boolean {
  return OpenApiSpec.isAvailable();
}

export function getOpenApiSpecPath(): string {
  return OpenApiSpec.getSpecPath();
}

export function getSchemaByName(schemaName: string): any {
  return OpenApiHelper.getSchemaByName(schemaName);
}

export function getSchemaNames(): string[] {
  return OpenApiHelper.getSchemaNames();
}

export function hasSchema(schemaName: string): boolean {
  return OpenApiHelper.hasSchema(schemaName);
}

export function getOperations(): Array<{
  path: string;
  method: string;
  operation: any;
}> {
  return OpenApiHelper.getOperations();
}

export function getApiInfo(): any {
  return OpenApiHelper.getApiInfo();
}

export function getServers(): any[] {
  return OpenApiHelper.getServers();
}
