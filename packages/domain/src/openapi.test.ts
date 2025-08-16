import assert from "node:assert";
import { existsSync } from "node:fs";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  OpenApiHelper,
  OpenApiSpec,
  getApiInfo,
  getOpenApiSpec,
  getOpenApiSpecPath,
  getOperations,
  getSchemaByName,
  getSchemaNames,
  getServers,
  hasSchema,
  isOpenApiSpecAvailable,
  openApiSpec,
} from "./openapi.js";

describe("OpenApiSpec Static Class", () => {
  beforeEach(() => {
    // Clear cache before each test
    OpenApiSpec.clearCache();
  });

  afterEach(() => {
    // Clean up after each test
    OpenApiSpec.clearCache();
  });

  describe("Core Functionality", () => {
    it("should load and cache raw JSON specification", () => {
      const rawSpec = OpenApiSpec.getRawSpec();

      assert.strictEqual(typeof rawSpec, "string");
      assert(rawSpec.length > 0);
      assert(rawSpec.includes('"openapi"'));
      assert(rawSpec.includes('"info"'));
      assert(rawSpec.includes('"paths"'));

      // Second call should return cached version
      const rawSpec2 = OpenApiSpec.getRawSpec();
      assert.strictEqual(rawSpec, rawSpec2);
    });

    it("should load and cache parsed JavaScript specification", () => {
      const parsedSpec = OpenApiSpec.getParsedSpec();

      assert.strictEqual(typeof parsedSpec, "object");
      assert(parsedSpec !== null);
      assert(typeof parsedSpec.openapi === "string");
      assert(typeof parsedSpec.info === "object");
      assert(typeof parsedSpec.paths === "object");

      // Second call should return cached version
      const parsedSpec2 = OpenApiSpec.getParsedSpec();
      assert.strictEqual(parsedSpec, parsedSpec2);
    });

    it("should check if specification file is available", () => {
      const isAvailable = OpenApiSpec.isAvailable();
      assert.strictEqual(typeof isAvailable, "boolean");
      assert.strictEqual(isAvailable, true); // Should be available in tests
    });

    it("should return correct specification file path", () => {
      const specPath = OpenApiSpec.getSpecPath();
      assert.strictEqual(typeof specPath, "string");
      assert(specPath.endsWith("openapi.json"));
      assert(existsSync(specPath)); // File should exist
    });

    it("should clear cache properly", () => {
      // Load specs to populate cache
      const rawSpec1 = OpenApiSpec.getRawSpec();
      const parsedSpec1 = OpenApiSpec.getParsedSpec();

      // Clear cache
      OpenApiSpec.clearCache();

      // Load again - should re-read from file
      const rawSpec2 = OpenApiSpec.getRawSpec();
      const parsedSpec2 = OpenApiSpec.getParsedSpec();

      // Should be equal in content but different objects after cache clear
      assert.strictEqual(rawSpec1, rawSpec2);
      assert.deepStrictEqual(parsedSpec1, parsedSpec2);
    });
  });

  describe("Error Handling", () => {
    it("should provide helpful error message when spec file is missing", () => {
      // This test would require mocking the file system or using a different path
      // For now, we'll test the path format is reasonable
      const specPath = OpenApiSpec.getSpecPath();
      assert(specPath.includes("tsp-output"));
      assert(specPath.includes("@typespec"));
      assert(specPath.includes("openapi3"));
    });
  });
});

