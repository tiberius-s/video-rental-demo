# Domain-Driven Design in Practice: A Tutorial

Welcome to this practical guide on implementing Domain-Driven Design (DDD)! This document explains how we have applied DDD principles to construct a video rental store application, aiming to make complex business logic both manageable and maintainable.

## Our Approach to DDD

Rather than delving into abstract DDD theory, we will explore how these design patterns address real-world challenges within our video rental business. Each design choice is a demonstration of a core DDD principle in action.

**What You Will Discover:**

- How to organize business logic in a way that is understandable to both developers and domain experts.
- The practical importance of Value Objects and Domain Services in real applications.
- How to design APIs that accurately reflect business operations, rather than just database CRUD (Create, Read, Update, Delete) actions.

## Your Learning Journey Through the Domain Model

Let’s examine how DDD principles have shaped our codebase. Each section will clarify both the "what" and the "why" behind our architectural decisions.

### 🧩 Understanding Value Objects: The Building Blocks

**Location**: [`/models/value-objects/`](../packages/domain/lib/models/value-objects/)

Value Objects represent concepts that are important to the business but do not have a unique identity. Think of them as the fundamental "building blocks" of your domain.

**Examples from Our Domain:**

- **`Address`**: More than just text fields.

  - _Business Rule_: Must be a valid US address with correct state codes.
  - _Why It Matters_: Accurate billing and shipping addresses are crucial for business operations.
  - _DDD Pattern_: Encapsulates validation, ensuring that invalid addresses cannot exist in the system.

- **`Email`**: Not merely a string.

  - _Business Rule_: Must adhere to RFC email format standards.
  - _Why It Matters_: Reliable contact with customers is necessary, for instance, regarding overdue rentals.
  - _DDD Pattern_: Makes invalid states impossible—no incorrect email formats in our system.

- **`Money`**: Currency representation that functions correctly.

  - _Business Rule_: Requires decimal precision and proper currency codes.
  - _Why It Matters_: Rental fees, late charges, and refunds must be calculated accurately.
  - _DDD Pattern_: Prevents floating-point arithmetic errors in financial calculations.

- **`RentalPeriod`**: Time spans with specific business meaning.
  - _Business Rule_: Includes a start date, due date, and an optional return date.
  - _Why It Matters_: Late fees are determined by when movies are actually returned.
  - _DDD Pattern_: Encapsulates time-based business logic.

**Learning Point**: Value Objects are not just for data validation; they represent business concepts that domain experts use daily.

### 🎯 Domain Models: The Heart of Your Business

**Location**: [`/models/`](../packages/domain/lib/models/)

These are the core "things" that your business revolves around. Each model represents something a domain expert would recognize and discuss.

**Business Entities in Our Store:**

- **`Customer`**: The individuals who rent our videos.

  - _Key Characteristics_: Discount eligibility, rental history, account status.
  - _Business Operations_: Can check eligibility, apply discounts, track rental limits.
  - _DDD Insight_: Customers are more than just database records; they possess business-specific behaviors.

- **`Video`**: The movies and shows available in our catalog.

  - _Key Characteristics_: Pricing, genre classification, availability tracking.
  - _Business Operations_: Price calculation, availability checking, catalog management.
  - _DDD Insight_: Videos have inherent business rules regarding pricing and availability.

- **`Rental`**: The transaction central to our business.

  - _Key Characteristics_: Period tracking, fee calculation, status management.
  - _Business Operations_: Late fee calculation, return processing, renewal handling.
  - _DDD Insight_: Rentals are not just join tables; they represent business processes.

- **`Inventory`**: The physical copies of videos.

  - _Key Characteristics_: Condition tracking, maintenance scheduling, availability.
  - _Business Operations_: Damage assessment, retirement decisions, copy management.
  - _DDD Insight_: Physical inventory items are subject to different rules than catalog videos.

- **`Payment`**: The exchange of money.
  - _Key Characteristics_: Multiple payment types, refund processing, audit trails.
  - _Business Operations_: Payment processing, refund calculations, financial reporting.
  - _DDD Insight_: Payments involve complex business rules that go beyond simple transactions.

**Learning Point**: Domain Models encapsulate behavior, not just data. They understand how to perform business operations relevant to domain experts.

### 🔧 Domain Services: Business Logic Beyond a Single Entity

**Location**: [`/services/`](../packages/domain/lib/services/)

Sometimes, business logic involves multiple entities or complex calculations. Domain Services handle these operations, keeping the business logic within the domain layer.

**Our Business Logic Services:**

- **`CustomerService`**: Manages customer-related business operations.

  - _Responsibilities_: Eligibility checks, discount calculations, rental summaries.
  - _Why It's Separate_: These operations involve multiple entities (e.g., Customer, Rental, Payment).
  - _Business Value_: Centralizes customer-specific business rules for consistency.

- **`RentalService`**: Handles rental calculations and associated business rules.
  - _Responsibilities_: Pricing with discounts, late fee calculations, rental period management.
  - _Why It's Separate_: Involves complex calculations using Video, Customer, RentalPeriod, and Money.
  - _Business Value_: Ensures consistent application of pricing rules across all operations.

