import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

import {
  generateSqlSchema,
  generateSqlSchemaFile,
  loadComponentsSchemasFromFile,
  type OpenApiComponentsSchemas,
  type SqlSchemaOptions,
} from "./codegen.js";

/**
 * Test interfaces and mock data
 */
interface TestSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
}

const mockCustomerSchema: TestSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
    phone: { type: "string" },
    isActive: { type: "boolean" },
    dateOfBirth: { type: "string", format: "date" },
    createdAt: { type: "string", format: "date-time" },
  },
  required: ["name", "email"],
};

const mockRentalSchema: TestSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    customerId: { type: "integer" },
    videoId: { type: "integer" },
    status: { type: "string", enum: ["active", "returned", "overdue"] },
    rentalFee: { type: "number" },
    dueDate: { type: "string", format: "date" },
    notes: { type: "string" },
  },
  required: ["customerId", "videoId", "status"],
};

const mockVideoSchema: TestSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    title: { type: "string" },
    description: { type: "string" },
    rating: { type: "number" },
    price: { type: "number" },
    genre: { type: "string", enum: ["action", "comedy", "drama"] },
    isAvailable: { type: "boolean" },
    metadata: { type: "object" },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["title", "price"],
};

const mockProfileSchema: TestSchema = {
  type: "object",
  properties: {
    userId: { $ref: "#/components/schemas/User" },
    preferences: { type: "object" },
    defaultPayment: { type: "string", default: "credit_card" },
    loyaltyPoints: { type: "integer", default: 0 },
  },
};

const mockComponentsSchemas: OpenApiComponentsSchemas = {
  Customer: mockCustomerSchema,
  Rental: mockRentalSchema,
  Video: mockVideoSchema,
  Profile: mockProfileSchema,
};

