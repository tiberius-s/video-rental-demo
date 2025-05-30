# Video Rental Demo

Technical demo exploring npm workspaces, TypeSpec, and OpenAPI by implementing a video rental store with Domain-Driven Design principles, focused on core business workflows.

## Architecture

This project demonstrates:

- **TypeSpec** for API-first development with streamlined OpenAPI generation
- **Domain-Driven Design** patterns focusing on essential business logic
- **npm workspaces** for monorepo management
- **Type-safe database operations** with better-sqlite3
- **Modern Node.js testing** with built-in test runner

## Domain-First Development Workflow

This project implements a comprehensive **domain-first development workflow** where the domain package serves as the single source of truth for:

### 📦 **Package Dependencies & Exports**

- **Domain Package** (`@video-rental/domain`)

  - Exports OpenAPI specification as importable module
  - Provides TypeScript utilities for spec loading and caching
  - Generates SQL schema from domain models
  - Single source of truth for business models

- **API Package** (`@video-rental/api`)

  - Imports domain package: `import { getOpenApiSpec } from "@video-rental/domain"`
  - Uses OpenAPI spec for endpoint documentation and validation
  - Extracts runtime models from OpenAPI components/schema

- **DB Package** (`@video-rental/db`)
  - Imports domain package for schema generation
  - Uses generated `init.sql` to initialize SQLite database
  - Type-safe database operations based on domain models

### 🔄 **Build Process**

**Sequential Build Order**: `domain` → `db` → `api`

```bash
# Root-level build (builds all packages in correct order)
npm run build

# Individual package builds
npm run build --workspace @video-rental/domain  # TypeSpec + TypeScript
npm run build --workspace @video-rental/db      # Uses domain types
npm run build --workspace @video-rental/api     # Uses domain spec
```

### 📁 **Compilation Strategy**

**Domain Package Build Process**:

1. **TypeSpec Compilation**: `npm run build:tsp`

   - Generates OpenAPI spec to `tsp-output/@typespec/openapi3/openapi.json`
   - Validates TypeSpec models and generates documentation

2. **TypeScript Compilation**: `npm run build:ts`
   - Compiles TypeScript utilities to `dist/`
   - Generates type declarations for other packages
   - Excludes TypeSpec files to prevent compilation conflicts

**Key Configuration**:

- All TypeScript projects compile **only to `dist/`** folder
- No compiled files in `src/` directories
- TypeScript project references ensure proper dependency resolution
- `composite: true` enables incremental builds across packages

### 🚀 **Workflow Benefits**

✅ **Single Source of Truth**: Domain models define API, database, and business logic
✅ **Type Safety**: Full TypeScript integration across all packages
✅ **Automatic Code Generation**: OpenAPI specs and SQL schemas generated from domain
✅ **Development Workflow**: Domain changes automatically propagate to API and DB
✅ **Documentation**: Business workflows and API docs stay in sync with code
✅ **Validation**: TypeSpec ensures model consistency and API contract compliance

## Domain Focus

✅ **Essential Features:**

- Video rental process (rent → pay → return)
- Customer management with employee discounts
- Inventory tracking and availability
- Payment processing with late fees
- Basic employee management

## Packages

### 🎯 **Domain Package** - `@video-rental/domain`

#### Single source of truth for business models and API contracts

**Exports:**

- `getOpenApiSpec()` - OpenAPI specification loader with caching
- `generateSqlSchema()` - SQL schema generation from domain models
- `generateSqlSchemaFile()` - Generate SQL schema file from domain models
- TypeScript domain utilities and type definitions

**Features:**

- TypeSpec domain models with comprehensive business rules
- OpenAPI 3.0 specification generation
- Domain-Driven Design patterns and value objects
- Business workflow documentation with Mermaid diagrams

**Build Output:**

- `dist/` - Compiled TypeScript utilities
- `tsp-output/@typespec/openapi3/openapi.json` - Generated OpenAPI spec

### 🔌 **API Package** - `@video-rental/api`

#### REST API implementation using domain contracts

**Dependencies:**

- Imports from `@video-rental/domain`
- Uses OpenAPI spec for endpoint documentation
- Extracts runtime models from OpenAPI components/schema

**Features:**

- Express.js REST API server
- OpenAPI-driven endpoint generation
- Request/response validation (planned)
- Authentication and middleware

### 🗄️ **DB Package** - `@video-rental/db`

_Database layer with type-safe operations_

**Dependencies:**

- Imports from `@video-rental/domain`
- Uses generated SQL schema for database initialization
- Type-safe operations based on domain models

**Features:**

- SQLite database with better-sqlite3
- Generated `init.sql` from domain models
- Type-safe database operations
- Migration and seeding utilities

## Quick Start

```bash
# Install dependencies for all workspaces
npm install

# Build all packages in correct order (domain → db → api)
npm run build

# Generate OpenAPI specification from TypeSpec
npm run tsp:compile

# Format and lint code
npm run format && npm run lint
```

