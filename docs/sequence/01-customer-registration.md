# Customer Registration Sequence Diagram

This diagram illustrates the sequence of interactions for the simplified customer registration workflow in the video rental system.

## Sequence Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant UI as Frontend UI
    participant API as Rental API
    participant DB as Database
    participant V as Validation

    note over C, DB: Simplified Customer Registration

    C->>UI: Provides registration info
    note over C: Name, email, address, phone

    UI->>V: Validate input format
    V->>UI: Validation result

    alt Validation successful
        UI->>API: POST /customers
        note over UI, API: {name, email, address, phoneNumber}

        API->>V: Server-side validation
        V->>API: Validation passed

        API->>DB: Create customer record
        note over API, DB: Auto-generate ID, set memberSince date

        DB->>API: Customer created successfully
        API->>UI: 201 Created + customer data

        UI->>C: Registration successful
        note over UI, C: Customer can now rent videos

    else Validation failed
        UI->>C: Show validation errors
        note over UI, C: Request correction of invalid fields
    end
```

## Key Aspects of the Registration Process

- **Streamlined Process**: The customer registration process is designed for direct self-service, allowing users to create accounts without requiring intervention from system administrators or employees.
- **System-Generated Fields**: Upon successful registration, the system automatically generates a unique `id` for the customer, sets the `memberSince` date to the current date, and assigns a default `status` (typically 'Active').
- **Optional Discount Configuration**: The `discountPercentage` field, which determines eligibility for rental discounts, is not set during the initial registration. It can be configured at a later time through separate administrative operations.
- **Immediate System Access**: Once the registration is complete and successful, customers gain immediate access to the system and can begin renting videos.
- **Comprehensive Validation**: To ensure data integrity and adherence to business rules, validation of the provided information is performed on both the client-side (within the Frontend UI) and on the server-side (by the Rental API).

## Customer Status Transitions

```mermaid
stateDiagram-v2
    [*] --> Registering: Customer provides info
    Registering --> Active: Validation passed
    Registering --> [*]: Validation failed
    Active --> Suspended: Admin action
    Active --> Inactive: Admin action
    Suspended --> Active: Admin reactivation
    Inactive --> Active: Admin reactivation
```

Upon successful completion of the registration process, a new customer record is created with an `Active` status, enabling them to utilize the video rental services immediately.
