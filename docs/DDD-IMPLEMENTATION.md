# Learning Domain-Driven Design: A Practical Tutorial

Welcome to the hands-on implementation guide for Domain-Driven Design (DDD)! This document walks you through how we've applied DDD principles to build a video rental store, making complex business logic manageable and maintainable.

## Why We Chose This Approach

Instead of jumping into abstract DDD theory, we'll explore how these patterns solve real problems in our video rental business. Each design decision demonstrates a core DDD principle in action.

**What You'll Discover:**

- How to organize business logic so it makes sense to both developers and domain experts
- Why value objects and domain services matter for real applications
- How to design APIs that reflect business operations, not just database CRUD

## Your Learning Journey Through the Domain

Let's explore how DDD principles shaped our code structure. Each section shows you both the "what" and the "why" behind our choices.

### 🧩 Understanding Value Objects - The Building Blocks

**Location**: [`/models/value-objects/`](../packages/domain/lib/models/value-objects/)

Value objects are concepts that matter to the business but don't have an identity. Think of them as the "building blocks" of your domain.

**Real Examples from Our Domain:**

- **`Address`** - More than just text fields

  - _Business Rule_: Must be a valid US address with proper state codes
  - _Why It Matters_: Billing and shipping addresses need to be accurate for our business
  - _DDD Pattern_: Encapsulates validation so invalid addresses can't exist

- **`Email`** - Not just a string

  - _Business Rule_: Must follow RFC email format standards
  - _Why It Matters_: We need to contact customers about overdue rentals
  - _DDD Pattern_: Makes impossible states impossible - no invalid emails in our system

- **`Money`** - Currency that actually works

  - _Business Rule_: Decimal precision with proper currency codes
  - _Why It Matters_: Rental fees, late charges, and refunds must be accurate
  - _DDD Pattern_: Prevents floating-point math errors in financial calculations

- **`RentalPeriod`** - Time spans with business meaning
  - _Business Rule_: Start date, due date, and optional return date
  - _Why It Matters_: Late fees depend on when movies are actually returned
  - _DDD Pattern_: Encapsulates time-based business logic

**Learning Point**: Value objects aren't just data validation - they represent business concepts that domain experts talk about every day.

### 🎯 Domain Models - The Heart of Your Business

**Location**: [`/models/`](../packages/domain/lib/models/)

These are the core "things" your business cares about. Each model represents something a domain expert would recognize and discuss.

**Business Entities in Our Store:**

- **`Customer`** - The people who rent our videos

  - _What Makes Them Special_: Discount eligibility, rental history, account status
  - _Business Operations_: Can check eligibility, apply discounts, track rental limits
  - _DDD Insight_: Customers aren't just database records - they have business behaviors

- **`Video`** - The movies and shows in our catalog

  - _What Makes Them Special_: Pricing, genre classification, availability tracking
  - _Business Operations_: Price calculation, availability checking, catalog management
  - _DDD Insight_: Videos have business rules about pricing and availability

- **`Rental`** - The transaction at the core of our business

  - _What Makes Them Special_: Period tracking, fee calculation, status management
  - _Business Operations_: Late fee calculation, return processing, renewal handling
  - _DDD Insight_: Rentals aren't just join tables - they're business processes

- **`Inventory`** - Physical copies of videos

  - _What Makes Them Special_: Condition tracking, maintenance scheduling, availability
  - _Business Operations_: Damage assessment, retirement decisions, copy management
  - _DDD Insight_: Physical inventory has different rules than catalog videos

- **`Payment`** - Money changing hands
  - _What Makes Them Special_: Multiple payment types, refund processing, audit trails
  - _Business Operations_: Payment processing, refund calculations, financial reporting
  - _DDD Insight_: Payments involve complex business rules beyond simple transactions

**Learning Point**: Domain models contain behavior, not just data. They know how to do business operations that domain experts care about.

### 🔧 Domain Services - Business Logic That Doesn't Belong to One Entity

**Location**: [`/services/`](../packages/domain/lib/services/)

Sometimes business logic involves multiple entities or complex calculations. Domain services handle these operations while keeping the business logic in the domain layer.

**Our Business Logic Services:**

- **`CustomerService`** - Customer-related business operations

  - _What It Handles_: Eligibility checks, discount calculations, rental summaries
  - _Why Separate_: These operations involve multiple entities (Customer + Rental + Payment)
  - _Business Value_: Centralizes customer business rules so they stay consistent

