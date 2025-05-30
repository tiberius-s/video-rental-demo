# Video Rental Store - A Domain-Driven Design Tutorial

Welcome! This project is a hands-on exploration of Domain-Driven Design (DDD) and monorepo architecture. We're building a video rental store - think old-school Blockbuster - to learn how to structure complex applications around business domains.

## Why This Project Exists

Instead of diving into abstract DDD theory, we'll learn by doing. This tutorial demonstrates:

- **Domain-First Development**: Starting with business rules, not databases or APIs
- **TypeSpec for API Design**: Generating everything from domain models
- **Monorepo Structure**: Managing multiple related packages
- **Modern Node.js**: Using the latest tools and patterns

The beauty of DDD is that it helps us think like the business while building software that actually works for real people.

## What You'll Learn

### 🎯 Domain-Driven Design Fundamentals

- How to identify and model business domains
- The difference between entities, value objects, and domain services
- Why business logic should live in the domain, not scattered across your app
- How to make the code speak the business language

### 🏗️ Monorepo Architecture

- Organizing related packages in a single repository
- Managing dependencies between packages
- Build order strategies and workspace configuration
- Sharing domain knowledge across multiple applications

### 🔧 Modern Tooling

- **TypeSpec**: API-first development with type safety
- **npm workspaces**: Monorepo package management
- **SQLite**: Simple, file-based database for prototyping
- **Domain-first builds**: Let business logic drive everything else

## How This Tutorial Works

We've intentionally chosen a simple, familiar domain - renting videos - so you can focus on the architectural patterns rather than complex business rules. Everyone understands what it means to rent a movie, pay late fees, and return it in good condition.

### The Learning Journey

**Start Here**: If you're new to DDD, begin with [`diagrams/`](./diagrams/) to understand the business domain visually.

**Then Explore**: Look at [`packages/domain/`](./packages/domain/) to see how business concepts become code.

**Finally Build**: Run the project to see how domain-driven development creates clean, maintainable applications.

## Domain-First Development Workflow

The key insight of this project is **domain-first development** - we start with business logic and generate everything else from it. Here's how it works:

### 📦 Package Architecture

Our monorepo has three main packages that depend on each other in a specific order:

1. **Domain Package** (`@video-rental/domain`) - The business logic foundation

   - Contains all business rules and models
   - Generates OpenAPI specifications from TypeSpec
   - Provides SQL schemas for database setup
   - Acts as the single source of truth

2. **Database Package** (`@video-rental/db`) - Data persistence layer

   - Imports domain models to generate database schemas
   - Provides type-safe database operations
   - Uses SQLite for simplicity in this tutorial

3. **API Package** (`@video-rental/api`) - HTTP interface layer

   - Imports the OpenAPI spec from the domain package
   - Provides REST endpoints matching domain operations
   - Validates requests against domain rules

### 🔄 The Build Process Explained

Understanding the build order is crucial to understanding how domain-first development works:

```bash
# This is the order that matters:
npm run build --workspace @video-rental/domain  # Business rules first
npm run build --workspace @video-rental/db      # Then data storage
npm run build --workspace @video-rental/api     # Finally the HTTP interface

# Or just build everything in the right order:
npm run build
```

**Why This Order Matters:**

1. **Domain First**: We define what the business needs before we think about databases or APIs
2. **Database Second**: We create storage that matches the business model
3. **API Last**: We expose business operations through HTTP endpoints

This is the opposite of most tutorials that start with database tables!

### 📁 What Gets Generated

When you build the domain package, here's what happens:

1. **TypeSpec Compilation**: Business models become OpenAPI specifications

   - Location: `tsp-output/@typespec/openapi3/openapi.json`
   - Contains all API endpoints, request/response schemas, and validation rules

2. **TypeScript Compilation**: Domain code becomes reusable packages

   - Location: `dist/` folder
   - Provides utilities for other packages to import domain knowledge

### 🚀 Why This Approach Works

**Single Source of Truth**: Change a business rule in one place, and it updates everywhere.

**Type Safety**: TypeScript ensures your API and database match your domain models.

**Documentation That Stays Current**: Since docs are generated from code, they never get out of date.

**Testing Made Easy**: Business logic is separated from infrastructure, making unit tests simpler.

## Exploring the Domain

Let's look at what makes a video rental business tick.

### Core Business Operations

We've modeled the essential workflows of a video rental business:

**Customer Management**: People need accounts to rent videos

- Registration with personal information
- Discount percentage tracking (for loyal customers)
- Account status management (active, suspended, inactive)

**Video Catalog**: The movies and shows available for rent

- Basic metadata (title, genre, rating, director)
- Pricing information
- Availability tracking

**Inventory Tracking**: Physical copies of videos

- Each video can have multiple copies
- Condition tracking (Good or Defective - we keep it simple)
- Status management (Available, Rented, Retired)

**Rental Process**: The core business transaction

- Customers rent specific copies of videos
- Automatic discount application for eligible customers
- Due date tracking and late fee calculation

**Payment Handling**: Money management

- Multiple payment types (rental fees, late fees, damage fees, membership)
- Various payment methods (cash, cards, checks, gift cards)
- Transaction history and status tracking

### What We Simplified

Real video stores had complex business rules, but we've streamlined things for learning:

- **No Employee Management**: We focus on customer-facing operations
- **Binary Condition Assessment**: Videos are either Good or Defective
- **Simplified Discounts**: Just a percentage field per customer
- **Basic Rental Periods**: Standard due dates without complex tier systems

This keeps the domain understandable while still demonstrating important DDD patterns.

## Diving Into the Code

Now that you understand the business domain, let's explore how DDD principles shape the code structure.