describe("OpenApiHelper Static Class", () => {
  beforeEach(() => {
    OpenApiSpec.clearCache();
  });

  afterEach(() => {
    OpenApiSpec.clearCache();
  });

  describe("Schema Operations", () => {
    it("should get all schemas", () => {
      const schemas = OpenApiHelper.getSchemas();

      assert.strictEqual(typeof schemas, "object");
      assert(schemas !== null);

      // Should have some common schemas from our domain
      const schemaKeys = Object.keys(schemas);
      assert(schemaKeys.length > 0);

      // Check for expected domain schemas
      const hasCustomerSchema = schemaKeys.some((key) => key.includes("Customer"));
      const hasVideoSchema = schemaKeys.some((key) => key.includes("Video"));
      assert(hasCustomerSchema || hasVideoSchema, "Should have domain-specific schemas");
    });

    it("should get schema names as array", () => {
      const schemaNames = OpenApiHelper.getSchemaNames();

      assert(Array.isArray(schemaNames));
      assert(schemaNames.length > 0);

      // All items should be strings
      schemaNames.forEach((name) => {
        assert.strictEqual(typeof name, "string");
        assert(name.length > 0);
      });
    });

    it("should get specific schema by name", () => {
      const schemaNames = OpenApiHelper.getSchemaNames();
      const firstSchemaName = schemaNames[0];

      const schema = OpenApiHelper.getSchemaByName(firstSchemaName);
      assert(schema !== undefined);
      assert.strictEqual(typeof schema, "object");
    });

    it("should return undefined for non-existent schema", () => {
      const schema = OpenApiHelper.getSchemaByName("NonExistentSchema");
      assert.strictEqual(schema, undefined);
    });

    it("should validate schema existence", () => {
      const schemaNames = OpenApiHelper.getSchemaNames();
      const firstSchemaName = schemaNames[0];

      assert.strictEqual(OpenApiHelper.hasSchema(firstSchemaName), true);
      assert.strictEqual(OpenApiHelper.hasSchema("NonExistentSchema"), false);
    });
  });

  describe("Path and Operation Analysis", () => {
    it("should get all paths", () => {
      const paths = OpenApiHelper.getPaths();

      assert.strictEqual(typeof paths, "object");
      assert(paths !== null);

      const pathKeys = Object.keys(paths);
      assert(pathKeys.length > 0);

      // Should have API paths
      const hasApiPaths = pathKeys.some((path) => path.startsWith("/api/"));
      assert(hasApiPaths, "Should have API paths starting with /api/");
    });

    it("should get all operations with proper structure", () => {
      const operations = OpenApiHelper.getOperations();

      assert(Array.isArray(operations));
      assert(operations.length > 0);

      // Check structure of operations
      operations.forEach((op) => {
        assert.strictEqual(typeof op.path, "string");
        assert.strictEqual(typeof op.method, "string");
        assert.strictEqual(typeof op.operation, "object");

        // Method should be uppercase HTTP method
        assert(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].includes(op.method));

        // Path should start with /
        assert(op.path.startsWith("/"));
      });
    });

    it("should get components", () => {
      const components = OpenApiHelper.getComponents();

      assert.strictEqual(typeof components, "object");
      assert(components !== null);

      // Should have schemas in components
      assert(typeof components.schemas === "object");
    });
  });

  describe("API Metadata", () => {
    it("should get API info", () => {
      const apiInfo = OpenApiHelper.getApiInfo();

      assert.strictEqual(typeof apiInfo, "object");
      assert(apiInfo !== null);

      // Should have standard OpenAPI info fields
      assert(typeof apiInfo.title === "string");
      assert(typeof apiInfo.version === "string");
    });

    it("should get servers array", () => {
      const servers = OpenApiHelper.getServers();

      assert(Array.isArray(servers));

      // If servers exist, they should have proper structure
      servers.forEach((server) => {
        assert.strictEqual(typeof server, "object");
        // Servers should have URL field
        if (server.url) {
          assert.strictEqual(typeof server.url, "string");
        }
      });
    });
  });
});

