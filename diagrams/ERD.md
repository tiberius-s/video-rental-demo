# Video Rental Store - Entity Relationship Diagram

This document contains the Entity Relationship Diagram (ERD) for the Video Rental Store domain model, accurately reflecting the current TypeSpec implementation.

## Domain Model Overview

The video rental store domain consists of the following core entities and their relationships:

- **Customer**: People who rent videos with personal information, membership details, and optional discount percentage
- **Video**: The movies/shows available for rent with pricing and availability
- **Inventory**: Physical copies of videos with condition and status tracking
- **Rental**: Active rental transactions with period and fee management
- **Payment**: Financial transactions with comprehensive payment method support

## Entity Relationship Diagram

```mermaid
erDiagram
    %% Core Business Entities
    Customer {
        string id PK "UUID"
        string name "1-255 chars"
        Email email "RFC-compliant"
        Address address "US address"
        PhoneNumber phoneNumber "E.164 format"
        decimal discountPercentage "0-100, nullable"
        string memberSince "date format"
        CustomerStatus status "Active|Suspended|Inactive"
    }

    Video {
        string id PK "UUID"
        string title "1-255 chars"
        string genre
        string rating "MPAA rating G|PG|PG-13|R|NC-17"
        int32 releaseYear
        int32 duration "minutes"
        string description
        string director
        decimal rentalPrice "daily rate"
        int32 availableCopies "calculated"
        int32 totalCopies "total owned"
    }

    Inventory {
        string id PK "UUID"
        string videoId FK
        string copyId "physical identifier"
        CopyCondition condition "Good|Defective"
        CopyStatus status "Available|Rented|Retired"
        string dateAcquired "date format"
        string lastRentedDate "nullable date"
    }

    Rental {
        string id PK "UUID"
        string customerId FK
        string videoId FK
        string inventoryId FK "specific copy rented"
        RentalPeriod period "start|due|return dates"
        Money rentalFee "amount charged"
        Money lateFee "nullable late charges"
        RentalStatus status "Active|Returned|Overdue|Cancelled|Extended"
    }

    Payment {
        string id PK "UUID"
        string customerId FK
        string rentalId FK "nullable - may not be rental-specific"
        Money amount "with currency"
        PaymentType paymentType "Rental|LateFee|Damage|Membership"
        PaymentMethod paymentMethod "Cash|CreditCard|DebitCard|Check|GiftCard"
        string paymentDate "date-time format"
        string referenceNumber "nullable transaction ref"
        PaymentStatus status "Completed|Pending|Failed|Refunded|Cancelled"
    }

    Address {
        string street
        string city
        State state "US State (50 states: AL, AK, AZ, AR...WY)"
        string zipCode
    }

    %% Relationships

    %% Customer Relationships
    Customer ||--o{ Rental : "rents videos"
    Customer ||--o{ Payment : "makes payments"

    %% Video Relationships
    Video ||--o{ Inventory : "has physical copies"
    Video ||--o{ Rental : "is rented"

    %% Inventory Relationships
    Inventory }|--|| Video : "is copy of"

    %% Rental Relationships
    Rental }|--|| Customer : "rented by"
    Rental }|--|| Video : "rents"
    Rental ||--o{ Payment : "generates payments"

    %% Payment Relationships
    Payment }|--|| Customer : "paid by"
    Payment }|--o| Rental : "pays for"
```

## Business Rules and Constraints

### Key Business Logic

1. **Rental Lifecycle**:

   - Customer rents a video → Rental becomes Active → Returns to complete cycle
   - Customers with discount percentage get automatic pricing reductions
   - Rentals can become Overdue if not returned by due date
   - Late fees are calculated for overdue rentals

2. **Inventory Management**:

   - Each Video can have multiple physical copies (Inventory)
   - Copy status tracks availability: Available → Rented → Available
   - Copy condition affects rental eligibility

3. **Payment Processing**:

   - Payments can be for rentals, late fees, damages, or membership
   - Multiple payment methods supported
   - Payment status tracks transaction lifecycle

4. **Customer Management**:

   - Customers can have multiple active rentals
   - Payment history is maintained per customer
   - Customer discounts are configurable via discountPercentage field
   - Address information is directly stored with customer

### Data Integrity Rules

- All primary keys are UUIDs for global uniqueness
- Foreign key relationships ensure referential integrity
- Nullable fields allow for incomplete transactions (e.g., dateReturned)
- Enum constraints ensure valid status values
- Date/time fields track transaction chronology

### API Operations

Each entity supports full CRUD operations plus specialized business operations:

- **Videos**: Search, genre filtering, availability checking
- **Rentals**: Return processing, overdue tracking, customer history, price calculation with customer discounts
- **Inventory**: Video-specific tracking, availability reporting
- **Payments**: Customer payment history, transaction processing
- **Customers**: Standard CRUD operations, discount percentage management

This domain model provides a comprehensive foundation for a video rental store management system with proper business logic, data integrity, and operational workflows.
