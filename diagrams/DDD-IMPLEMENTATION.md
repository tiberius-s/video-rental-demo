# Domain-Driven Design Implementation

## Overview

This document outlines the Domain-Driven Design (DDD) implementation for the Video Rental Store application. The domain package follows DDD best practices with a streamlined approach focused on essential business workflows and clear separation of concerns.

## Current Domain Structure

### 📁 Value Objects (`/models/value-objects/`)

Value objects represent concepts that are defined only by their attributes and have no identity. They are immutable and encapsulate business rules.

- **`Address`** - Physical location with validation rules for US addresses and state enum
- **`Email`** - Email address with RFC-compliant format validation
- **`PhoneNumber`** - Phone number with E.164 international format validation
- **`Money`** - Currency amount with decimal precision and ISO 4217 currency codes
- **`RentalPeriod`** - Time period for rentals with start, due, and optional return dates

### 📁 Domain Models (`/models/`)

Core business entities representing the main concepts in the video rental domain:

- **`Customer`** - Customer information with personal details (name, email, address, phone) and optional discount percentage
- **`Video`** - Video catalog entries with metadata, pricing, and availability counts
- **`Rental`** - Rental transactions with period tracking, fees, and status management
- **`Inventory`** - Physical video copies with condition and status tracking
- **`Payment`** - Financial transactions with comprehensive payment method support
- **`Health`** - System health monitoring model
- **`Common`** - Shared API models (ErrorResponse, HealthResponse, PaginationParams, ApiDocumentation)

### 📁 Domain Services (`/services/`)

Domain services encapsulate business logic that doesn't naturally fit into entities or value objects. These are internal business logic interfaces, not REST endpoints:

- **`CustomerService`** - Customer business logic (eligibility checks, customer discounts, rental summaries)
- **`RentalService`** - Rental calculations, pricing with discounts, late fees, and rental period management

### 📁 Pragmatic DDD Approach

This implementation follows a **pragmatic DDD approach** focusing on essential business patterns:

- **Domain Services** - Business logic encapsulated in clear service interfaces
- **Value Objects** - Immutable business concepts with validation rules
- **Domain Models** - Core entities representing business concepts
- **REST Operations** - Simplified API endpoints covering all essential workflows

_Note: Traditional CQRS patterns (aggregates, commands, queries) are intentionally omitted to maintain simplicity while preserving the option to add them when business complexity warrants it._

### 📁 REST API Routes (`/routes.tsp`)

The API provides **32 comprehensive operations** across **21 endpoints** organized by business capability:

- **System Operations** (2 operations):

  - `GET /health` - Health check endpoint
  - `GET /docs` - API documentation endpoint

- **Video Catalog Management** (6 operations):

  - `POST /videos` - Add new video to catalog
  - `GET /videos` - List videos with search and filtering
  - `GET /videos/{videoId}` - Get video details
  - `PATCH /videos/{videoId}` - Update video information
  - `GET /videos/{videoId}/availability` - Check video availability
  - `DELETE /videos/{videoId}` - Remove video from catalog (soft delete)

- **Customer Operations** (7 operations):

  - `POST /customers` - Register new customer
  - `GET /customers` - List customers with filtering
  - `GET /customers/{customerId}` - Get customer details
  - `PATCH /customers/{customerId}` - Update customer information
  - `DELETE /customers/{customerId}` - Deactivate customer (soft delete)
  - `GET /customers/{customerId}/eligibility` - Check rental eligibility
  - `GET /customers/{customerId}/rentals` - Get customer rental history

- **Rental Operations** (5 operations):

  - `POST /rentals` - Create new rental with eligibility checks
  - `GET /rentals/{rentalId}` - Get rental details
  - `DELETE /rentals/{rentalId}` - Cancel rental with refund processing
  - `POST /rentals/{rentalId}/return` - Return rented video with late fee calculation
  - `GET /rentals/overdue` - List overdue rentals for follow-up

- **Payment Processing** (3 operations):

  - `POST /payments` - Process payment for rentals and fees
  - `GET /payments/{paymentId}` - Get payment details
  - `GET /payments/customer/{customerId}` - Get customer payment history

- **Inventory Management** (4 operations):
  - `POST /inventory` - Add new video copy to inventory
  - `GET /inventory/video/{videoId}` - Get all copies for a specific video
  - `PATCH /inventory/{inventoryId}` - Update inventory item status/condition
  - `DELETE /inventory/{inventoryId}` - Remove copy from inventory (damaged/lost)

## Business Rules Implemented

### Customer Management

- **Customer Discounts**: Customers can receive configurable percentage discounts
- **Rental Eligibility**: Comprehensive eligibility checking with active/overdue rental limits
- **PersonBase Composition**: Shared personal information pattern eliminates code duplication
- **Customer Status**: Active, Suspended, Inactive status tracking with business rule enforcement

### Rental Business Logic

