import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

export type OpenApiComponentsSchemas = Record<string, any>;

export interface SqlSchemaOptions {
  includeFilePragmas?: boolean;
  includeTimestamps?: boolean;
  includeIndexes?: boolean;
  useStrictMode?: boolean;
  tableNameMap?: Record<string, string>;
  excludeSchemas?: string[];
  includeSchemas?: string[];
}

const SQLITE_TYPES = {
  string: "TEXT",
  integer: "INTEGER",
  number: "REAL",
  boolean: "INTEGER",
  array: "TEXT",
  object: "TEXT",
} as const;

/**
 * Generate SQLite schema from OpenAPI component schemas
 */
export function generateSqlSchema(
  componentsSchemas: OpenApiComponentsSchemas,
  options: SqlSchemaOptions = {},
): string {
  const {
    includeFilePragmas = true,
    includeTimestamps = true,
    includeIndexes = true,
    useStrictMode = false,
    tableNameMap = {},
    excludeSchemas = [],
    includeSchemas = [],
  } = options;

  const schemas = filterSchemas(componentsSchemas, includeSchemas, excludeSchemas);
  const result: string[] = [];

  if (includeFilePragmas) {
    result.push(generatePragmas());
  }

  const tables: Array<{ name: string; schema: any }> = [];

  // Generate tables
  for (const [schemaName, schema] of Object.entries(schemas)) {
    const tableName = tableNameMap[schemaName] || toSnakeCase(schemaName);
    tables.push({ name: tableName, schema });
    result.push(generateTable(tableName, schema, { includeTimestamps, useStrictMode }));
  }

  // Generate indexes
  if (includeIndexes) {
    for (const { name: tableName, schema } of tables) {
      const indexes = generateIndexes(tableName, schema, includeTimestamps);
      if (indexes) result.push(indexes);
    }
  }

  return result.join("\n\n");
}

/**
 * Generate SQLite pragmas for optimal file-based database performance
 * Based on best practices from SQLite documentation and community recommendations
 */
function generatePragmas(): string {
  return `-- SQLite performance and reliability pragmas
PRAGMA journal_mode = WAL;           -- Write-Ahead Logging for better concurrency
PRAGMA synchronous = NORMAL;         -- Balance between safety and performance
PRAGMA cache_size = -64000;          -- 64MB cache size (negative = KB)
PRAGMA foreign_keys = ON;            -- Enable foreign key constraints
PRAGMA temp_store = MEMORY;          -- Store temporary tables in memory
PRAGMA mmap_size = 268435456;        -- 256MB memory-mapped I/O
PRAGMA page_size = 4096;             -- Optimal page size for most systems
PRAGMA auto_vacuum = INCREMENTAL;    -- Prevent database bloat over time
PRAGMA busy_timeout = 5000;          -- 5 second timeout for lock conflicts`;
}

function generateTable(
  tableName: string,
  schema: any,
  options: { includeTimestamps: boolean; useStrictMode: boolean },
): string {
  const { includeTimestamps, useStrictMode } = options;
  const columns: string[] = [];
  const foreignKeys: string[] = [];

  // Add ID column - use different approach for strict mode
  if (useStrictMode) {
    // For WITHOUT ROWID tables, use a proper primary key
    columns.push("  id TEXT PRIMARY KEY");
  } else {
    columns.push("  id INTEGER PRIMARY KEY");
  }

  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      // Skip 'id' property since we already add it as PRIMARY KEY
      if (propName === "id") continue;

      // Skip timestamp properties - either when we're adding them automatically,
      // or when timestamps are disabled entirely
      const columnName = toSnakeCase(propName);
      if (columnName === "created_at" || columnName === "updated_at") {
        continue;
      }

      const column = generateColumn(propName, propSchema as any, schema.required || []);
      columns.push(`  ${column}`);

      // Detect foreign keys
      const fk = detectForeignKey(propName, propSchema as any);
      if (fk) foreignKeys.push(`  ${fk}`);
    }
  }

  if (includeTimestamps) {
    columns.push("  created_at TEXT NOT NULL DEFAULT (datetime('now'))");
    columns.push("  updated_at TEXT NOT NULL DEFAULT (datetime('now'))");
  }

  const allConstraints = [...columns, ...foreignKeys];
  const withoutRowId = useStrictMode ? " WITHOUT ROWID" : "";

  return `CREATE TABLE ${tableName} (
${allConstraints.join(",\n")}
)${withoutRowId};`;
}

