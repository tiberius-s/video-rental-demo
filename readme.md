# Video Rental Store: A Domain-Driven Design (DDD) Tutorial

Welcome! This project is a hands-on guide to learning Domain-Driven Design (DDD) and monorepo architecture. We're building a simplified video rental store (think old-school Blockbuster) to show you how to structure complex applications around business needs.

## Why This Project?

Instead of just theory, we learn by doing. This tutorial demonstrates:

- **Domain-First Development**: We start with business rules, not databases or APIs.
- **TypeSpec for API Design**: We generate API specifications and even client code from our domain models.
- **Monorepo Structure**: We manage multiple related software packages in one place.
- **Modern Node.js**: We use current tools and best practices.

DDD helps us think like the business and build software that truly meets user needs.

## What You'll Learn

### 🎯 Domain-Driven Design Fundamentals

- How to identify and model business domains (the different parts of a business).
- The roles of Entities, Value Objects, and Domain Services in your code.
- Why business logic should live in the domain, not scattered everywhere.
- How to make your code "speak the business language."

### 🏗️ Monorepo Architecture

- How to organize related packages (like `domain`, `database`, `api`) in a single repository.
- How to manage dependencies between these packages.
- Strategies for building and managing code in a monorepo.

### 🔧 Modern Tooling

- **TypeSpec**: For designing APIs with a focus on type safety.
- **npm Workspaces**: For managing monorepo packages.
- **SQLite**: A simple, file-based database perfect for learning and prototyping.

## How This Tutorial Works

We've chosen a familiar domain—renting videos—so you can focus on architectural patterns rather than complex business rules.

### The Learning Journey

1. **Understand the Business**: Start with the diagrams in the [`docs/`](./docs/) folder (especially `docs/ERD.md` and `docs/workflows/`) to see the business domain visually.
2. **Explore the Domain Code**: Look at `packages/domain/` to see how business concepts are translated into TypeSpec and TypeScript.
3. **Build and Run**: Follow the setup commands to build the project and see how domain-driven development creates clean, maintainable applications.

## Domain-First Development: The Core Idea

We build from the "inside out": **business logic first**, then everything else.

### 📦 Package Architecture

Our monorepo has three main packages that build on each other:

1. **`@video-rental/domain` (The Brain)**

   - Contains all business rules, models (e.g., `Customer`, `Video`, `Rental`), and TypeSpec definitions.
   - Generates an OpenAPI specification for the API.
   - This is the single source of truth for how the business works.

2. **`@video-rental/db` (The Memory)**

   - Handles data storage and retrieval.
   - Uses the domain models to create database schemas (using SQLite here).
   - Provides type-safe ways to interact with the database.

3. **`@video-rental/api` (The Mouth and Ears)**
   - Exposes the business logic to the outside world via an HTTP API.
   - Uses the OpenAPI specification from the `domain` package to define its endpoints.
   - Validates incoming requests against domain rules.

### 🔄 The Build Process: Order Matters

```bash
# 1. Build the domain package (business rules first)
npm run build --workspace @video-rental/domain

# 2. Build the database package (relies on domain)
npm run build --workspace @video-rental/db

# 3. Build the API package (relies on domain and potentially db)
npm run build --workspace @video-rental/api

# Or, build everything in the correct order automatically:
npm run build
```

**Why this order?**

1. **Domain First**: Define what the business needs.
2. **Database Second**: Create storage that matches the business model.
3. **API Last**: Expose business operations.

This is different from many tutorials that start with database tables!

### 📁 What Gets Generated

Building the `domain` package is key:

1. **TypeSpec Compilation**: Business models in `.tsp` files become an OpenAPI specification.
   - **Output**: `packages/domain/tsp-output/@typespec/openapi3/openapi.json`
   - This JSON file describes all API endpoints, request/response structures, and validation rules.
2. **TypeScript Compilation**: The domain's TypeScript code (helper functions, etc.) is compiled.
   - **Output**: `packages/domain/dist/`
   - Other packages can import this compiled code.

### 🚀 Why This Approach Is Powerful

- **Single Source of Truth**: Change a business rule in the `domain` package, and it propagates.
- **Type Safety**: TypeScript helps ensure your API and database align with your domain models.
- **Living Documentation**: API documentation generated from TypeSpec is always up-to-date.
- **Easier Testing**: Business logic is separate from infrastructure (API, DB), making unit tests simpler.

## Exploring the Business Domain

Let's look at the core parts of our video rental business.

### Core Business Operations

