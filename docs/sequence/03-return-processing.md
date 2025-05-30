# Video Return Processing Sequence Diagram

This diagram illustrates the sequence of interactions for the simplified video return processing workflow, including video condition assessment and late fee calculation.

## Sequence Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as Store Staff
    participant UI as POS System
    participant API as Rental API
    participant IDB as Inventory Service
    participant PDB as Pricing Service
    participant DB as Database

    note over C, DB: Simplified Video Return Processing

    C->>S: Returns video copy
    S->>UI: Scan copy barcode/ID

    UI->>API: GET /rentals/active?copyId={copyId}
    API->>DB: Find active rental
    DB->>API: Rental details

    alt No active rental found
        API->>UI: Error: No active rental
        UI->>S: Invalid return
    else Active rental found
        API->>UI: Rental details + customer info

        S->>S: Inspect video condition
        note over S: Physical inspection of returned copy

        S->>UI: Enter condition assessment
        note over S, UI: Good or Defective only

        alt Video in Good condition
            UI->>API: POST /rentals/{id}/return
            note over UI, API: {condition: "Good", returnDate: now}

            API->>PDB: Calculate any late fees
            PDB->>API: Late fee amount (if overdue)

            API->>DB: Update rental status to Returned
            API->>IDB: Update copy status to Available
            API->>IDB: Update copy condition to Good

            DB->>API: Rental updated
            IDB->>API: Inventory updated

            alt Late fees apply
                API->>DB: Create payment record for late fee
                DB->>API: Payment record created
                API->>UI: Return processed + late fee due
                UI->>S: Show late fee to customer
            else No late fees
                API->>UI: Return processed successfully
                UI->>S: Return complete
            end

        else Video is Defective
            UI->>API: POST /rentals/{id}/return
            note over UI, API: {condition: "Defective", returnDate: now}

            API->>PDB: Calculate late fees + damage fee
            PDB->>API: Total fees due

            API->>DB: Update rental status to Returned
            API->>IDB: Update copy status to Retired
            API->>IDB: Update copy condition to Defective

            API->>DB: Create payment record for damage

            DB->>API: Records updated
            API->>UI: Return processed + damage fee due
            UI->>S: Show damage fee to customer
        end

        S->>C: Explain any fees due
        note over S, C: Late fees and/or damage fees
    end
```

## Rental Status Transitions During Return

```mermaid
stateDiagram-v2
    [*] --> Active: Rental created
    Active --> Overdue: Past due date
    Active --> Returned: Returned on time
    Overdue --> Returned: Returned late
    Returned --> [*]: Process complete

    note right of Returned: Copy condition affects inventory status
```

## Impact of Condition Assessment on Inventory

```mermaid
flowchart TD
    A[Video Returned] --> B{Condition Assessment}
    B -->|Good| C[Copy status: Available]
    B -->|Defective| D[Copy status: Retired]
    C --> E[Available for next rental]
    D --> F[Removed from circulation]
    D --> G[Damage fee applied]

    style C fill:#c8e6c9
    style D fill:#ffcdd2
    style G fill:#fff3e0
```

## Key Features of Return Processing

1.  **Simplified Condition Assessment**: Store staff assess the returned video copy and categorize its condition as either `Good` or `Defective`.
2.  **Automated Fee Calculation**: The system automatically calculates any applicable late fees based on the actual return date compared to the due date.
3.  **Inventory Management Integration**: The status and condition of the returned `Inventory` copy are updated based on the assessment. `Good` copies become `Available`, while `Defective` copies are `Retired`.
4.  **Damage Handling Protocol**: If a video copy is returned in `Defective` condition, it is retired from circulation, and a damage fee may be applied to the customer's account.
5.  **Payment Record Creation**: Any assessed fees (late fees or damage fees) are automatically recorded as pending payments, to be handled by the payment processing workflow.

## Governing Business Rules

- **Late Fee Calculation**: Late fees are determined by multiplying the number of days overdue by the video's daily rental rate.
- **Damage Assessment**: The store staff makes a binary decision (`Good` or `Defective`) regarding the condition of the returned video copy.
- **Copy Retirement Policy**: Video copies assessed as `Defective` are permanently removed from the rentable inventory.
- **Fee Collection Process**: While fees are recorded during the return process, the actual collection of these fees is handled separately through the dedicated payment processing workflow.
