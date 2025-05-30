# Payment Processing Sequence Diagram

This document outlines the sequence of operations involved in processing customer payments for various transaction types within the video rental system. The diagram below illustrates the interactions between the customer, store staff, Point of Sale (POS) system, Payment API, Payment Gateway, Database, and Payment Processor.

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

The system accommodates various types of fees that a customer might incur. The flowchart below details how these different fee types are handled and aggregated for payment.

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

The state diagram below illustrates the lifecycle of a payment, from initiation through to completion, failure, cancellation, or refund.

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

The payment processing system incorporates several key features to ensure a comprehensive and user-friendly experience:

- **Multiple Fee Types**: The system supports payments for all rental-related charges, including rental fees, late fees, damage charges, and membership fees.
- **Payment Method Flexibility**: A variety of payment methods are accepted, such as cash, credit cards, debit cards, checks, and gift cards.
- **Customer Discount Integration**: Applicable customer discounts are automatically applied to rental fees during the payment calculation.
- **Transaction Tracking**: Electronic payments are tracked using unique reference numbers, facilitating auditing and reconciliation.
- **Partial Payment Handling**: The system can manage scenarios such as insufficient gift card balances, allowing for partial payments and the use of multiple payment methods for a single transaction.
- **Receipt Generation**: Upon successful payment, a detailed receipt is generated, providing a breakdown of all fees and payments made.

## Business Rules

The following business rules govern the payment processing workflow:

- **Fee Aggregation**: Multiple outstanding fee types (e.g., rental, late fee) can be consolidated and paid within a single transaction.
- **Payment Method Validation**: Each payment method is subject to specific validation rules to ensure authenticity and sufficiency of funds.
- **Reference Number Requirement**: A unique reference number is mandatory for all electronic payments. This is optional for cash transactions.
- **Discount Application Scope**: Customer discounts are exclusively applied to rental fees and do not extend to penalties such as late fees or damage charges.
- **Gift Card Integration**: The system performs real-time balance checks and updates for gift card payments.