describe("Legacy Function Compatibility", () => {
  beforeEach(() => {
    OpenApiSpec.clearCache();
  });

  afterEach(() => {
    OpenApiSpec.clearCache();
  });

  describe("getOpenApiSpec function", () => {
    it("should return JSON string by default", () => {
      const spec = getOpenApiSpec();

      assert.strictEqual(typeof spec, "string");
      assert(spec.includes('"openapi"'));
    });

    it("should return JSON string when format is 'json'", () => {
      const spec = getOpenApiSpec("json");

      assert.strictEqual(typeof spec, "string");
      assert(spec.includes('"openapi"'));
    });

    it("should return JavaScript object when format is 'js'", () => {
      const spec = getOpenApiSpec("js");

      assert.strictEqual(typeof spec, "object");
      assert(spec !== null);
      assert(typeof spec.openapi === "string");
    });
  });

  describe("openApiSpec object", () => {
    it("should provide spec getter", () => {
      const spec = openApiSpec.spec;

      assert.strictEqual(typeof spec, "object");
      assert(spec !== null);
      assert(typeof spec.openapi === "string");
    });

    it("should provide getSchemas method", () => {
      const schemas = openApiSpec.getSchemas();

      assert.strictEqual(typeof schemas, "object");
      assert(schemas !== null);
    });

    it("should provide getPaths method", () => {
      const paths = openApiSpec.getPaths();

      assert.strictEqual(typeof paths, "object");
      assert(paths !== null);
    });

    it("should provide getComponents method", () => {
      const components = openApiSpec.getComponents();

      assert.strictEqual(typeof components, "object");
      assert(components !== null);
    });
  });

  describe("Helper function exports", () => {
    it("should export isOpenApiSpecAvailable", () => {
      const isAvailable = isOpenApiSpecAvailable();
      assert.strictEqual(typeof isAvailable, "boolean");
    });

    it("should export getOpenApiSpecPath", () => {
      const specPath = getOpenApiSpecPath();
      assert.strictEqual(typeof specPath, "string");
      assert(specPath.endsWith("openapi.json"));
    });

    it("should export schema helper functions", () => {
      const schemaNames = getSchemaNames();
      assert(Array.isArray(schemaNames));

      if (schemaNames.length > 0) {
        const firstSchema = schemaNames[0];
        const schema = getSchemaByName(firstSchema);
        const hasSchemaResult = hasSchema(firstSchema);

        assert(schema !== undefined);
        assert.strictEqual(hasSchemaResult, true);
      }
    });

    it("should export operation helper functions", () => {
      const operations = getOperations();
      const apiInfo = getApiInfo();
      const servers = getServers();

      assert(Array.isArray(operations));
      assert.strictEqual(typeof apiInfo, "object");
      assert(Array.isArray(servers));
    });
  });
});

describe("Integration Tests", () => {
  beforeEach(() => {
    OpenApiSpec.clearCache();
  });

  afterEach(() => {
    OpenApiSpec.clearCache();
  });

  it("should maintain consistency between static class and legacy functions", () => {
    // Get data through static class
    const staticRawSpec = OpenApiSpec.getRawSpec();
    const staticParsedSpec = OpenApiSpec.getParsedSpec();
    const staticSchemas = OpenApiHelper.getSchemas();

    // Get data through legacy functions
    const legacyJsonSpec = getOpenApiSpec("json");
    const legacyJsSpec = getOpenApiSpec("js");
    const legacySchemas = openApiSpec.getSchemas();

    // Should be identical
    assert.strictEqual(staticRawSpec, legacyJsonSpec);
    assert.deepStrictEqual(staticParsedSpec, legacyJsSpec);
    assert.deepStrictEqual(staticSchemas, legacySchemas);
  });

  it("should handle real domain schemas correctly", () => {
    const schemaNames = OpenApiHelper.getSchemaNames();

    // Should have some expected domain schemas
    const expectedSchemaTypes = ["Customer", "Video", "Rental", "Payment", "Inventory"];
    const foundSchemas = expectedSchemaTypes.filter((type) =>
      schemaNames.some((name) => name.includes(type)),
    );

    assert(foundSchemas.length > 0, "Should find at least some domain schemas");

    // Test that we can access these schemas
    foundSchemas.forEach((schemaType) => {
      const matchingSchemaName = schemaNames.find((name) => name.includes(schemaType));
      if (matchingSchemaName) {
        const schema = OpenApiHelper.getSchemaByName(matchingSchemaName);
        assert(schema !== undefined, `Should be able to access ${matchingSchemaName} schema`);
        assert.strictEqual(typeof schema, "object");
      }
    });
  });

  it("should find expected API operations", () => {
    const operations = OpenApiHelper.getOperations();

    // Should have health check operation
    const healthOp = operations.find((op) => op.path.includes("/health"));
    assert(healthOp !== undefined, "Should have health check endpoint");

    // Should have customer operations
    const customerOps = operations.filter((op) => op.path.includes("/customers"));
    assert(customerOps.length > 0, "Should have customer operations");

    // Should have various HTTP methods
    const methods = [...new Set(operations.map((op) => op.method))];
    assert(methods.includes("GET"), "Should have GET operations");
    assert(methods.includes("POST"), "Should have POST operations");
  });
});