- **Customer Management**:
  - Registration with personal info.
  - Tracking discount percentages for loyal customers.
  - Managing account status (Active, Suspended, Inactive).
- **Video Catalog**:
  - Storing movie/show details (title, genre, rating).
  - Managing pricing.
- **Inventory Tracking**:
  - Each video title can have multiple physical copies.
  - Tracking copy condition (Good, Defective).
  - Managing copy status (Available, Rented, Retired).
- **Rental Process**:
  - Customers rent specific copies.
  - Automatic discount application.
  - Due date tracking and late fee calculation.
- **Payment Handling**:
  - Processing various fee types (rental, late, damage).
  - Supporting multiple payment methods (simplified for this tutorial).

### What We've Simplified (for Learning)

- No employee management.
- Video conditions are just "Good" or "Defective."
- Discounts are a simple percentage per customer.
- Basic rental periods.

This keeps the domain focused while still demonstrating key DDD patterns.

## Diving Into the Code

### 🎯 The Domain Package (`packages/domain/`)

This is where all business knowledge lives.

- **Domain Models** (`lib/models/`): Core business entities like `Customer.tsp`, `Video.tsp`, `Rental.tsp`.
- **Value Objects** (`lib/models/value-objects/`): Concepts like `Address.tsp`, `Email.tsp`, `Money.tsp` that describe attributes but don't have a unique identity.
- **Domain Services** (`lib/services/`): Business logic that doesn't fit neatly into a single entity, e.g., `CustomerService.tsp`, `RentalService.tsp`.

**Key takeaway**: When business rules change, you primarily update this package.

### 🗄️ The Database Package (`packages/db/`)

Handles storing and retrieving data, but contains no business logic itself.

- Imports models from the `domain` package.
- Generates SQL schemas (e.g., `init.sql`) from these domain definitions.
- Provides type-safe database operations (using `better-sqlite3`).

**Key takeaway**: The database schema is driven by the domain model.

### 🌐 The API Package (`packages/api/`)

Exposes domain operations via HTTP.

- Uses the OpenAPI spec from the `domain` package to define REST API endpoints.
- Validates requests and responses against domain rules.
- Uses Express.js to set up the server.

**Key takeaway**: API definitions are generated from the domain, ensuring consistency.

## Getting Started

Ready to explore?

### Prerequisites

- Node.js (version 18 or newer recommended)
- Basic familiarity with TypeScript is helpful.
- Curiosity about software architecture!

### Quick Start

1. **Clone the repository:**

   ```bash
   git clone <repository-url> # Replace <repository-url> with the actual URL
   cd video-rental-demo
   ```

2. **Install dependencies:**
   (This installs dependencies for all packages in the monorepo)

   ```bash
   npm install
   ```

3. **Build all packages:**
   (This runs the build in the correct order: domain -> db -> api)

   ```bash
   npm run build
   ```

4. **Explore the generated API specification:**
   (This shows the machine-readable API contract)

   ```bash
   # On macOS/Linux
   cat packages/domain/tsp-output/@typespec/openapi3/openapi.json | jq '.'
   # On Windows (PowerShell)
   Get-Content packages/domain/tsp-output/@typespec/openapi3/openapi.json | ConvertFrom-Json | ConvertTo-Json -Depth 100
   ```

5. **Start the API server:**

   ```bash
   npm run dev --workspace @video-rental/api
   ```

   (Then, you can try sending requests to it using a tool like Postman or curl, based on the API spec.)

### Exploration Guide

- **DDD Beginners**: Start with `docs/ERD.md` and `docs/workflows/README.md`.
- **Monorepo Learners**: Check `package.json` (root) and `packages/*/package.json`.
- **TypeSpec Curious**: Explore `.tsp` files in `packages/domain/lib/`.
- **Architecture Fans**: Read `docs/workflows/00-workflow-interconnections.md`.

## Key Development Commands

Here's a more digestible list of common commands. Remember, you can run scripts for a specific package using the `--workspace` flag (e.g., `npm run build --workspace @video-rental/domain`).

### General Project Commands

- **`npm install`**: Installs all dependencies for the monorepo. Run this first.
- **`npm run build`**: Builds all packages in the correct order.
- **`npm run clean`**: Removes all build artifacts (like `dist/` folders).
- **`npm run dev --workspace @video-rental/api`**: Starts the API server in development mode (with auto-reloading).

### Code Quality & Formatting

