# Video Rental Store - Entity Relationship Diagram

This document contains the Entity Relationship Diagram (ERD) for the Video Rental Store domain model, accurately reflecting the current TypeSpec implementation.

## Domain Model Overview

The video rental store domain consists of the following core entities and their relationships:

- **PersonBase**: Shared composition pattern for common personal information (name, email, address, phone)
- **Customer**: People who rent videos (composes PersonBase)
- **Employee**: Store staff members (composes PersonBase)
- **Video**: The movies/shows available for rent with pricing and availability
- **Inventory**: Physical copies of videos with condition and status tracking
- **Rental**: Active rental transactions with period and fee management
- **Payment**: Financial transactions with comprehensive payment method support

## Entity Relationship Diagram

```mermaid
erDiagram
    %% Composition Base Model
    PersonBase {
        string name "1-255 chars"
        Email email "RFC-compliant"
        Address address "US address"
        PhoneNumber phoneNumber "E.164 format"
    }

    %% Core Business Entities
    Customer {
        string id PK "UUID"
        string employeeId FK "nullable - employee discount reference"
        string memberSince "date format"
        CustomerStatus status "Active|Suspended|Inactive"
    }

    Employee {
        string id PK "UUID"
        string startDate "date format"
        EmployeeRole role "Manager|ShiftSupervisor|Clerk"
        Money hourlyWage "with currency"
        boolean isActive "employment status"
        decimal discountPercentage "0-100"
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
        CopyCondition condition "Excellent|Good|Fair|Damaged|Defective"
        CopyStatus status "Available|Rented|Maintenance|Retired"
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
        PaymentType paymentType "Rental|LateFee|Damage|Refund|Membership"
        PaymentMethod paymentMethod "Cash|CreditCard|DebitCard|Check|GiftCard"
        string paymentDate "date-time format"
        string referenceNumber "nullable transaction ref"
        PaymentStatus status "Completed|Pending|Failed|Refunded|Cancelled"
    }

    %% Relationships showing composition
    Customer ||--|| PersonBase : "uses"
    Employee ||--|| PersonBase : "uses"

    Address {
        string street
        string city
        State state "US State enum"
        string zipCode
    }

    %% Enums and Status Types

    CopyCondition {
        string Excellent
        string Good
        string Fair
        string Damaged
        string Defective
    }

    CopyStatus {
        string Available
        string Rented
        string Maintenance
        string Retired
    }

    RentalStatus {
        string Active
        string Returned
        string Overdue
        string Cancelled
    }

    PaymentType {
        string Rental
        string LateFee
        string Damage
        string Refund
        string Membership
    }

    PaymentMethod {
        string Cash
        string CreditCard
        string DebitCard
        string Check
        string GiftCard
    }

    PaymentStatus {
        string Completed
        string Pending
        string Failed
        string Refunded
        string Cancelled
    }

    EmployeeRole {
        string Manager
        string ShiftSupervisor
        string Clerk
    }

    State {
        string AL
        string AK
        string AZ
        string AR
        string CA
        string CO
        string CT
        string DE
        string FL
        string GA
        string HI
        string ID
        string IL
        string IN
        string IA
        string KS
        string KY
        string LA
        string ME
        string MD
        string MA
        string MI
        string MN
        string MS
        string MO
        string MT
        string NE
        string NV
        string NH
        string NJ
        string NM
        string NY
        string NC
        string ND
        string OH
        string OK
        string OR
        string PA
        string RI
        string SC
        string SD
        string TN
        string TX
        string UT
        string VT
        string VA
        string WA
        string WV
        string WI
        string WY
    }

    %% Relationships

    %% Customer Relationships
    Customer ||--o{ Rental : "rents videos"
    Customer ||--o{ Payment : "makes payments"
    Customer ||--|| Address : "has address"
    Customer }|--o| Employee : "may be employee (for discounts)"

    %% Video Relationships
    Video ||--o{ Inventory : "has physical copies"
    Video ||--o{ Rental : "is rented"

    %% Inventory Relationships
    Inventory }|--|| Video : "is copy of"
    Inventory ||--|| CopyCondition : "has condition"
    Inventory ||--|| CopyStatus : "has status"

    %% Rental Relationships
    Rental }|--|| Customer : "rented by"
    Rental }|--|| Video : "rents"
    Rental ||--|| RentalStatus : "has status"
    Rental ||--o{ Payment : "generates payments"

    %% Payment Relationships
    Payment }|--|| Customer : "paid by"
    Payment }|--o| Rental : "pays for"
    Payment ||--|| PaymentType : "has type"
    Payment ||--|| PaymentMethod : "uses method"
    Payment ||--|| PaymentStatus : "has status"

    %% Employee Relationships
    Employee ||--|| Address : "has address"
    Employee ||--|| EmployeeRole : "has role"
    Employee ||--o{ Customer : "may also be customer (for discounts)"

    %% Address Relationships
    Address ||--|| State : "located in"
```

## Business Rules and Constraints

### Key Business Logic

1. **Rental Lifecycle**:

   - Customer rents a video → Rental becomes Active → Returns to complete cycle
   - Employee-customers get automatic discounts based on their `employeeId` reference
   - Rentals can become Overdue if not returned by due date
   - Late fees are calculated for overdue rentals

2. **Inventory Management**:

   - Each Video can have multiple physical copies (Inventory)
   - Copy status tracks availability: Available → Rented → Available
   - Copy condition affects rental eligibility

3. **Payment Processing**:

   - Payments can be for rentals, late fees, damages, refunds, or membership
   - Multiple payment methods supported
   - Payment status tracks transaction lifecycle

4. **Customer Management**:

   - Customers can have multiple active rentals
   - Payment history is maintained per customer
   - Address information is shared structure
   - Customers can reference an `employeeId` for automatic discounts

5. **Employee Operations**:
   - Simplified role structure: Manager and Clerk only
   - Employees rent videos as customers with automatic discounts applied
   - Employee discounts are configurable per employee
   - No separate employee rental tracking needed - use customer rental history
   - Wage tracking and active status management

### Data Integrity Rules

- All primary keys are UUIDs for global uniqueness
- Foreign key relationships ensure referential integrity
- Nullable fields allow for incomplete transactions (e.g., dateReturned)
- Enum constraints ensure valid status values
- Date/time fields track transaction chronology

### API Operations

Each entity supports full CRUD operations plus specialized business operations:

- **Videos**: Search, genre filtering, availability checking
- **Rentals**: Return processing, overdue tracking, customer history, price calculation with employee discounts
- **Inventory**: Video-specific tracking, availability reporting
- **Payments**: Customer payment history, transaction processing
- **Employees**: Standard CRUD operations, discount percentage management

This domain model provides a comprehensive foundation for a video rental store management system with proper business logic, data integrity, and operational workflows.