- **`RentalService`** - Rental calculations and business rules
  - _What It Handles_: Pricing with discounts, late fee calculations, rental period management
  - _Why Separate_: Complex calculations involving Video + Customer + RentalPeriod + Money
  - _Business Value_: Ensures pricing rules are applied consistently across all operations

**Learning Point**: Domain services keep complex business logic in the domain layer instead of leaking into controllers or database queries.

### 🎯 Pragmatic DDD - Principles Over Patterns

We've chosen a **pragmatic DDD approach** that focuses on solving real business problems without over-engineering.

**What We Include:**

- **Domain Services** - Clear business logic encapsulation
- **Value Objects** - Business concepts with validation and behavior
- **Domain Models** - Entities that reflect business operations
- **REST Operations** - API endpoints that match business workflows

**What We Intentionally Skip:**

- **Complex CQRS** - Our read/write operations aren't complex enough yet
- **Event Sourcing** - Standard CRUD meets our current business needs
- **Aggregates** - Our entity relationships are straightforward
- **Repository Patterns** - TypeSpec + database layer provides sufficient abstraction

**Learning Point**: DDD is about understanding your business domain, not implementing every pattern in the book. Start simple and add complexity only when business rules demand it.

## Exploring Our API Design - Business Operations, Not CRUD

**Location**: [`/routes.tsp`](../packages/domain/lib/routes.tsp)

Our API exposes **32 business operations** across **21 endpoints**. Notice how these match what people actually do in a video rental store, not just database operations.

### System Health - Keeping Things Running

- `GET /health` - Is our store operational?
- `GET /docs` - How do our systems work?

_Business Value_: Operations teams need to know if the store is working properly.

### Video Catalog Management - What We Rent

- `POST /videos` - Add new movies to our catalog
- `GET /videos` - Browse available movies (with search and filtering)
- `GET /videos/{videoId}` - Get detailed movie information
- `PATCH /videos/{videoId}` - Update movie details (price changes, etc.)
- `GET /videos/{videoId}/availability` - How many copies are available right now?
- `DELETE /videos/{videoId}` - Remove movies from catalog (discontinue)

_Business Value_: Staff need to manage what movies we offer and customers need to browse and search.

### Customer Operations - Who Rents From Us

- `POST /customers` - New customer registration
- `GET /customers` - Find customers (for staff lookup)
- `GET /customers/{customerId}` - Customer details and account status
- `PATCH /customers/{customerId}` - Update customer information
- `DELETE /customers/{customerId}` - Deactivate customer accounts
- `GET /customers/{customerId}/eligibility` - Can this customer rent more videos?
- `GET /customers/{customerId}/rentals` - Customer's rental history

_Business Value_: Customer service operations and account management.

### Rental Operations - The Core Business Transaction

- `POST /rentals` - Rent a video (with eligibility and availability checks)
- `GET /rentals/{rentalId}` - Look up rental details
- `DELETE /rentals/{rentalId}` - Cancel rental (with refund processing)
- `POST /rentals/{rentalId}/return` - Return video (with late fee calculation)
- `GET /rentals/overdue` - Which rentals are overdue? (for follow-up)

_Business Value_: The fundamental operations that make money for our business.

### Payment Processing - Money Management

- `POST /payments` - Process payments for rentals and fees
- `GET /payments/{paymentId}` - Payment transaction details
- `GET /payments/customer/{customerId}` - Customer's payment history

_Business Value_: Financial operations and customer billing.

### Inventory Management - Physical Copy Tracking

- `POST /inventory` - Add new physical copies to inventory
- `GET /inventory/video/{videoId}` - All physical copies of a specific movie
- `PATCH /inventory/{inventoryId}` - Update copy condition/status
- `DELETE /inventory/{inventoryId}` - Remove damaged or lost copies

_Business Value_: Track physical assets and their condition.

**Learning Point**: Our API reflects business operations, not database tables. Each endpoint represents something a domain expert would recognize as a business action.

## Business Rules in Action - How Domain Logic Works

Let's see how DDD principles help us implement complex business rules clearly and maintainably.

### Customer Discount Logic

```typescript
// In CustomerService - business logic stays in the domain
calculateRentalPrice(basePrice: Money, customerDiscount: number): Money {
  // Business rule: Discounts are percentage-based
  // Domain expert can verify this logic
  return basePrice.subtract(basePrice.multiply(customerDiscount / 100));
}
```

**Why This Works**: Domain experts can read and validate this logic. It matches how they think about discounts.

### Rental Eligibility Rules