## Development Workflow Examples

### 🔄 **Typical Development Flow**

1. **Modify Domain Models** (TypeSpec in `packages/domain/lib/`)
2. **Rebuild Domain Package** to generate new OpenAPI spec
3. **Update API Package** to use new domain contracts
4. **Update DB Package** to reflect schema changes

```bash
# After modifying TypeSpec models - rebuild domain package
npm run build --workspace @video-rental/domain

# API package automatically gets updated domain types
npm run build --workspace @video-rental/api

# DB package gets updated schema
npm run build --workspace @video-rental/db
```

### 📝 **Adding New Business Models**

1. **Define TypeSpec Model** in `packages/domain/lib/models/`
2. **Add to Routes** in `packages/domain/lib/routes.tsp`
3. **Generate OpenAPI** with `npm run build:tsp --workspace @video-rental/domain`
4. **Import in API** using `import { getOpenApiSpec } from "@video-rental/domain"`

### 🗄️ **Database Schema Updates**

```bash
# Use domain package utilities to generate SQL schema
import { generateSqlSchemaFile } from "@video-rental/domain"
generateSqlSchemaFile("./path/to/schema.sql")

# Rebuild DB package to incorporate new schema
npm run build --workspace @video-rental/db
```

### 🔍 **Checking Domain-API Integration**

```bash
# Start with clean build
npm run clean
npm run build

# Test cross-package imports work correctly
npm run build --workspace @video-rental/api
```

## Helpful Commands

### Building and Development

```bash
# Build all packages (root-level build)
npm run build

# Build a specific package
npm run build --workspace @video-rental/db
npm run build --workspace @video-rental/api
npm run build --workspace @video-rental/domain

# Clean all build artifacts
npm run clean
```

### TypeSpec Development

```bash
# Compile TypeSpec to OpenAPI (domain package)
npm run tsp:compile

# Watch mode for TypeSpec development
npm run tsp:watch

# Format TypeSpec files
npm run tsp:format

# Validate TypeSpec without generating output
npm run tsp:validate

# Generate OpenAPI documentation
npm run docs:generate

# Development mode for domain package
npm run dev
```

### Code Quality

```bash
# Format all code (Prettier + TypeSpec)
npm run format

# Check formatting without changes
npm run format:check

# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix

# Fix both formatting and linting
npm run lint:fix && npm run format
```

## Package Management

```bash
# Install dependencies for all workspaces
npm install

# Install a dependency in a specific workspace
npm install package-name --workspace @video-rental/api

# Install a dev dependency in a specific workspace
npm install -D package-name --workspace @video-rental/db

# Run a script in a specific workspace
npm run script-name --workspace @video-rental/api

# List all workspaces
npm query .workspace

# Get info about a specific workspace
npm query .workspace[name="@video-rental/db"]
```

### TypeSpec (Domain Package)

```bash
# Generate OpenAPI specs from TypeSpec
npm run tsp:compile --workspace @video-rental/domain

# Watch TypeSpec files for changes
npm run tsp:watch --workspace @video-rental/domain
```

## Domain Documentation

The domain package contains comprehensive documentation about the business model and implementation:

- **[ERD.md](diagrams/ERD.md)** - Entity Relationship Diagram with Mermaid visualizations
- **[DDD-IMPLEMENTATION.md](diagrams/DDD-IMPLEMENTATION.md)** - Domain-Driven Design patterns and architecture
- **[Generated OpenAPI Spec](packages/domain/tsp-output/@typespec/openapi3/openapi.json)** - Complete API specification

### Workflow Documentation

Comprehensive business workflow diagrams with Mermaid flowcharts covering all essential operations:

- **[Workflow Overview](diagrams/workflows/README.md)** - Complete workflow documentation index with integration map
- **[Customer Registration & Management](diagrams/workflows/01-customer-registration-workflow.md)** - Customer lifecycle with employee discount linking
- **[Video Catalog Management](diagrams/workflows/02-video-catalog-management-workflow.md)** - Video title management with availability calculations
- **[Rental Creation Workflow](diagrams/workflows/03-rental-creation-workflow.md)** - Core business transaction with multi-step validation
- **[Return Processing Workflow](diagrams/workflows/04-return-processing-workflow.md)** - Copy inspection, late fees, and completion
- **[Overdue Management Workflow](diagrams/workflows/05-overdue-management-workflow.md)** - Automated detection with customer communication
- **[Payment Processing Workflow](diagrams/workflows/06-payment-processing-workflow.md)** - Multi-method payment handling with employee discounts
- **[Inventory Management Workflow](diagrams/workflows/07-inventory-management-workflow.md)** - Physical copy tracking and maintenance
- **[Employee Discount Processing](diagrams/workflows/08-employee-discount-processing-workflow.md)** - Role-based discount calculation and audit tracking

