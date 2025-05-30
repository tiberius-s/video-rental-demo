# Video Rental Creation Sequence Diagram

This diagram shows the complete rental creation workflow with customer discount handling.

## Sequence Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant UI as Frontend UI
    participant API as Rental API
    participant VDB as Video Service
    participant IDB as Inventory Service
    participant PDB as Pricing Service
    participant DB as Database

    note over C, DB: Video Rental Creation with Customer Discounts

    C->>UI: Select video to rent
    UI->>VDB: GET /videos/{id}
    VDB->>UI: Video details + base rental price

    UI->>IDB: GET /videos/{id}/inventory/available
    IDB->>UI: Available copies list

    alt No copies available
        UI->>C: Video not available
    else Copies available
        UI->>API: GET /customers/{customerId}
        API->>DB: Fetch customer details
        DB->>API: Customer data + discount percentage
        API->>UI: Customer info with discount

        UI->>PDB: Calculate rental price
        note over UI, PDB: Base price + customer discount + rental period

        PDB->>UI: Final rental price

        UI->>C: Show rental details + price
        C->>UI: Confirm rental

        UI->>API: POST /rentals
        note over UI, API: {customerId, videoId, rentalPeriod}

        API->>IDB: Reserve available copy
        IDB->>API: Inventory copy reserved

        API->>PDB: Calculate final fees
        note over API, PDB: Apply customer discount if applicable

        PDB->>API: Rental fee calculated

        API->>DB: Create rental record
        note over API, DB: Status: Active, dates set, fees calculated

        DB->>API: Rental created

        API->>IDB: Update copy status to Rented
        IDB->>API: Copy status updated

        API->>UI: 201 Created + rental details
        UI->>C: Rental confirmed

        note over C: Customer can pick up video
    end
```

## Pricing Calculation Details

```mermaid
flowchart TD
    A[Base Rental Price] --> B{Customer has discount?}
    B -->|Yes| C[Apply discount percentage]
    B -->|No| D[Use base price]
    C --> E[Calculate daily rate × rental period]
    D --> E
    E --> F[Final Rental Fee]

    style C fill:#e1f5fe
    style F fill:#c8e6c9
```

## Key Business Rules

1. **Inventory Management**: System automatically selects an available copy
2. **Customer Discounts**: Applied automatically based on `discountPercentage` field
3. **Rental Period**: Standard rental period with due date calculation
4. **Status Tracking**: Rental status set to `Active`, copy status to `Rented`
5. **Fee Calculation**: Includes customer discounts and any applicable taxes

## Error Handling

- **No Available Copies**: Customer notified, can request notification when available
- **Invalid Customer**: Suspended or inactive customers cannot rent
- **Payment Required**: Some rentals may require upfront payment
- **System Errors**: Graceful fallback with inventory reservation rollback