```typescript
// Complex business rules in domain service
checkRentalEligibility(customer: Customer, inventory: Inventory[]): EligibilityResult {
  // Business rule: No rentals if customer has overdue items
  // Business rule: Rental limits based on customer status
  // Business rule: Inventory must be available and in good condition
}
```

**Why This Works**: All eligibility rules are centralized. When business rules change, there's one place to update.

### Late Fee Calculations

```typescript
// RentalService handles time-based business logic
calculateLateFee(rental: Rental, returnDate: Date): Money {
  // Business rule: Late fees accrue daily after due date
  // Business rule: Maximum late fee caps
  // Business rule: Different rates for different video types
}
```

**Why This Works**: Complex calculations stay in the domain where business experts can verify them.

## Technical Implementation - Making DDD Work

### TypeSpec-Driven Development

We use **TypeSpec** to define our domain models first, then generate everything else:

**Why This Matters:**

- **API-First**: Business operations become HTTP endpoints automatically
- **Type Safety**: Impossible to have mismatched APIs and domain models
- **Documentation**: Business rules become API documentation
- **Validation**: Domain constraints become runtime validation

### Composition Patterns That Make Sense

**PersonBase Pattern**: Customer information reused across the system

```typescript
// Shared pattern for personal information
model PersonBase {
  firstName: string;
  lastName: string;
  email: Email;
  // ... other personal details
}

// Customer extends this with business-specific fields
model Customer extends PersonBase {
  discountPercentage?: number; // Business-specific
  accountStatus: CustomerStatus; // Business-specific
}
```

**Why This Works**: Domain experts recognize "personal information" as a concept. We model it once and reuse it correctly.

### Domain Validation - Business Rules as Code

Our validation rules reflect business requirements:

- **Address Validation**: Must be valid US addresses (business requirement)
- **Email Validation**: RFC-compliant for reliable customer communication
- **Phone Number Validation**: E.164 format for international compatibility
- **Money Validation**: Decimal precision prevents financial calculation errors
- **Business Logic Validation**: Rental periods, discount limits, inventory status

**Learning Point**: Validation isn't just preventing system errors - it's enforcing business rules that domain experts care about.

## Architectural Benefits You'll Experience

### 1. Business Logic Clarity

When business rules change, you know exactly where to look. Domain experts can read and verify the logic.

### 2. Type Safety Everywhere

Impossible to have mismatched APIs, databases, and domain models. TypeScript and TypeSpec ensure consistency.

### 3. Maintainable Complexity

As business rules grow more complex, the domain structure grows with them in predictable ways.

### 4. Testing That Makes Sense

Domain logic is isolated from infrastructure, making business rule testing straightforward.

### 5. Documentation That Stays Current

API documentation generates from domain models, so it's always accurate.

### 6. Clear Integration Points

Database layer, API layer, and business logic have clear boundaries and responsibilities.

## Domain Boundaries - What We Own

Our video rental domain includes:

**Customer Management**: Everything about customer accounts, eligibility, and discounts

**Inventory Management**: Physical video copies, condition tracking, and availability

**Rental Operations**: The core transaction processing and business rules

**Financial Operations**: Payment processing, pricing, discounts, and fee calculations

**What's Outside Our Domain**: Employee management, store operations, supplier relationships, marketing campaigns

**Learning Point**: Domain boundaries help you focus on what your business actually does, not every possible feature.

## Integration Architecture - How Everything Connects

### Database Layer Integration

```typescript
// Domain models drive database schema
import { generateSqlSchema } from "@video-rental/domain/codegen";
const schema = generateSqlSchema(); // Type-safe database operations
```

### API Layer Integration

```typescript
// Domain contracts become HTTP endpoints
import { getOpenApiSpec } from "@video-rental/domain";
const apiSpec = await getOpenApiSpec(); // Complete API specification
```

### Business Logic Integration

```typescript
// Domain services provide business operations
import { CustomerService, RentalService } from "@video-rental/domain";
// Use business logic without knowing implementation details
```

**Learning Point**: Domain-first development means business logic drives everything else, not the other way around.

## Your DDD Learning Path

Now that you understand our domain structure:

1. **Explore the Code**: Look at [`packages/domain/lib/`](../packages/domain/lib/) to see these patterns in action
2. **Try Modifications**: Add a new business rule and see how it propagates through the system
3. **Build Something**: Use our domain patterns to create new business operations
4. **Test Business Logic**: Write tests for domain services to validate business rules

This pragmatic DDD implementation gives you a solid foundation for understanding how business domains become maintainable software architecture. The patterns scale with your business complexity while keeping the code understandable to both developers and domain experts.
