# Video Rental Demo

Technical demo exploring npm workspaces, TypeSpec, and OpenAPI by implementing a video rental store with Domain-Driven Design principles, focused on core business workflows.

## Architecture

This project demonstrates:

- **TypeSpec** for API-first development with streamlined OpenAPI generation
- **Domain-Driven Design** patterns focusing on essential business logic
- **npm workspaces** for monorepo management
- **Type-safe database operations** with better-sqlite3
- **Modern Node.js testing** with built-in test runner

## Domain Focus

✅ **Essential Features:**

- Video rental process (rent → pay → return)
- Customer management with employee discounts
- Inventory tracking and availability
- Payment processing with late fees
- Basic employee management

## Packages

- **`@video-rental/domain`** - TypeSpec domain models, DDD patterns, and OpenAPI specification
- **`@video-rental/db`** - Database layer with type-safe operations
- **`@video-rental/api`** - REST API implementation (planned)

## Quick Start

```bash
# Install dependencies for all workspaces
npm install

# Build all packages
npm run build:all

# Generate OpenAPI specification from TypeSpec
npm run tsp:compile

# Run all tests
npm test
```

## Helpful Commands

### Building and Development

```bash
# Build all packages (root-level build)
npm run build

# Build all packages (each individual workspace)
npm run build:all

# Build a specific package
npm run build --workspace @video-rental/db
npm run build --workspace @video-rental/api
npm run build --workspace @video-rental/domain

# Clean all build artifacts (root-level clean)
npm run clean

# Clean all build artifacts (each individual workspace)
npm run clean:all

# Clean and rebuild everything
npm run rebuild
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
npm run dev:domain
```

### Testing

```bash
# Run all tests
npm test

# Run tests for all packages
npm run test:all

# Run tests for specific packages
npm run test:db
npm run test:api
npm run test:domain

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with different reporters
npm run test:reporter        # spec format
npm run test:reporter:json   # JSON format
npm run test:reporter:junit  # JUnit XML format

# Run only tests marked with 'only'
npm run test:only

# Run tests in parallel
npm run test:parallel
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

# Check both formatting and linting
npm run check

# Fix both formatting and linting
npm run fix

# Run quality checks for all workspaces
npm run format:all
npm run lint:all
```

### Workspace Management

```bash
# Install dependencies in all workspaces
npm run workspace:install

# Update dependencies in all workspaces
npm run workspace:update

# Check for outdated dependencies
npm run workspace:outdated

# List all workspace packages
npm run workspace:list

# Run a command in a specific workspace
npm run <command> --workspace @video-rental/domain
npm run <command> --workspace @video-rental/db
npm run <command> --workspace @video-rental/api
```

### Development Workflows

```bash
# Start development mode for domain (TypeSpec watch)
npm run dev:domain

# Start development mode for database (TypeScript watch)
npm run dev:db

# Full development setup
npm run build:all && npm run tsp:watch

# Quality check before commit
npm run check && npm test

# Full rebuild and test
npm run rebuild && npm run test:all
```

### Linting and Formatting

```bash
# Root-level formatting commands
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting without modifying files

# Workspace-level formatting commands
npm run format:all       # Run format in each workspace
npm run format:check:all # Run format checking in each workspace

# Root-level linting commands
npm run lint             # Lint all packages
npm run lint:fix         # Fix linting issues
npm run lint:check       # Lint with zero warnings

# Workspace-level linting commands
npm run lint:all         # Run lint in each workspace
npm run lint:fix:all     # Fix linting issues in each workspace

# Combined check and fix commands
npm run check            # Run formatting and linting checks
npm run fix              # Fix formatting and linting issues
```

## Package Management

```bash
# Install dependencies for all workspaces
npm install

# Install a dependency in a specific workspace
npm install package-name --w @video-rental/api

# Install a dev dependency in a specific workspace
npm install -D package-name --w @video-rental/db

# Run a script in a specific workspace
npm run script-name --w @video-rental/api

# List all workspaces
npm query .workspace

# Get info about a specific workspace
npm query .workspace[name="@video-rental/db"]
```

### TypeSpec (Domain Package)

```bash
# Generate OpenAPI specs from TypeSpec
npm run tsp:compile --w @video-rental/domain

# Watch TypeSpec files for changes
npm run tsp:watch --w @video-rental/domain
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

- **PersonBase composition** - Shared personal information model used by Customer and Employee
- **Employee role hierarchy** - Manager → Shift Supervisor → Clerk with role-based discount rates (25%/20%/15%)
- **Comprehensive business rules** - Late fees, employee discounts, inventory tracking, overdue management
- **Type-safe value objects** - Address, Email, PhoneNumber, Money, RentalPeriod with validation
- **Rich OpenAPI documentation** - Generated from TypeSpec with full business context
- **Complete workflow coverage** - 8 essential business processes with Mermaid flowcharts
- **Multi-payment method support** - Cash, credit/debit cards, checks, gift cards
- **Real-time availability** - Dynamic inventory tracking with condition-based calculations

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

The domain is now ready for:

1. ✅ **API Implementation**: Using the generated OpenAPI specification
2. ✅ **Database Integration**: Type-safe operations with the domain models
3. ✅ **Frontend Development**: Clear API contract with business context
4. ✅ **Testing**: Comprehensive testing of core business workflows
5. ✅ **Workflow Implementation**: Complete business process documentation available

### Implementation Roadmap

- **Phase 1**: Core API endpoints based on workflow documentation
- **Phase 2**: Database schema implementation with proper relationships
- **Phase 3**: Business logic implementation following DDD patterns
- **Phase 4**: Frontend application consuming the REST API