**Learning Point**: Domain Services prevent complex business logic from leaking into controllers or database queries by keeping it within the domain layer.

### 🎯 Pragmatic DDD: Principles Over Patterns

We have adopted a **pragmatic DDD approach**, focusing on solving real business problems without unnecessary over-engineering.

**What We Include:**

- **Domain Services**: For clear encapsulation of business logic.
- **Value Objects**: Representing business concepts with built-in validation and behavior.
- **Domain Models**: Entities that reflect actual business operations.
- **REST Operations**: API endpoints designed to match business workflows.

**What We Intentionally Exclude (for now):**

- **Complex CQRS (Command Query Responsibility Segregation)**: Our current read/write operations do not yet warrant this complexity.
- **Event Sourcing**: Standard CRUD operations meet our present business needs.
- **Aggregates**: Our entity relationships are currently straightforward.
- **Repository Patterns**: The combination of TypeSpec and our database layer provides sufficient abstraction at this stage.

**Learning Point**: DDD is primarily about understanding your business domain, not about implementing every known pattern. Start simple and introduce complexity only when business rules require it.

## Exploring Our API Design: Business Operations, Not Just CRUD

**Location**: [`/routes.tsp`](../packages/domain/lib/routes.tsp)

Our API exposes **32 distinct business operations** through **21 endpoints**. Notice how these align with the actual tasks performed in a video rental store, rather than merely reflecting database operations.

### System Health: Ensuring Operational Stability

- `GET /health`: "Is our store operational?"
- `GET /docs`: "How do our systems work?"

_Business Value_: Operations teams need to monitor if the store is functioning correctly.

### Video Catalog Management: What We Offer for Rent

- `POST /videos`: "Add new movies to our catalog."
- `GET /videos`: "Browse available movies" (with search and filtering capabilities).
- `GET /videos/{videoId}`: "Get detailed information for a specific movie."
- `PATCH /videos/{videoId}`: "Update movie details" (e.g., price changes).
- `GET /videos/{videoId}/availability`: "How many copies of this movie are available right now?"
- `DELETE /videos/{videoId}`: "Remove movies from the catalog" (discontinue offering).

_Business Value_: Staff need to manage the movie selection, and customers need to browse and search effectively.

### Customer Operations: Managing Our Renters

- `POST /customers`: "Register a new customer."
- `GET /customers`: "Find customers" (for staff lookup purposes).
- `GET /customers/{customerId}`: "View customer details and account status."
- `PATCH /customers/{customerId}`: "Update customer information."
- `DELETE /customers/{customerId}`: "Deactivate customer accounts."
- `GET /customers/{customerId}/eligibility`: "Can this customer rent more videos?"
- `GET /customers/{customerId}/rentals`: "View a customer's rental history."

_Business Value_: Supports customer service operations and account management.

### Rental Operations: The Core Business Transactions

- `POST /rentals`: "Rent a video" (includes eligibility and availability checks).
- `GET /rentals/{rentalId}`: "Look up details for a specific rental."
- `DELETE /rentals/{rentalId}`: "Cancel a rental" (includes refund processing).
- `POST /rentals/{rentalId}/return`: "Return a video" (includes late fee calculation).
- `GET /rentals/overdue`: "Which rentals are currently overdue?" (for follow-up actions).

_Business Value_: These are the fundamental operations that generate revenue for the business.

### Payment Processing: Managing Financial Transactions

- `POST /payments`: "Process payments for rentals and fees."
- `GET /payments/{paymentId}`: "View details of a specific payment transaction."
- `GET /payments/customer/{customerId}`: "View a customer's complete payment history."

_Business Value_: Facilitates financial operations and customer billing.

### Inventory Management: Tracking Physical Copies

- `POST /inventory`: "Add new physical copies to the inventory."
- `GET /inventory/video/{videoId}`: "List all physical copies of a specific movie."
- `PATCH /inventory/{inventoryId}`: "Update the condition or status of a copy."
- `DELETE /inventory/{inventoryId}`: "Remove damaged or lost copies from inventory."

_Business Value_: Enables tracking of physical assets and their current condition.

**Learning Point**: Our API is designed to reflect business operations, not database table structures. Each endpoint represents an action that a domain expert would recognize as a standard business activity.

## Business Rules in Action: How Domain Logic Is Implemented

Let's examine how DDD principles facilitate the clear and maintainable implementation of complex business rules.

### Customer Discount Logic

```typescript
// Located in CustomerService – business logic remains within the domain.
calculateRentalPrice(basePrice: Money, customerDiscount: number): Money {
  // Business rule: Discounts are percentage-based.
  // A domain expert can verify this logic.
  return basePrice.subtract(basePrice.multiply(customerDiscount / 100));
}
```

**Why This Works**: Domain experts can easily read and validate this logic because it mirrors how they conceptualize discounts.

### Rental Eligibility Rules

