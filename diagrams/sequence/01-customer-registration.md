# Customer Registration Sequence Diagram

This diagram shows the simplified customer registration workflow in the video rental system.

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

## Key Points

- **Simplified Process**: Direct customer creation without employee involvement
- **Auto-Generated Fields**: System sets `id`, `memberSince`, and default `status`
- **Optional Discount**: `discountPercentage` can be set later via admin operations
- **Immediate Access**: Customer can start renting videos immediately after registration
- **Validation**: Both client and server-side validation ensure data integrity

## Status Transitions

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

The registration process creates customers in `Active` status, ready for immediate video rentals.
