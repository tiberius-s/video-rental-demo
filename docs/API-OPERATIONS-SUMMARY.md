# API Design: From Business Operations to HTTP Endpoints

Welcome to this exploration of our API design! This document illustrates how we translated business operations into RESTful HTTP endpoints that are intuitive for both developers and business stakeholders.

## The Importance of This API Design Approach

Many APIs are structured around database tables, leading to CRUD (Create, Read, Update, Delete) operations. In contrast, our API is designed around **business operations**—the actual tasks performed in a video rental store. This approach results in a more intuitive and sustainable API.

**What You Will Learn:**

- How to design APIs that mirror business operations rather than database structures.
- Why endpoint naming and HTTP methods should align with the language used by domain experts.
- How to organize complex business workflows into clear and maintainable API contracts.

## API Learning Journey: 32 Business Operations Across 21 Endpoints

Let's explore each group of endpoints and understand the business rationale behind their technical design.

---

## 🏥 System Operations: Ensuring Smooth Functioning

### Business Need: "Is our system operational?"

| Method | Endpoint         | Business Purpose                | Learning Focus            |
| ------ | ---------------- | ------------------------------- | ------------------------- |
| `GET`  | `/api/v1/health` | System operational status check | Infrastructure monitoring |
| `GET`  | `/api/v1/docs`   | Access to system documentation  | Self-documenting APIs     |

**API Design Insight**: Even technical endpoints should address business needs. Store managers need to confirm system functionality, and developers require up-to-date documentation.

**Why These Endpoints Matter:**

- `GET /health`: Enables operations teams to monitor store systems continuously.
- `GET /docs`: Provides developers with always-current API documentation, auto-generated from domain models.

---

## 🎬 Video Catalog Management: Managing Our Movie Selection

### Business Need: "Managing our selection of movies"

| Method   | Endpoint                                | What Staff Actually Do            | API Design Pattern      |
| -------- | --------------------------------------- | --------------------------------- | ----------------------- |
| `POST`   | `/api/v1/videos`                        | "Add new movies to our catalog"   | Resource creation       |
| `GET`    | `/api/v1/videos`                        | "Browse or search our movie list" | Collection with search  |
| `GET`    | `/api/v1/videos/{videoId}`              | "Look up movie details"           | Resource retrieval      |
| `PATCH`  | `/api/v1/videos/{videoId}`              | "Update movie info or pricing"    | Partial resource update |
| `DELETE` | `/api/v1/videos/{videoId}`              | "Stop renting this movie"         | Resource deactivation   |
| `GET`    | `/api/v1/videos/{videoId}/availability` | "How many copies are available?"  | Business calculation    |

**Learning Points:**

- **Resource vs. Operation**: Most endpoints are resource-focused (e.g., `/videos/{id}`), but availability is a business operation.
- **HTTP Method Meaning**: `PATCH` is used for updates (not `PUT`) because we modify specific fields, rather than replacing entire records.
- **Soft Deletes**: `DELETE` deactivates data instead of permanently destroying it, as per business requirements.
- **Business Language**: Endpoints use terms familiar to staff (e.g., "availability" instead of "inventory count").

**Why This Design Is Effective:**

Staff training is simplified because the API aligns with their understanding of catalog management. The availability endpoint exemplifies business logic exposed as an API operation.

---

## 👥 Customer Operations: Managing Customer Relationships

### Business Need: "Managing relationships with our customers"

| Method   | Endpoint                                     | Customer Service Task                      | Business Value            |
| -------- | -------------------------------------------- | ------------------------------------------ | ------------------------- |
| `POST`   | `/api/v1/customers`                          | "Sign up new customers"                    | Customer acquisition      |
| `GET`    | `/api/v1/customers`                          | "Find a customer by name or phone"         | Customer service lookup   |
| `GET`    | `/api/v1/customers/{customerId}`             | "Pull up a customer\'s account"            | Account management        |
| `PATCH`  | `/api/v1/customers/{customerId}`             | "Update customer information"              | Data maintenance          |
| `DELETE` | `/api/v1/customers/{customerId}`             | "Deactivate problematic customer accounts" | Account lifecycle         |
| `GET`    | `/api/v1/customers/{customerId}/eligibility` | "Can this customer rent more videos?"      | Business rule enforcement |
| `GET`    | `/api/v1/customers/{customerId}/rentals`     | "What has this customer rented?"           | Relationship history      |