```typescript
// Complex business rules are managed in a domain service.
checkRentalEligibility(customer: Customer, inventory: Inventory[]): EligibilityResult {
  // Business rule: No rentals if a customer has overdue items.
  // Business rule: Rental limits are based on customer status.
  // Business rule: Inventory items must be available and in good condition.
}
```

**Why This Works**: All eligibility rules are centralized. If business rules change, updates are made in a single, designated location.

### Late Fee Calculations

```typescript
// RentalService handles time-based business logic.
calculateLateFee(rental: Rental, returnDate: Date): Money {
  // Business rule: Late fees accrue daily after the due date.
  // Business rule: There are maximum caps for late fees.
  // Business rule: Different rates may apply for different types of videos.
}
```

**Why This Works**: Complex calculations are kept within the domain, where business experts can verify their accuracy.

## Technical Implementation: Making DDD Effective

### TypeSpec-Driven Development

We utilize **TypeSpec** to define our domain models first, subsequently generating all other necessary components.

**Why This Is Important:**

- **API-First Approach**: Business operations are automatically translated into HTTP endpoints.
- **Type Safety**: Prevents mismatches between APIs and domain models.
- **Living Documentation**: Business rules directly inform API documentation.
- **Built-in Validation**: Domain constraints become runtime validation rules.

### Sensible Composition Patterns

**`PersonBase` Pattern**: Customer information is reused consistently across the system.

```typescript
// Shared pattern for personal information.
model PersonBase {
  firstName: string;
  lastName: string;
  email: Email;
  // ... other personal details
}

// Customer extends PersonBase with business-specific fields.
model Customer extends PersonBase {
  discountPercentage?: number; // Business-specific field
  accountStatus: CustomerStatus; // Business-specific field
}
```

**Why This Works**: Domain experts recognize "personal information" as a distinct concept. We model it once and reuse it appropriately throughout the system.

### Domain Validation: Business Rules as Code

Our validation rules directly reflect business requirements:

- **Address Validation**: Must be valid US addresses (a business requirement).
- **Email Validation**: Must be RFC-compliant for reliable customer communication.
- **Phone Number Validation**: Adheres to E.164 format for international compatibility.
- **Money Validation**: Ensures decimal precision to prevent financial calculation errors.
- **Business Logic Validation**: Enforces rules for rental periods, discount limits, inventory status, etc.

**Learning Point**: Validation is not merely about preventing system errors; it is about enforcing the business rules that domain experts deem critical.

## Architectural Benefits You Will Experience

### 1. Clarity in Business Logic

When business rules change, the location for updates is clear. Domain experts can read and verify the logic.

### 2. Comprehensive Type Safety

It becomes impossible to have mismatches between APIs, databases, and domain models. TypeScript and TypeSpec ensure consistency.

### 3. Maintainable Complexity

As business rules become more complex, the domain structure evolves with them in a predictable and organized manner.

### 4. Meaningful Testing

Domain logic is isolated from infrastructure concerns, making the testing of business rules straightforward.

### 5. Consistently Current Documentation

API documentation is generated directly from domain models, ensuring it is always accurate and up-to-date.

### 6. Clear Integration Points

The database layer, API layer, and business logic have well-defined boundaries and responsibilities.

## Defining Domain Boundaries: What We Own

Our video rental domain encompasses:

- **Customer Management**: All aspects of customer accounts, eligibility, and discounts.
- **Inventory Management**: Physical video copies, condition tracking, and availability.
- **Rental Operations**: Core transaction processing and associated business rules.
- **Financial Operations**: Payment processing, pricing, discounts, and fee calculations.

**What Lies Outside Our Domain**: Employee management, general store operations, supplier relationships, marketing campaigns.

**Learning Point**: Clearly defined domain boundaries help you focus on what your business actually does, rather than attempting to cover every conceivable feature.

## Integration Architecture: How Components Connect

### Database Layer Integration

```typescript
// Domain models drive the database schema.
import { generateSqlSchema } from "@video-rental/domain/codegen";
const schema = generateSqlSchema(); // Enables type-safe database operations.
```

### API Layer Integration

```typescript
// Domain contracts are transformed into HTTP endpoints.
import { getOpenApiSpec } from "@video-rental/domain";
const apiSpec = await getOpenApiSpec(); // Provides a complete API specification.
```

### Business Logic Integration

```typescript
// Domain services provide access to business operations.
import { CustomerService, RentalService } from "@video-rental/domain";
// Utilize business logic without needing to know implementation details.
```

**Learning Point**: A domain-first development approach means that business logic dictates the design of other components, not the reverse.

## Your DDD Learning Path Continues

Now that you have a better understanding of our domain structure:

1. **Explore the Code**: Examine the files in [`packages/domain/lib/`](../packages/domain/lib/) to see these patterns implemented.
2. **Try Modifications**: Attempt to add a new business rule and observe how it propagates through the system.
3. **Build Something New**: Use our established domain patterns to create new business operations.
4. **Test Business Logic**: Write tests for domain services to validate the correctness of business rules.

This pragmatic implementation of DDD provides a solid foundation for understanding how business domains can be translated into maintainable software architecture. These patterns are designed to scale with your business's complexity while keeping the code understandable for both developers and domain experts.