### 🎯 The Domain Package - Your Business Logic Home

**Location**: [`packages/domain/`](./packages/domain/)

This is where all business knowledge lives. Think of it as the brain of your application.

**What's Inside:**

- **Domain Models** (`lib/models/`): The core business entities

  - `Customer`: Who rents videos
  - `Video`: What gets rented
  - `Rental`: The transaction connecting customers and videos
  - `Inventory`: Physical copies of videos
  - `Payment`: Money changing hands

- **Value Objects** (`lib/models/value-objects/`): Business concepts without identity

  - `Address`: Where customers live
  - `Email`: Contact information with validation
  - `Money`: Currency amounts with precision
  - `RentalPeriod`: Time spans for rentals

- **Domain Services** (`lib/services/`): Business logic that doesn't belong to a single entity
  - `CustomerService`: Customer eligibility and discount logic
  - `RentalService`: Rental calculations and business rules

**Why This Matters**: When business rules change, you only need to update this package. Everything else follows automatically.

### 🗄️ The Database Package - Persistence Made Simple

**Location**: [`packages/db/`](./packages/db/)

This package knows how to store and retrieve domain objects, but it doesn't contain business logic.

**What It Does:**

- Imports domain models to understand what to store
- Generates SQL schemas from domain definitions
- Provides type-safe database operations
- Uses SQLite for tutorial simplicity (easily swappable for production databases)

**Key Insight**: The database schema is generated from domain models, not designed separately. This means your database always matches your business logic.

### 🌐 The API Package - HTTP Interface Layer

**Location**: [`packages/api/`](./packages/api/)

This package exposes domain operations through HTTP endpoints.

**What It Provides:**

- REST API endpoints for all domain operations
- Request/response validation using domain rules
- OpenAPI documentation generated from domain models
- Express.js server setup with proper middleware

**The Magic**: API endpoints are defined once in the domain package using TypeSpec, then automatically become HTTP endpoints here.

- Request/response validation (planned)
- Authentication and middleware

### 🗄️ **DB Package** - `@video-rental/db`

#### Database layer with type-safe operations

**Dependencies:**

- Imports from `@video-rental/domain`
- Uses generated SQL schema for database initialization
- Type-safe operations based on domain models

**Features:**

- SQLite database with better-sqlite3
- Generated `init.sql` from domain models
- Type-safe database operations
- Migration and seeding utilities

## Getting Started - Your First Steps

Ready to explore domain-driven development? Here's how to dive in:

### Prerequisites

- **Node.js 18+**: We use modern Node.js features
- **Basic TypeScript knowledge**: Helpful but not required
- **Curiosity about business modeling**: The most important ingredient!

### Quick Start

```bash
# Clone and explore the project
git clone <repository-url>
cd video-rental-demo

# Install all dependencies for the monorepo
npm install

# Build everything in the right order
npm run build

# Explore the generated OpenAPI specification
cat packages/domain/tsp-output/@typespec/openapi3/openapi.json | jq '.'

# Start the API server (if implemented)
npm run dev --workspace @video-rental/api
```

### Exploration Guide

**For DDD Beginners**: Start with [`diagrams/`](./diagrams/) to see the business domain visually.

**For Monorepo Learners**: Check out [`package.json`](./package.json) to see workspace configuration.

**For TypeSpec Curious**: Explore [`packages/domain/lib/`](./packages/domain/lib/) to see business models in code.

**For Architecture Fans**: Read [`diagrams/workflows/00-workflow-interconnections.md`](./diagrams/workflows/00-workflow-interconnections.md) to understand system integration.

## Learning by Doing - Development Workflows

Let's walk through some common development scenarios to understand how domain-first development works in practice.

### Scenario 1: Adding a New Business Rule

Imagine we want to add "maximum rental duration" - customers can't rent videos for more than 7 days.

**Domain-First Approach:**

1. **Think Business First**: What does this rule mean for customers? For the rental process?

2. **Update the Domain Model** (`packages/domain/lib/models/rental.tsp`):

   ```typescript
   // Add validation to RentalPeriod
   model RentalPeriod {
     startDate: string; // date format
     dueDate: string;   // date format - max 7 days from start
     returnDate?: string; // nullable
   }
   ```

3. **Rebuild and Propagate**:

   ```bash
   npm run build --workspace @video-rental/domain
   # This updates the OpenAPI spec, which updates the API validation
   # and database constraints automatically
   ```

**Traditional Approach** (what we're avoiding):

- Update database schema
- Update API validation
- Update documentation
- Hope everything stays in sync

### Scenario 2: Understanding Package Dependencies

Watch what happens when you build:

```bash
# This will fail because db and api depend on domain
npm run build --workspace @video-rental/api
# Error: Cannot find module '@video-rental/domain'

# This works because we build dependencies first
npm run build --workspace @video-rental/domain
npm run build --workspace @video-rental/api
# Success!

# Or just let npm workspaces handle the order
npm run build
```

**Learning Point**: Dependencies flow from domain outward. This enforces the architectural principle that business logic doesn't depend on infrastructure.

### Scenario 3: Exploring Generated Code

See how business models become running applications:

```bash
# Look at what TypeSpec generates
npm run build:tsp --workspace @video-rental/domain
ls packages/domain/tsp-output/@typespec/openapi3/

# The generated OpenAPI spec contains:
# - All your business models as JSON schemas
# - API endpoints with proper HTTP methods
# - Validation rules from your domain constraints
# - Documentation from your TypeSpec comments
```

## Quick Setup Commands

```bash
# Install dependencies for all workspaces
npm install

# Build all packages in correct order (domain → db → api)
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

## TypeSpec Development

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

```text
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