### Key Features

- **Simplified domain model** - Direct customer information without composition patterns
- **Customer discount support** - Configurable discount percentages per customer
- **Streamlined business rules** - Late fees, customer discounts, simplified inventory tracking
- **Type-safe value objects** - Address, Email, PhoneNumber, Money, RentalPeriod with validation
- **Rich OpenAPI documentation** - Generated from TypeSpec with full business context
- **Complete workflow coverage** - 8 essential business processes with Mermaid flowcharts
- **Multi-payment method support** - Cash, credit/debit cards, checks, gift cards
- **Real-time availability** - Dynamic inventory tracking with simplified condition management

## Workflow Architecture Summary

### 🏗️ **Domain-First Development Pattern**

This project implements a **domain-first monorepo architecture** where:

1. **Domain Package** (`@video-rental/domain`) serves as the single source of truth
2. **API Package** (`@video-rental/api`) imports domain contracts and implements REST endpoints
3. **DB Package** (`@video-rental/db`) imports domain models and generates database schema

### 📦 **Package Dependency Graph**

```
Domain Package (TypeSpec + TypeScript)
    ├── Exports: getOpenApiSpec(), generateSqlSchema()
    ├── Generates: OpenAPI spec, Type declarations
    └── Used by: ↓
        ├── API Package → Import domain contracts
        └── DB Package  → Import schema generators
```

### 🔄 **Build & Development Flow**

```bash
# 1. Domain changes trigger cascade updates
npm run build --workspace @video-rental/domain

# 2. API package gets updated contracts automatically
npm run build --workspace @video-rental/api

# 3. DB package gets updated schema
npm run build --workspace @video-rental/db

# Or build all at once in correct order:
npm run build:all                     # domain → db → api
```

**Key Benefits:**

- ✅ **Single Source of Truth**: Domain models define everything
- ✅ **Type Safety**: Full TypeScript integration across packages
- ✅ **Automatic Propagation**: Domain changes update API and DB automatically
- ✅ **Clean Architecture**: Clear separation of concerns with defined interfaces

## Project Structure

```text
video-rental-demo/
├── diagrams/            # Business documentation and workflow diagrams
│   ├── workflows/       # Complete workflow documentation with Mermaid flowcharts
│   ├── ERD.md          # Entity relationship documentation
│   ├── DDD-IMPLEMENTATION.md # Domain-driven design patterns
│   └── README.md       # Documentation overview
├── packages/
│   ├── domain/          # TypeSpec models, DDD patterns, OpenAPI generation
│   │   ├── lib/         # TypeSpec source files
│   │   ├── src/         # TypeScript domain logic
│   │   └── tsp-output/  # Generated OpenAPI specifications
│   ├── db/              # Database layer with type-safe operations
│   └── api/             # REST API implementation (planned)
├── package.json         # Root workspace configuration
└── readme.md           # This file
```

## Next Steps

The domain-first development workflow is now **fully implemented and functional**:

### ✅ **Completed Infrastructure**

1. **✅ Domain Package Exports**: OpenAPI spec and utilities available as importable modules
2. **✅ TypeScript Project References**: All packages can import from domain with full type safety
3. **✅ Sequential Build Process**: `npm run build:all` builds packages in correct dependency order
4. **✅ Clean Compilation**: All TypeScript compiles only to `dist/`, TypeSpec generates to `tsp-output/`
5. **✅ Module Resolution**: API and DB packages successfully import from `@video-rental/domain`

### 🚀 **Ready for Implementation**

The domain is now ready for:

1. **🔌 API Implementation**: Using the generated OpenAPI specification and domain imports

   ```typescript
   import { getOpenApiSpec } from "@video-rental/domain";
   const spec = await getOpenApiSpec();
   ```

2. **🗄️ Database Integration**: Type-safe operations with domain-generated schemas

   ```typescript
   import { generateSqlSchema } from "@video-rental/domain/codegen";
   const schema = generateSqlSchema();
   ```

3. **🎨 Frontend Development**: Clear API contract with comprehensive business context
4. **🧪 Testing**: Domain models and business workflows ready for testing
5. **📋 Workflow Implementation**: Complete business process documentation available

### 🛠️ **Implementation Roadmap**

- **Phase 1**: Core API endpoints based on OpenAPI spec and workflow documentation
- **Phase 2**: Database schema implementation with proper relationships using domain codegen
- **Phase 3**: Business logic implementation following DDD patterns from domain package
- **Phase 4**: Frontend application consuming the REST API with full type safety

### 🔗 **Workflow Integration Points**

- **Domain Changes**: Modify TypeSpec → rebuild → API/DB automatically get updates
- **API Development**: Import domain utilities → use OpenAPI spec → implement endpoints
- **Database Development**: Import domain codegen → generate schema → implement operations
- **Testing**: Use domain testing utilities → validate business rules → test workflows
