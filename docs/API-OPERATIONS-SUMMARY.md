# Learning API Design: From Business Operations to HTTP Endpoints

Welcome to our API design exploration! This document shows you how we transformed business operations into RESTful HTTP endpoints that actually make sense to both developers and business stakeholders.

## Why This API Design Matters

Most APIs are designed around database tables (CRUD operations). Our API is designed around **business operations** - the things people actually do in a video rental store. This approach makes the API intuitive and sustainable.

**What You'll Learn:**

- How to design APIs that reflect business operations instead of database structure
- Why endpoint naming and HTTP methods should match domain expert language
- How to organize complex business workflows into clear, maintainable API contracts

## Your API Learning Journey: 32 Business Operations Across 21 Endpoints

Let's explore each endpoint group and understand the business thinking behind the technical design.

---

## 🏥 System Operations - Keeping Things Running

### The Business Need: "Is our store working?"

| Method | Endpoint         | Business Purpose               | Learning Focus            |
| ------ | ---------------- | ------------------------------ | ------------------------- |
| `GET`  | `/api/v1/health` | Store operational status check | Infrastructure monitoring |
| `GET`  | `/api/v1/docs`   | How to use our systems         | Self-documenting APIs     |

**API Design Insight**: Even technical endpoints should serve business needs. Store managers need to know if systems are working, and developers need current documentation.

**Why These Matter:**

- `GET /health` - Operations teams can monitor store systems 24/7
- `GET /docs` - Developers always have current API documentation (auto-generated from domain models)

---

## 🎬 Video Catalog Management - What We Rent

### The Business Need: "Managing our movie selection"

| Method   | Endpoint                                | What Staff Actually Do           | API Design Pattern      |
| -------- | --------------------------------------- | -------------------------------- | ----------------------- |
| `POST`   | `/api/v1/videos`                        | "Add new movies to our catalog"  | Resource creation       |
| `GET`    | `/api/v1/videos`                        | "Browse/search our movie list"   | Collection with search  |
| `GET`    | `/api/v1/videos/{videoId}`              | "Look up movie details"          | Resource retrieval      |
| `PATCH`  | `/api/v1/videos/{videoId}`              | "Update movie info/pricing"      | Partial resource update |
| `DELETE` | `/api/v1/videos/{videoId}`              | "Stop renting this movie"        | Resource deactivation   |
| `GET`    | `/api/v1/videos/{videoId}/availability` | "How many copies available now?" | Business calculation    |

**Learning Points:**

- **Resource vs. Operation**: Most are resource-focused (`/videos/{id}`) but availability is a business operation
- **HTTP Method Meaning**: PATCH for updates (not PUT) because we update specific fields, not replace entire records
- **Soft Deletes**: DELETE deactivates rather than destroying data (business requirement)
- **Business Language**: Endpoints use terms staff actually say ("availability" not "inventory count")

**Why This Design Works:**

Staff training is easier because the API matches how they think about catalog management. The availability endpoint demonstrates business logic exposed as an API operation.

---

## 👥 Customer Operations - Who Rents From Us

### The Business Need: "Managing customer relationships"

| Method   | Endpoint                                     | Customer Service Reality              | Business Value            |
| -------- | -------------------------------------------- | ------------------------------------- | ------------------------- |
| `POST`   | `/api/v1/customers`                          | "Sign up new customers"               | Customer acquisition      |
| `GET`    | `/api/v1/customers`                          | "Find a customer by name/phone"       | Customer service lookup   |
| `GET`    | `/api/v1/customers/{customerId}`             | "Pull up customer account"            | Account management        |
| `PATCH`  | `/api/v1/customers/{customerId}`             | "Update customer information"         | Data maintenance          |
| `DELETE` | `/api/v1/customers/{customerId}`             | "Deactivate problem customers"        | Account lifecycle         |
| `GET`    | `/api/v1/customers/{customerId}/eligibility` | "Can this customer rent more videos?" | Business rule enforcement |
| `GET`    | `/api/v1/customers/{customerId}/rentals`     | "What has this customer rented?"      | Relationship history      |

**API Design Learning:**

- **Nested Resources**: `/customers/{id}/eligibility` represents a business question about a customer
- **Business Operations vs. Data**: Eligibility checking is a business rule, not just data retrieval
- **Relationship Endpoints**: `/customers/{id}/rentals` shows related data in context

**Business Rules Implemented:**

- **Customer Eligibility**: Complex business logic (overdue items, account status, rental limits)
- **Customer Discounts**: Percentage-based discounts applied automatically
- **Soft Account Management**: Deactivation preserves rental history

**Why Staff Love This API**: It matches their mental model of customer service. They ask "Can this customer rent?" and get a direct answer, not raw data to interpret.

---

## 🎯 Rental Operations - The Core Business Transaction

### The Business Need: "The transactions that make us money"

| Method   | Endpoint                            | What Actually Happens                              | Business Complexity         |
| -------- | ----------------------------------- | -------------------------------------------------- | --------------------------- |
| `POST`   | `/api/v1/rentals`                   | "Rent a video" (eligibility + inventory + pricing) | Multi-step business process |
| `GET`    | `/api/v1/rentals/{rentalId}`        | "Look up rental details"                           | Transaction inquiry         |
| `DELETE` | `/api/v1/rentals/{rentalId}`        | "Cancel rental" (refund + inventory return)        | Business process reversal   |
| `POST`   | `/api/v1/rentals/{rentalId}/return` | "Customer returning video" (condition + late fees) | Complex state transition    |
| `GET`    | `/api/v1/rentals/overdue`           | "Which rentals are overdue?" (staff follow-up)     | Business intelligence query |