function generateColumn(propName: string, propSchema: any, required: string[]): string {
  const columnName = toSnakeCase(propName);
  const sqlType = getSqliteType(propSchema);
  const isRequired = required.includes(propName) || required.includes(columnName);
  const notNull = isRequired ? " NOT NULL" : "";
  const defaultValue = getDefaultValue(propSchema);

  return `${columnName} ${sqlType}${notNull}${defaultValue}`;
}

function getSqliteType(schema: any): string {
  if (schema.$ref) return "INTEGER"; // Foreign key reference

  if (schema.type === "string") {
    if (schema.format === "date-time" || schema.format === "date") return "TEXT";
    if (schema.format === "uuid") return "TEXT";
    return "TEXT";
  }

  if (schema.enum) return "TEXT";
  if (schema.type === "array" || schema.type === "object") return "TEXT"; // JSON

  return SQLITE_TYPES[schema.type as keyof typeof SQLITE_TYPES] || "TEXT";
}

function getDefaultValue(schema: any): string {
  if (schema.default === undefined) return "";

  if (typeof schema.default === "string") {
    return ` DEFAULT '${schema.default.replace(/'/g, "''")}'`;
  }
  return ` DEFAULT ${schema.default}`;
}

function detectForeignKey(propName: string, propSchema: any): string | null {
  // Foreign key patterns: ends with 'Id' or has $ref
  if (propSchema.$ref) {
    const referencedTable = extractTableFromRef(propSchema.$ref);
    if (referencedTable) {
      return `FOREIGN KEY (${toSnakeCase(propName)}) REFERENCES ${referencedTable}(id)`;
    }
  }

  if (propName.endsWith("Id") && propSchema.type === "integer") {
    const referencedTable = toSnakeCase(propName.slice(0, -2)); // Remove 'Id'
    return `FOREIGN KEY (${toSnakeCase(propName)}) REFERENCES ${referencedTable}(id)`;
  }

  return null;
}

function extractTableFromRef(ref: string): string | null {
  // Extract table name from $ref like "#/components/schemas/Customer"
  const match = ref.match(/\/([^/]+)$/);
  return match ? toSnakeCase(match[1]) : null;
}

