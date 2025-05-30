# Payment Processing Sequence Diagram

This diagram shows the payment processing workflow for various transaction types.

## Sequence Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as Store Staff
    participant UI as POS System
    participant API as Payment API
    participant PG as Payment Gateway
    participant DB as Database
    participant PS as Payment Processor

    note over C, PS: Payment Processing for Multiple Transaction Types

    S->>UI: Initiate payment
    UI->>API: GET /customers/{id}/outstanding-fees
    API->>DB: Query unpaid charges
    DB->>API: Outstanding fees by type

    API->>UI: Fees breakdown
    note over API, UI: Rental, LateFee, Damage, Membership

    UI->>S: Display fees to customer
    S->>C: Explain charges

    C->>S: Choose payment method
    S->>UI: Select payment method
    note over S, UI: Cash, CreditCard, DebitCard, Check, GiftCard

    alt Cash Payment
        S->>UI: Enter cash amount
        UI->>API: POST /payments
        note over UI, API: {amount, paymentMethod: "Cash", type: "Mixed"}

        API->>DB: Create payment record
        DB->>API: Payment ID created

        API->>DB: Update outstanding fees status
        DB->>API: Fees marked as paid

        API->>UI: Payment processed
        UI->>S: Print receipt

    else Electronic Payment
        UI->>PG: Initialize payment
        note over UI, PG: Amount + payment method details

        PG->>PS: Process payment
        PS->>PG: Authorization response

        alt Payment Authorized
            PG->>UI: Payment approved

            UI->>API: POST /payments
            note over UI, API: {amount, method, referenceNumber, type}

            API->>DB: Create payment record
            note over API, DB: Status: Completed, reference number stored

            DB->>API: Payment recorded

            API->>DB: Update outstanding fees
            DB->>API: Fees cleared

            API->>UI: Payment successful
            UI->>S: Print receipt

        else Payment Declined
            PG->>UI: Payment declined
            UI->>S: Show decline reason
            S->>C: Request alternative payment
        end

    else Gift Card Payment
        S->>UI: Enter gift card number
        UI->>API: GET /gift-cards/{number}/balance
        API->>UI: Available balance

        alt Sufficient balance
            UI->>API: POST /payments
            note over UI, API: {amount, method: "GiftCard", cardNumber}

            API->>DB: Process gift card payment
            DB->>API: Balance updated, payment recorded

            API->>UI: Payment successful
            UI->>S: Show remaining balance

        else Insufficient balance
            UI->>S: Insufficient funds
            S->>C: Request additional payment method
        end
    end

    S->>C: Provide receipt
    note over S, C: Payment confirmation with breakdown
```

## Payment Type Handling

```mermaid
flowchart TD
    A[Outstanding Fees] --> B{Fee Type}
    B -->|Rental| C[Video rental charge]
    B -->|LateFee| D[Overdue penalty]
    B -->|Damage| E[Copy damage charge]
    B -->|Membership| F[Account fees]

    C --> G[Calculate total with customer discount]
    D --> H[Add to payment]
    E --> H
    F --> H
    G --> H

    H --> I[Process payment]

    style C fill:#e3f2fd
    style D fill:#fff3e0
    style E fill:#ffebee
    style F fill:#f3e5f5
```

## Payment Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Payment initiated
    Pending --> Completed: Successful payment
    Pending --> Failed: Payment declined
    Pending --> Cancelled: User cancelled
    Completed --> Refunded: Refund processed
    Failed --> [*]: End process
    Cancelled --> [*]: End process
    Refunded --> [*]: End process

    note right of Completed: Fees cleared from customer account
```

## Key Features

1. **Multiple Payment Types**: Supports all rental-related fee types
2. **Payment Method Flexibility**: Cash, cards, checks, gift cards
3. **Customer Discount Integration**: Applied to rental fees automatically
4. **Transaction Tracking**: Reference numbers for electronic payments
5. **Partial Payments**: Can handle insufficient gift card balances
6. **Receipt Generation**: Detailed breakdown of fees and payments

## Business Rules

- **Fee Aggregation**: Multiple fee types can be paid in single transaction
- **Payment Methods**: Different validation rules per payment type
- **Reference Numbers**: Required for electronic payments, optional for cash
- **Customer Discounts**: Applied only to rental fees, not penalties
- **Gift Card Integration**: Real-time balance checking and updates