**API Design Learning:**

- **Nested Resources**: `/customers/{id}/eligibility` represents a business query about a specific customer.
- **Business Operations vs. Data**: Eligibility checking is a business rule, not merely data retrieval.
- **Relationship Endpoints**: `/customers/{id}/rentals` displays related data within its context.

**Business Rules Implemented:**

- **Customer Eligibility**: Involves complex business logic (e.g., overdue items, account status, rental limits).
- **Customer Discounts**: Percentage-based discounts are applied automatically.
- **Soft Account Management**: Deactivation preserves rental history.

**Why Staff Appreciate This API**: It aligns with their mental model of customer service. They can ask, "Can this customer rent?" and receive a direct answer, rather than raw data requiring interpretation.

---

## 🎯 Rental Operations: The Core Business Transaction

### Business Need: "Handling the transactions that generate revenue"

| Method   | Endpoint                            | What Actually Happens                                        | Business Complexity         |
| -------- | ----------------------------------- | ------------------------------------------------------------ | --------------------------- |
| `POST`   | `/api/v1/rentals`                   | "Rent a video" (involves eligibility, inventory, pricing)    | Multi-step business process |
| `GET`    | `/api/v1/rentals/{rentalId}`        | "Look up rental details"                                     | Transaction inquiry         |
| `DELETE` | `/api/v1/rentals/{rentalId}`        | "Cancel a rental" (involves refund, inventory return)        | Business process reversal   |
| `POST`   | `/api/v1/rentals/{rentalId}/return` | "Customer returning a video" (involves condition, late fees) | Complex state transition    |
| `GET`    | `/api/v1/rentals/overdue`           | "Which rentals are overdue?" (for staff follow-up)           | Business intelligence query |

**Complex Business Logic Behind Simple Endpoints:**

**`POST /rentals`** - Creating a rental involves:

1. Customer eligibility verification.
2. Inventory availability check.
3. Discount calculation and application.
4. Payment processing.
5. Inventory status updates.
6. Due date calculation.

**`POST /rentals/{id}/return`** - Processing a return involves:

1. Video condition assessment.
2. Late fee calculation (if overdue).
3. Inventory status updates.
4. Payment processing (for late fees).
5. Rental completion.

**API Design Insight**: Complex business operations can be represented by simple API interfaces. The complexity is managed within the domain layer, not exposed to API consumers.

**Why This Matters**: Staff perform these operations frequently. The API should simplify common tasks, even when the underlying business logic is intricate.

---

## 💳 Payment Processing: Managing Financial Transactions

### Business Need: "Handling money correctly and securely"

| Method | Endpoint                                 | Financial Task                        | Business Requirements      |
| ------ | ---------------------------------------- | ------------------------------------- | -------------------------- |
| `POST` | `/api/v1/payments`                       | "Process payment for rentals or fees" | Multi-method payment       |
| `GET`  | `/api/v1/payments/{paymentId}`           | "Look up a payment transaction"       | Financial audit trail      |
| `GET`  | `/api/v1/payments/customer/{customerId}` | "View a customer\'s payment history"  | Customer financial history |

**Payment Complexity Handled:**

- **Multiple Payment Types**: Rental fees, late fees, damage charges, refunds, membership fees.
- **Multiple Payment Methods**: Cash, credit cards, debit cards, checks, gift cards.
- **Customer Discounts**: Automatic application during payment processing.
- **Audit Requirements**: Complete transaction history for financial compliance.

**Learning Point**: Payment APIs must handle business complexity (e.g., discounts, various payment types) while maintaining simplicity for common use cases.

---

## 💿 Inventory Management: Tracking Physical Assets

### Business Need: "Tracking our physical video copies"