function generateIndexes(tableName: string, schema: any, includeTimestamps: boolean): string {
  const indexes: string[] = [];

  // Skip creating indexes for certain schemas that don't need them
  if (shouldSkipIndexes(tableName)) {
    return "";
  }

  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const columnName = toSnakeCase(propName);
      const prop = propSchema as any;

      // Index foreign keys (highest priority for query performance)
      if (prop.$ref || (prop.type === "integer" && propName.endsWith("Id"))) {
        indexes.push(
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_${columnName} ON ${tableName}(${columnName});`,
        );
      }

      // Index business status/state fields for filtering (critical for business queries)
      if (isBusinessStatusField(propName, prop)) {
        indexes.push(
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_${columnName} ON ${tableName}(${columnName});`,
        );
      }

      // Index unique email fields with unique constraint
      if (prop.format === "email" || propName.toLowerCase() === "email") {
        indexes.push(
          `CREATE UNIQUE INDEX IF NOT EXISTS idx_${tableName}_${columnName}_unique ON ${tableName}(${columnName});`,
        );
      }

      // Index specific searchable fields based on actual API patterns
      if (isApiSearchableField(tableName, propName, prop)) {
        indexes.push(
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_${columnName} ON ${tableName}(${columnName});`,
        );
      }

      // Index specific business fields for filtering based on API usage patterns
      if (isApiFilterField(tableName, propName, prop)) {
        indexes.push(
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_${columnName} ON ${tableName}(${columnName});`,
        );
      }

      // Index date fields that are used for business logic (due dates, rental dates)
      if (isBusinessDateField(tableName, propName, prop)) {
        indexes.push(
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_${columnName} ON ${tableName}(${columnName});`,
        );
      }
    }
  }

  // Only add timestamp indexes for core business tables, not for every schema
  if (includeTimestamps && isCoreBusinessTable(tableName)) {
    // Skip timestamp indexes - they're rarely used in this business domain
  }

  return indexes.join("\n");
}

/**
 * Check if table should skip index generation entirely
 */
function shouldSkipIndexes(tableName: string): boolean {
  // Skip indexes for value objects, update schemas, and other non-core tables
  const skipPatterns = [
    "value_objects.",
    "_create",
    "_update",
    "health_response",
    "api_documentation",
  ];
  return skipPatterns.some((pattern) => tableName.includes(pattern));
}

/**
 * Check if this is a core business table that might need additional indexing
 */
function isCoreBusinessTable(tableName: string): boolean {
  // Skip utility/metadata tables and focus on core business entities
  const utilityPatterns = [
    "value_objects.",
    "_create",
    "_update",
    "health_response",
    "api_documentation",
    "metadata",
    "config",
    "settings",
    "log",
    "audit",
    "temp",
    "cache",
  ];

  const isUtilityTable = utilityPatterns.some((pattern) => tableName.includes(pattern));

  // Core business tables are non-utility tables that likely contain primary business data
  return !isUtilityTable && tableName.length > 2; // Exclude very short names that might be lookup tables
}

/**
 * Check if field is a business status/state field used for filtering
 */
function isBusinessStatusField(fieldName: string, propSchema: any): boolean {
  // Status/state fields that are used in API queries
  const statusFieldNames = ["status", "condition", "state"];
  const isStatusField = statusFieldNames.some((pattern) =>
    fieldName.toLowerCase().includes(pattern),
  );

  // Only create indexes for enum status fields (not free text)
  // Enum fields have limited values and are ideal for indexing
  return isStatusField && propSchema.enum && Array.isArray(propSchema.enum);
}

/**
 * Check if field is searchable based on common naming patterns
 */
function isApiSearchableField(tableName: string, fieldName: string, propSchema: any): boolean {
  // Only index search fields that are text and likely to be searched
  if (propSchema.type !== "string") return false;

  // Common searchable field patterns across domains
  const searchablePatterns = [
    "title",
    "name",
    "description",
    "subject",
    "content",
    "label",
    "caption",
    "summary",
    "text",
  ];

  const fieldLower = fieldName.toLowerCase();
  return searchablePatterns.some((pattern) => fieldLower.includes(pattern));
}

/**
 * Check if field is used for filtering based on common patterns
 */
function isApiFilterField(tableName: string, fieldName: string, propSchema: any): boolean {
  // Common filterable field patterns
  const filterablePatterns = [
    "type",
    "category",
    "genre",
    "method",
    "mode",
    "kind",
    "class",
    "group",
    "level",
    "priority",
    "rating",
  ];

  const fieldLower = fieldName.toLowerCase();
  const isFilterablePattern = filterablePatterns.some((pattern) => fieldLower.includes(pattern));

  // Only index enum or string fields that are likely filtered
  return isFilterablePattern && (propSchema.enum || propSchema.type === "string");
}

/**
 * Check if field is a business date field used in queries
 */
function isBusinessDateField(tableName: string, fieldName: string, propSchema: any): boolean {
  // Only index date/datetime fields
  const isDateField =
    propSchema.type === "string" &&
    (propSchema.format === "date" || propSchema.format === "date-time");

  if (!isDateField) return false;

  // Common business date patterns that are likely to be queried
  const businessDatePatterns = [
    "due",
    "start",
    "end",
    "created",
    "updated",
    "modified",
    "published",
    "scheduled",
    "expires",
    "effective",
    "valid",
    "birth",
    "hire",
    "member",
    "joined",
    "registered",
  ];

  const fieldLower = fieldName.toLowerCase();
  return businessDatePatterns.some((pattern) => fieldLower.includes(pattern));
}

/**
 * Filter schemas based on include/exclude lists
 */
function filterSchemas(
  schemas: OpenApiComponentsSchemas,
  includeSchemas: string[],
  excludeSchemas: string[],
): OpenApiComponentsSchemas {
  let filtered = { ...schemas };

  // Apply include filter
  if (includeSchemas.length > 0) {
    filtered = Object.fromEntries(
      Object.entries(filtered).filter(([name]) => includeSchemas.includes(name)),
    );
  }

  // Apply exclude filter
  if (excludeSchemas.length > 0) {
    filtered = Object.fromEntries(
      Object.entries(filtered).filter(([name]) => !excludeSchemas.includes(name)),
    );
  }

  return filtered;
}

/**
 * Write SQL schema to file
 */
export function generateSqlSchemaFile(
  componentsSchemas: OpenApiComponentsSchemas,
  outputPath: string,
  options: SqlSchemaOptions = {},
): void {
  const sqlSchema = generateSqlSchema(componentsSchemas, options);

  // Ensure directory exists
  mkdirSync(dirname(outputPath), { recursive: true });

  // Write schema to file
  writeFileSync(outputPath, sqlSchema, "utf8");
}

/**
 * Load OpenAPI component schemas from a file
 */
export function loadComponentsSchemasFromFile(filePath: string): OpenApiComponentsSchemas {
  try {
    const content = readFileSync(filePath, "utf8");
    const openApiSpec = JSON.parse(content);
    return openApiSpec.components?.schemas || {};
  } catch (error) {
    throw new Error(`Failed to load OpenAPI schemas from ${filePath}: ${error}`);
  }
}

/**
 * Convert PascalCase/camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}