describe("codegen", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codegen-test-"));
  });

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("generateSqlSchema", () => {
    test("should generate basic SQL schema with default options", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(result.includes("PRAGMA journal_mode = WAL"), "Should include performance pragmas");
      assert.ok(result.includes("CREATE TABLE customer"), "Should create customer table");
      assert.ok(result.includes("CREATE TABLE rental"), "Should create rental table");
      assert.ok(result.includes("CREATE TABLE video"), "Should create video table");
      assert.ok(result.includes("id INTEGER PRIMARY KEY"), "Should include ID column");
      assert.ok(result.includes("created_at TEXT NOT NULL"), "Should include timestamps");
      assert.ok(result.includes("CREATE INDEX"), "Should include indexes");
    });

    test("should respect includeFilePragmas option", () => {
      const withPragmas = generateSqlSchema(mockComponentsSchemas, { includeFilePragmas: true });
      const withoutPragmas = generateSqlSchema(mockComponentsSchemas, {
        includeFilePragmas: false,
      });

      assert.ok(withPragmas.includes("PRAGMA journal_mode"), "Should include pragmas when enabled");
      assert.ok(!withoutPragmas.includes("PRAGMA"), "Should not include pragmas when disabled");
    });

    test("should respect includeTimestamps option", () => {
      const withTimestamps = generateSqlSchema(mockComponentsSchemas, { includeTimestamps: true });
      const withoutTimestamps = generateSqlSchema(mockComponentsSchemas, {
        includeTimestamps: false,
      });

      assert.ok(
        withTimestamps.includes("created_at TEXT"),
        "Should include timestamps when enabled",
      );
      assert.ok(
        !withoutTimestamps.includes("created_at"),
        "Should not include timestamps when disabled",
      );
    });

    test("should respect includeIndexes option", () => {
      const withIndexes = generateSqlSchema(mockComponentsSchemas, { includeIndexes: true });
      const withoutIndexes = generateSqlSchema(mockComponentsSchemas, { includeIndexes: false });

      assert.ok(withIndexes.includes("CREATE INDEX"), "Should include indexes when enabled");
      assert.ok(
        !withoutIndexes.includes("CREATE INDEX"),
        "Should not include indexes when disabled",
      );
    });

    test("should respect useStrictMode option", () => {
      const strictMode = generateSqlSchema(mockComponentsSchemas, { useStrictMode: true });
      const normalMode = generateSqlSchema(mockComponentsSchemas, { useStrictMode: false });

      assert.ok(strictMode.includes("id TEXT PRIMARY KEY"), "Should use TEXT ID in strict mode");
      assert.ok(
        strictMode.includes("WITHOUT ROWID"),
        "Should include WITHOUT ROWID in strict mode",
      );
      assert.ok(
        normalMode.includes("id INTEGER PRIMARY KEY"),
        "Should use INTEGER ID in normal mode",
      );
      assert.ok(
        !normalMode.includes("WITHOUT ROWID"),
        "Should not include WITHOUT ROWID in normal mode",
      );
    });

    test("should handle tableNameMap option", () => {
      const options: SqlSchemaOptions = {
        tableNameMap: {
          Customer: "clients",
          Rental: "transactions",
        },
      };

      const result = generateSqlSchema(mockComponentsSchemas, options);

      assert.ok(
        result.includes("CREATE TABLE clients"),
        "Should use mapped table name for Customer",
      );
      assert.ok(
        result.includes("CREATE TABLE transactions"),
        "Should use mapped table name for Rental",
      );
      assert.ok(
        !result.includes("CREATE TABLE customer"),
        "Should not use original name when mapped",
      );
    });

    test("should handle excludeSchemas option", () => {
      const options: SqlSchemaOptions = {
        excludeSchemas: ["Customer", "Profile"],
      };

      const result = generateSqlSchema(mockComponentsSchemas, options);

      assert.ok(!result.includes("CREATE TABLE customer"), "Should exclude Customer schema");
      assert.ok(!result.includes("CREATE TABLE profile"), "Should exclude Profile schema");
      assert.ok(result.includes("CREATE TABLE rental"), "Should include non-excluded schemas");
      assert.ok(result.includes("CREATE TABLE video"), "Should include non-excluded schemas");
    });

    test("should handle includeSchemas option", () => {
      const options: SqlSchemaOptions = {
        includeSchemas: ["Customer", "Video"],
      };

      const result = generateSqlSchema(mockComponentsSchemas, options);

      assert.ok(result.includes("CREATE TABLE customer"), "Should include Customer schema");
      assert.ok(result.includes("CREATE TABLE video"), "Should include Video schema");
      assert.ok(!result.includes("CREATE TABLE rental"), "Should exclude non-included schemas");
      assert.ok(!result.includes("CREATE TABLE profile"), "Should exclude non-included schemas");
    });

    test("should handle empty schemas object", () => {
      const result = generateSqlSchema({});

      assert.ok(result.includes("PRAGMA journal_mode"), "Should still include pragmas");
      assert.ok(!result.includes("CREATE TABLE"), "Should not create any tables");
    });
  });

  describe("column generation", () => {
    test("should generate correct SQL types for different property types", () => {
      const testSchema = {
        type: "object",
        properties: {
          textField: { type: "string" },
          numberField: { type: "number" },
          integerField: { type: "integer" },
          booleanField: { type: "boolean" },
          dateField: { type: "string", format: "date" },
          datetimeField: { type: "string", format: "date-time" },
          uuidField: { type: "string", format: "uuid" },
          enumField: { type: "string", enum: ["a", "b", "c"] },
          arrayField: { type: "array" },
          objectField: { type: "object" },
        },
        required: ["textField", "numberField"],
      };

      const result = generateSqlSchema({ Test: testSchema });

      assert.ok(
        result.includes("text_field TEXT NOT NULL"),
        "Should generate TEXT for required string",
      );
      assert.ok(
        result.includes("number_field REAL NOT NULL"),
        "Should generate REAL for required number",
      );
      assert.ok(result.includes("integer_field INTEGER"), "Should generate INTEGER for integer");
      assert.ok(result.includes("boolean_field INTEGER"), "Should generate INTEGER for boolean");
      assert.ok(result.includes("date_field TEXT"), "Should generate TEXT for date");
      assert.ok(result.includes("datetime_field TEXT"), "Should generate TEXT for datetime");
      assert.ok(result.includes("uuid_field TEXT"), "Should generate TEXT for UUID");
      assert.ok(result.includes("enum_field TEXT"), "Should generate TEXT for enum");
      assert.ok(result.includes("array_field TEXT"), "Should generate TEXT for array (JSON)");
      assert.ok(result.includes("object_field TEXT"), "Should generate TEXT for object (JSON)");
    });

    test("should handle default values correctly", () => {
      const testSchema = {
        type: "object",
        properties: {
          stringDefault: { type: "string", default: "default_value" },
          numberDefault: { type: "number", default: 42 },
          booleanDefault: { type: "boolean", default: true },
          nullDefault: { type: "string", default: null },
        },
      };

      const result = generateSqlSchema({ Test: testSchema });

      assert.ok(result.includes("DEFAULT 'default_value'"), "Should handle string defaults");
      assert.ok(result.includes("DEFAULT 42"), "Should handle number defaults");
      assert.ok(result.includes("DEFAULT true"), "Should handle boolean defaults");
    });

    test("should escape single quotes in string defaults", () => {
      const testSchema = {
        type: "object",
        properties: {
          quotedString: { type: "string", default: "it's a test" },
        },
      };

      const result = generateSqlSchema({ Test: testSchema });

      assert.ok(
        result.includes("DEFAULT 'it''s a test'"),
        "Should escape single quotes in defaults",
      );
    });

    test("should convert property names to snake_case", () => {
      const testSchema = {
        type: "object",
        properties: {
          camelCaseField: { type: "string" },
          PascalCaseField: { type: "string" },
          already_snake_case: { type: "string" },
          mixedCASEfield: { type: "string" },
        },
      };

      const result = generateSqlSchema({ Test: testSchema });

      assert.ok(result.includes("camel_case_field TEXT"), "Should convert camelCase to snake_case");
      assert.ok(
        result.includes("pascal_case_field TEXT"),
        "Should convert PascalCase to snake_case",
      );
      assert.ok(result.includes("already_snake_case TEXT"), "Should preserve snake_case");
      assert.ok(result.includes("mixed_cas_efield TEXT"), "Should handle mixed case");
    });
  });

  describe("foreign key detection", () => {
    test("should detect foreign keys from $ref properties", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(
        result.includes("FOREIGN KEY (user_id) REFERENCES user(id)"),
        "Should detect foreign key from $ref",
      );
    });

    test("should detect foreign keys from Id suffix pattern", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(
        result.includes("FOREIGN KEY (customer_id) REFERENCES customer(id)"),
        "Should detect foreign key from customerId pattern",
      );
      assert.ok(
        result.includes("FOREIGN KEY (video_id) REFERENCES video(id)"),
        "Should detect foreign key from videoId pattern",
      );
    });
  });

  describe("index generation", () => {
    test("should generate indexes for foreign keys", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(result.includes("CREATE INDEX idx_rental_customer_id"), "Should index foreign key");
      assert.ok(result.includes("CREATE INDEX idx_rental_video_id"), "Should index foreign key");
    });

    test("should generate indexes for searchable fields", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(result.includes("CREATE INDEX idx_customer_name"), "Should index name field");
      assert.ok(result.includes("CREATE INDEX idx_video_title"), "Should index title field");
      assert.ok(
        result.includes("CREATE INDEX idx_video_description"),
        "Should index description field",
      );
    });

    test("should generate unique indexes for email fields", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(
        result.includes("CREATE UNIQUE INDEX idx_customer_email_unique"),
        "Should create unique index for email",
      );
    });

    test("should generate indexes for boolean fields", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(
        result.includes("CREATE INDEX idx_customer_is_active"),
        "Should index boolean field",
      );
      assert.ok(
        result.includes("CREATE INDEX idx_video_is_available"),
        "Should index boolean field",
      );
    });

    test("should generate indexes for enum fields", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(result.includes("CREATE INDEX idx_rental_status"), "Should index enum field");
      assert.ok(result.includes("CREATE INDEX idx_video_genre"), "Should index enum field");
    });

    test("should generate indexes for range fields", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      assert.ok(
        result.includes("CREATE INDEX idx_rental_rental_fee"),
        "Should index price-related field",
      );
      assert.ok(result.includes("CREATE INDEX idx_video_rating"), "Should index rating field");
      assert.ok(result.includes("CREATE INDEX idx_video_price"), "Should index price field");
    });

    test("should generate indexes for timestamp fields", () => {
      const withTimestamps = generateSqlSchema(mockComponentsSchemas, { includeTimestamps: true });

      assert.ok(
        withTimestamps.includes("CREATE INDEX idx_customer_created_at"),
        "Should index created_at",
      );
      assert.ok(
        withTimestamps.includes("CREATE INDEX idx_customer_updated_at"),
        "Should index updated_at",
      );
    });
  });

  describe("pragma generation", () => {
    test("should include all performance pragmas", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      const expectedPragmas = [
        "PRAGMA journal_mode = WAL",
        "PRAGMA synchronous = NORMAL",
        "PRAGMA cache_size = -64000",
        "PRAGMA foreign_keys = ON",
        "PRAGMA temp_store = MEMORY",
        "PRAGMA mmap_size = 268435456",
        "PRAGMA page_size = 4096",
        "PRAGMA auto_vacuum = INCREMENTAL",
        "PRAGMA busy_timeout = 5000",
      ];

      for (const pragma of expectedPragmas) {
        assert.ok(result.includes(pragma), `Should include pragma: ${pragma}`);
      }
    });
  });

  describe("generateSqlSchemaFile", () => {
    test("should write SQL schema to file", () => {
      const outputPath = path.join(tempDir, "schema.sql");

      generateSqlSchemaFile(mockComponentsSchemas, outputPath);

      assert.ok(fs.existsSync(outputPath), "Should create output file");

      const content = fs.readFileSync(outputPath, "utf8");
      assert.ok(content.includes("CREATE TABLE customer"), "Should write schema content");
      assert.ok(content.includes("PRAGMA journal_mode"), "Should write pragma content");
    });

    test("should create directory if it doesn't exist", () => {
      const nestedPath = path.join(tempDir, "nested", "dir", "schema.sql");

      generateSqlSchemaFile(mockComponentsSchemas, nestedPath);

      assert.ok(fs.existsSync(nestedPath), "Should create nested directories and file");
    });

    test("should pass options to generateSqlSchema", () => {
      const outputPath = path.join(tempDir, "schema.sql");
      const options: SqlSchemaOptions = {
        includeFilePragmas: false,
        includeTimestamps: false,
      };

      generateSqlSchemaFile(mockComponentsSchemas, outputPath, options);

      const content = fs.readFileSync(outputPath, "utf8");
      assert.ok(!content.includes("PRAGMA"), "Should respect includeFilePragmas option");
      assert.ok(!content.includes("created_at"), "Should respect includeTimestamps option");
    });
  });

  describe("loadComponentsSchemasFromFile", () => {
    test("should load schemas from valid OpenAPI file", () => {
      const openApiSpec = {
        openapi: "3.0.0",
        info: { title: "Test API", version: "1.0.0" },
        components: {
          schemas: mockComponentsSchemas,
        },
      };

      const filePath = path.join(tempDir, "openapi.json");
      fs.writeFileSync(filePath, JSON.stringify(openApiSpec, null, 2));

      const result = loadComponentsSchemasFromFile(filePath);

      assert.deepStrictEqual(result, mockComponentsSchemas, "Should load schemas correctly");
    });

    test("should handle file without components.schemas", () => {
      const openApiSpec = {
        openapi: "3.0.0",
        info: { title: "Test API", version: "1.0.0" },
      };

      const filePath = path.join(tempDir, "openapi.json");
      fs.writeFileSync(filePath, JSON.stringify(openApiSpec, null, 2));

      const result = loadComponentsSchemasFromFile(filePath);

      assert.deepStrictEqual(result, {}, "Should return empty object when no schemas");
    });

    test("should throw error for invalid JSON", () => {
      const filePath = path.join(tempDir, "invalid.json");
      fs.writeFileSync(filePath, "{ invalid json }");

      assert.throws(
        () => loadComponentsSchemasFromFile(filePath),
        /Failed to load OpenAPI schemas/,
        "Should throw error for invalid JSON",
      );
    });

    test("should throw error for non-existent file", () => {
      const filePath = path.join(tempDir, "nonexistent.json");

      assert.throws(
        () => loadComponentsSchemasFromFile(filePath),
        /Failed to load OpenAPI schemas/,
        "Should throw error for non-existent file",
      );
    });
  });

  describe("edge cases and error handling", () => {
    test("should handle schema without properties", () => {
      const schemaWithoutProps = {
        SimpleSchema: { type: "object" },
      };

      const result = generateSqlSchema(schemaWithoutProps);

      assert.ok(result.includes("CREATE TABLE simple_schema"), "Should create table");
      assert.ok(result.includes("id INTEGER PRIMARY KEY"), "Should include ID column");
    });

    test("should handle schema with no required fields", () => {
      const schemaWithoutRequired = {
        OptionalSchema: {
          type: "object",
          properties: {
            optionalField: { type: "string" },
            anotherField: { type: "integer" },
          },
        },
      };

      const result = generateSqlSchema(schemaWithoutRequired, { includeTimestamps: false });

      assert.ok(!result.includes("NOT NULL"), "Should not include NOT NULL for optional fields");
    });

    test("should handle complex nested schemas", () => {
      const nestedSchema = {
        ComplexSchema: {
          type: "object",
          properties: {
            nestedObject: {
              type: "object",
              properties: {
                innerField: { type: "string" },
              },
            },
            arrayOfObjects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemField: { type: "string" },
                },
              },
            },
          },
        },
      };

      const result = generateSqlSchema(nestedSchema);

      assert.ok(result.includes("nested_object TEXT"), "Should handle nested objects as TEXT");
      assert.ok(result.includes("array_of_objects TEXT"), "Should handle arrays as TEXT");
    });

    test("should handle schemas with unknown property types", () => {
      const unknownTypeSchema = {
        UnknownSchema: {
          type: "object",
          properties: {
            unknownField: { type: "unknown_type" },
            missingType: { description: "field without type" },
          },
        },
      };

      const result = generateSqlSchema(unknownTypeSchema);

      assert.ok(result.includes("unknown_field TEXT"), "Should default unknown types to TEXT");
      assert.ok(result.includes("missing_type TEXT"), "Should default missing types to TEXT");
    });
  });

  describe("integration tests", () => {
    test("should generate complete working SQL schema", () => {
      const result = generateSqlSchema(mockComponentsSchemas);

      // Verify the complete schema structure
      const lines = result.split("\n");
      const pragmaLines = lines.filter((line) => line.includes("PRAGMA"));
      const tableLines = lines.filter((line) => line.includes("CREATE TABLE"));
      const indexLines = lines.filter((line) => line.includes("CREATE INDEX"));

      assert.ok(pragmaLines.length >= 9, "Should include all performance pragmas");
      assert.strictEqual(tableLines.length, 4, "Should create all 4 tables");
      assert.ok(indexLines.length > 10, "Should create multiple indexes");

      // Verify no syntax errors in generated SQL (basic check)
      assert.ok(!result.includes("undefined"), "Should not contain undefined values");
      assert.ok(!result.includes("null"), "Should not contain null values");
      assert.ok(result.includes(");"), "Should properly close table definitions");
    });

    test("should work with minimal schema", () => {
      const minimalSchema = {
        Simple: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
      };

      const result = generateSqlSchema(minimalSchema, {
        includeFilePragmas: false,
        includeTimestamps: false,
        includeIndexes: false,
      });

      const expectedTable = `CREATE TABLE simple (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);`;

      assert.ok(result.includes(expectedTable), "Should generate minimal table correctly");
    });
  });
});