- **Pricing Calculations**: Base video pricing with automatic customer discount application
- **Late Fee Management**: Automatic calculation and tracking of overdue penalties
- **Status Lifecycle**: Complete rental lifecycle (Active → Returned/Overdue/Cancelled/Extended)
- **Due Date Enforcement**: Business rules prevent new rentals with overdue items
- **Inventory Integration**: Rental operations tied to specific physical copy tracking

### Inventory Management

- **Multi-Copy Support**: Multiple physical copies per video title with individual tracking
- **Condition Tracking**: Excellent, Good, Fair, Damaged, Defective condition states
- **Status Management**: Available, Rented, Maintenance, Retired status tracking
- **Availability Calculation**: Real-time availability based on copy status and condition

### Payment Processing

- **Comprehensive Payment Types**: Rental, Late Fee, Damage, Refund, Membership support
- **Multiple Payment Methods**: Cash, Credit Card, Debit Card, Check, Gift Card
- **Transaction Lifecycle**: Completed, Pending, Failed, Refunded, Cancelled status tracking
- **Customer Payment History**: Complete financial transaction history per customer

## Technical Implementation

### TypeSpec-Based Development

- **API-First Development**: Domain models defined in TypeSpec generate comprehensive OpenAPI specs
- **Type Safety**: All models use TypeSpec with comprehensive validation rules
- **Generic Types**: Database operations use compile-time type safety
- **Strict Typing**: Throughout the domain layer with proper constraint validation

### Composition Patterns

- **PersonBase Pattern**: Shared base model for customer information
- **Value Object Reuse**: Common patterns like Address, Email, PhoneNumber used across entities
- **Enum Hierarchies**: Role-based access with Manager → ShiftSupervisor → Clerk progression
- **Common API Models**: Reusable ErrorResponse, PaginationParams, HealthResponse models

### Domain Validation

- **Address**: US state validation with complete 50-state enum, ZIP code format validation (5-digit and ZIP+4)
- **Email**: RFC-compliant email format validation with proper error messaging
- **PhoneNumber**: E.164 international phone number format validation
- **Money**: Decimal precision for currency amounts with ISO 4217 currency code validation
- **Business Logic**: Domain-specific constraints (rental periods, discount percentages)
- **Status Enums**: Comprehensive status tracking for rentals, payments, inventory, customers

### TypeSpec Implementation Details

- **API-First Development**: Complete domain models defined in TypeSpec with OpenAPI 3.1 generation
- **Type Safety**: Comprehensive validation rules with format decorators and constraints
- **Tag Metadata**: Structured API documentation with descriptions for all endpoint groups
- **Generic Patterns**: Reusable pagination, error handling, and response patterns
- **Service Annotations**: BasicAuth security, server configuration, and route organization

### Code Generation

- **OpenAPI 3.1 Specification**: Complete API documentation with business context
- **TypeScript Types**: Generated interfaces and types for compile-time safety
- **Validation Schemas**: Runtime validation from TypeSpec decorators
- **Documentation**: Rich API docs with examples and business rules

## Architectural Benefits

1. **Separation of Concerns**: Clear boundaries between domain logic, REST operations, and infrastructure
2. **Type Safety**: Complete compile-time validation and comprehensive IntelliSense support
3. **Business Logic Encapsulation**: Domain rules centralized in appropriate service interfaces
4. **Pragmatic DDD**: Essential patterns without unnecessary complexity overhead
5. **Maintainability**: Clear domain model makes business changes and extensions easier
6. **API Documentation**: Rich OpenAPI specification with business context and examples
7. **Testing Foundation**: Isolated domain logic enables comprehensive unit testing

## Streamlined Domain Focus

The pragmatic approach balances DDD principles with practical implementation:

- **Essential Patterns Only**: Core DDD concepts without overwhelming complexity
- **Comprehensive API Surface**: 32 operations across 21 endpoints covering all essential workflows and full CRUD capabilities
- **Clean Architecture**: Streamlined structure without unused pattern folders
- **Clear Composition**: PersonBase pattern demonstrates effective code reuse
- **Business Rule Clarity**: Domain services encapsulate complex business logic appropriately

## Domain Boundaries

The video rental domain is clearly bounded by:

- **Customer Management**: Complete customer lifecycle with discount support
- **Inventory Management**: Video catalog with physical copy tracking and availability
- **Rental Operations**: Core transaction processing with comprehensive business rules
- **Financial Operations**: Payment processing, pricing, discounts, and fee management

## Integration Points

- **Database Layer**: Type-safe queries through DbClient with complete generic support
- **API Layer**: RESTful HTTP endpoints generated from comprehensive domain models
- **Business Logic**: Centralized in domain services with clear interface definitions
- **Validation**: Declarative validation through TypeSpec decorators and constraints
- **Documentation**: Auto-generated OpenAPI with business context and tag descriptions

This streamlined DDD implementation provides a solid foundation for a video rental business focused on essential workflows while maintaining business rule integrity and providing clear pathways for future expansion.