| Method   | Endpoint                            | Physical Task                     | Asset Management  |
| -------- | ----------------------------------- | --------------------------------- | ----------------- |
| `POST`   | `/api/v1/inventory`                 | "Add new copies to inventory"     | Asset acquisition |
| `GET`    | `/api/v1/inventory/video/{videoId}` | "List all copies of this movie"   | Asset location    |
| `PATCH`  | `/api/v1/inventory/{inventoryId}`   | "Update copy condition or status" | Asset maintenance |
| `DELETE` | `/api/v1/inventory/{inventoryId}`   | "Remove damaged or lost copy"     | Asset disposition |

**Business Rules in Code:**

- **Condition Tracking**: Simplified to "Good" vs. "Defective" for learning purposes.
- **Status Management**: "Available," "Rented," "Retired."
- **Availability Calculation**: Real-time counts based on copy status.
- **Physical Copy Identity**: Each copy is uniquely tracked (not just quantities).

**API Design Insight**: Inventory is managed separately from the catalog because physical copies and video titles have different business rules.

---

## 🏗️ API Architecture: Key Learning Points

### Business-First Design Principles

#### 1. Endpoints Mirror Business Operations

```http
# Good: Matches business language
GET /customers/{id}/eligibility

# Bad: Forces clients to implement business logic
GET /customers/{id}/rentals?status=overdue&calculate=fees
```

#### 2. Complex Operations Have Simple Interfaces

```http
# Simple interface, complex business logic
POST /rentals
{
  "customerId": "123",
  "inventoryId": "456"
}

# Backend handles: eligibility, discounts, inventory, payments
```

#### 3. HTTP Methods Reflect Business Intent

- `POST /rentals`: Creates a new business transaction.
- `PATCH /customers/{id}`: Updates specific customer fields.
- `DELETE /videos/{id}`: Removes a video from the active catalog (soft delete).
- `GET /rentals/overdue`: Performs a business intelligence query.

### Domain-Driven API Design

- **Resource Organization**: Aligns with business domains (customers, videos, rentals, payments, inventory).
- **Nested Resources**: Illustrate business relationships (e.g., `/customers/{id}/rentals`).
- **Business Operations**: Exposed as endpoints when they represent actions performed by domain experts.
- **Validation**: Business rules are enforced at API boundaries using domain constraints.

### Technical Implementation Benefits

- **Type Safety**: All endpoints are generated from TypeSpec domain models.
- **Documentation**: Auto-generated from business domain definitions.
- **Consistency**: Business rules are centralized in the domain layer, not dispersed across endpoints.
- **Testing**: Business logic is isolated from HTTP concerns.

## Your API Design Learning Path

### 1. Understand Business Operations First

Before designing endpoints, comprehend what domain experts actually do:

- What questions do they ask?
- What operations do they perform?
- What information do they need to see together?

### 2. Design Resources Around Business Concepts

Our resources match business terminology:

- `Customer` (not `User` or `Person`)
- `Rental` (not `Transaction` or `Booking`)
- `Inventory` (not `Items` or `Assets`)

### 3. Expose Business Operations as Endpoints

When domain experts perform complex operations, provide simple API interfaces:

- `GET /customers/{id}/eligibility`: Addresses complex business rules with a simple query.
- `POST /rentals/{id}/return`: Manages a complex process through a single endpoint.

### 4. Let Business Logic Drive Technical Decisions

- HTTP status codes should reflect business outcomes.
- Error messages should use business language.
- Validation rules must enforce business constraints.
- Documentation should explain the business context.

## Why This API Design Is Successful

- **For Developers**: Provides intuitive endpoints that align with their mental models of the business.
- **For Business Stakeholders**: Offers API operations they can understand and validate.
- **For Maintenance**: Business changes can be clearly mapped to specific endpoints.
- **For Integration**: A clear business context simplifies integration decisions.

This API demonstrates how domain-driven design can create technical interfaces that serve business needs effectively while maintaining technical excellence. The key insight is to start with business operations, then design the technical implementation to support them.