**Complex Business Logic Hiding Behind Simple Endpoints:**

**POST `/rentals`** - Creating a rental involves:

1. Customer eligibility verification
2. Inventory availability checking
3. Discount calculation and application
4. Payment processing
5. Inventory status updates
6. Due date calculation

**POST `/rentals/{id}/return`** - Returning involves:

1. Video condition assessment
2. Late fee calculation (if overdue)
3. Inventory status updates
4. Payment processing (for late fees)
5. Rental completion

**API Design Insight**: Complex business operations can have simple API interfaces. The complexity is handled in the domain layer, not exposed to API consumers.

**Why This Matters**: Staff perform these operations hundreds of times daily. The API should make common operations simple, even when the underlying business logic is complex.

---

## 💳 Payment Processing - Money Management

### The Business Need: "Handle money correctly and safely"

| Method | Endpoint                                 | Financial Reality                     | Business Requirements      |
| ------ | ---------------------------------------- | ------------------------------------- | -------------------------- |
| `POST` | `/api/v1/payments`                       | "Process payment for rentals/fees"    | Multi-method payment       |
| `GET`  | `/api/v1/payments/{paymentId}`           | "Look up payment transaction"         | Financial audit trail      |
| `GET`  | `/api/v1/payments/customer/{customerId}` | "Customer's complete payment history" | Customer financial history |

**Payment Complexity Handled:**

- **Multiple Payment Types**: Rental fees, late fees, damage charges, refunds, membership fees
- **Multiple Payment Methods**: Cash, credit cards, debit cards, checks, gift cards
- **Customer Discounts**: Automatic application during payment processing
- **Audit Requirements**: Complete transaction history for financial compliance

**Learning Point**: Payment APIs need to handle business complexity (discounts, multiple payment types) while maintaining simplicity for common use cases.

---

## 💿 Inventory Management - Physical Asset Tracking

### The Business Need: "Track our physical video copies"

| Method   | Endpoint                            | Physical Reality               | Asset Management  |
| -------- | ----------------------------------- | ------------------------------ | ----------------- |
| `POST`   | `/api/v1/inventory`                 | "Add new copies to inventory"  | Asset acquisition |
| `GET`    | `/api/v1/inventory/video/{videoId}` | "All copies of this movie"     | Asset location    |
| `PATCH`  | `/api/v1/inventory/{inventoryId}`   | "Update copy condition/status" | Asset maintenance |
| `DELETE` | `/api/v1/inventory/{inventoryId}`   | "Remove damaged/lost copy"     | Asset disposition |

**Business Rules in Code:**

- **Condition Tracking**: Good vs. Defective (simplified for learning)
- **Status Management**: Available, Rented, Retired
- **Availability Calculation**: Real-time counts based on copy status
- **Physical Copy Identity**: Each copy has unique tracking (not just quantities)

**API Design Insight**: Inventory is separate from catalog because physical copies have different business rules than video titles.

---

## 🏗️ API Architecture Learning Points

### Business-First Design Principles

#### 1. Endpoints Match Business Operations

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

- `POST /rentals` - Create new business transaction
- `PATCH /customers/{id}` - Update specific customer fields
- `DELETE /videos/{id}` - Remove from active catalog (soft delete)
- `GET /rentals/overdue` - Business intelligence query

### Domain-Driven API Design

**Resource Organization**: Matches business domains (customers, videos, rentals, payments, inventory)

**Nested Resources**: Show business relationships (`/customers/{id}/rentals`)

**Business Operations**: Exposed as endpoints when they represent domain expert actions

**Validation**: Business rules enforced at API boundaries using domain constraints

### Technical Implementation Benefits

**Type Safety**: All endpoints generated from TypeSpec domain models

**Documentation**: Auto-generated from business domain definitions

**Consistency**: Business rules centralized in domain layer, not scattered across endpoints

**Testing**: Business logic isolated from HTTP concerns

## Your API Design Learning Path

### 1. Study Business Operations First

Before designing endpoints, understand what domain experts actually do:

- What questions do they ask?
- What operations do they perform?
- What information do they need together?

### 2. Design Resources Around Business Concepts

Our resources match business language:

- `Customer` (not `User` or `Person`)
- `Rental` (not `Transaction` or `Booking`)
- `Inventory` (not `Items` or `Assets`)

### 3. Expose Business Operations as Endpoints

When domain experts perform complex operations, provide simple API interfaces:

- `GET /customers/{id}/eligibility` - Complex business rules, simple question
- `POST /rentals/{id}/return` - Complex process, single endpoint

### 4. Let Business Logic Drive Technical Decisions

- HTTP status codes reflect business outcomes
- Error messages use business language
- Validation rules enforce business constraints
- Documentation explains business context

## Why This API Design Succeeds

**For Developers**: Intuitive endpoints that match mental models of the business

**For Business Stakeholders**: API operations they can understand and validate

**For Maintenance**: Business changes map clearly to specific endpoints

**For Integration**: Clear business context makes integration decisions obvious

This API demonstrates how domain-driven design creates technical interfaces that serve business needs while remaining technically excellent. The key insight: start with business operations, then design the technical implementation to serve them.