- **`npm run format`**: Formats all code using Prettier (including TypeSpec files).
- **`npm run format:check`**: Checks formatting without making changes.
- **`npm run lint`**: Lints all packages to check for code style issues.
- **`npm run lint:fix`**: Tries to automatically fix linting issues.

### Working with TypeSpec (usually in `@video-rental/domain`)

Run these from the root or use `--workspace @video-rental/domain`:

- **`npm run tsp:compile`**: Compiles TypeSpec files to OpenAPI (and other outputs).
  - Equivalent to `npm run build:tsp --workspace @video-rental/domain`
- **`npm run tsp:watch`**: Watches TypeSpec files for changes and recompiles automatically.
- **`npm run tsp:format`**: Formats only TypeSpec files.
- **`npm run tsp:validate`**: Validates TypeSpec files without generating output.

### Managing Packages (npm Workspaces)

- **Install a new dependency for a specific package:**

  ```bash
  npm install <package-name> --workspace @video-rental/api
  npm install -D <dev-package-name> --workspace @video-rental/db # For dev dependencies
  ```

- **Run any script defined in a package's `package.json`:**

  ```bash
  npm run <script-name> --workspace @video-rental/some-package
  ```

## 🏗️ Monorepo Best Practices

This project follows modern monorepo best practices for maintainability and developer experience.

### Workspace Configuration

- **Consistent Versioning**: All packages maintain the same version (0.0.1)
- **Workspace Dependencies**: Internal packages use `workspace:*` protocol
- **Shared Configuration**: Common TypeScript, ESLint, and Prettier configs
- **Build Order**: Packages build in dependency order (domain → db → api)

### Development Workflow

```bash
# Validate workspace configuration
npm run workspace:validate

# Build all packages in correct order
npm run build

# Run tests across all packages
npm test

# Development modes for specific packages
npm run dev              # TypeSpec watching (domain)
npm run dev:api          # API server development
npm run dev:db           # Database development
```

### VS Code Integration

The project includes comprehensive VS Code configuration:

- **Tasks** (`.vscode/tasks.json`): Pre-configured build, test, and development tasks
- **Launch** (`.vscode/launch.json`): Debug configurations for API server and tests
- **Settings** (`.vscode/settings.json`): Optimized TypeScript, ESLint, and Prettier settings

### Package Management

- **Internal Dependencies**: Use `workspace:*` for cross-package dependencies
- **Consistent Scripts**: All packages implement common scripts (build, clean, test, lint, format, typecheck)
- **Shared DevDependencies**: Common tools like TypeScript, ESLint in root package
- **Workspace Validation**: Automated checks for configuration consistency

### Configuration Files

| File                            | Purpose                         |
| ------------------------------- | ------------------------------- |
| `.npmrc`                        | Workspace-specific npm settings |
| `tsconfig.json`                 | Base TypeScript configuration   |
| `eslint.config.js`              | Shared linting rules            |
| `.vscode/`                      | VS Code workspace configuration |
| `scripts/validate-workspace.js` | Workspace health checks         |

## Documentation Deep Dive

This project includes extensive documentation to help you understand the "why" behind the "how."

- **Diagrams (`docs/`)**:

  - **`docs/ERD.md`**: Entity Relationship Diagram showing data structures.
  - **`docs/DDD-IMPLEMENTATION.md`**: Explains how DDD concepts are applied here.
  - **`docs/workflows/`**: Detailed diagrams for each business workflow (e.g., Customer Registration, Rental Creation). Start with `docs/workflows/README.md`.
  - **`docs/sequence/`**: Sequence diagrams illustrating interactions for key operations.

- **Generated API Documentation**:

  - The primary source is `packages/domain/tsp-output/@typespec/openapi3/openapi.json`.
  - You can use tools like Redocly (see `redocly.yaml`) to generate human-readable HTML documentation from this OpenAPI file:

    ```bash
    npx @redocly/cli build-docs openapi.json --output public/index.html
    # (Assuming openapi.json is in the current directory or adjust path)
    # Or, if you have it configured in the domain package:
    npm run docs:generate --workspace @video-rental/domain
    ```

## Key Features of This Implementation

- **Simplified Domain Model**: Focuses on core DDD concepts.
- **Customer Discount Support**: A simple percentage-based discount.
- **Streamlined Business Rules**: For late fees, inventory, etc.
- **Type-Safe Value Objects**: Like `Address`, `Email`, `Money` with built-in validation (conceptual).
- **Rich OpenAPI Documentation**: Generated directly from TypeSpec, ensuring it matches the business logic.

---

Happy modeling!
