# Payment Processing Workflow

## Overview

Comprehensive payment transaction management supporting multiple payment methods, customer discounts, and payment types (rental, late fees, damage, refunds, membership). Maintains complete payment history and audit trails.

## Business Rules

- Payments processed for exact calculated amounts
- Multiple payment methods: cash, card, check, gift card
- Customer discounts applied before payment processing
- Failed payments require retry or alternative payment
- Refunds require manager approval over threshold
- Complete payment history maintained for accounting

## Workflow Diagram

```mermaid
flowchart TD
    A[Payment Request] --> B[Validate Input]
    B --> C{Valid?}
    C -->|No| D[Return Errors]
    C -->|Yes| E[Determine Payment Type]

    %% Payment Type Processing
    E --> F{Payment Type}
    F -->|Rental| G[Calculate Rental Amount]
    F -->|Late Fee| H[Calculate Late Fee]
    F -->|Damage| I[Calculate Damage Fee]
    F -->|Refund| J[Process Refund]
    F -->|Membership| K[Process Membership]

    %% Amount Calculation
    G --> L{Customer Discount?}
    H --> M[Validate Fee Amount]
    I --> N[Validate Damage Amount]
    J --> O[Validate Refund Authorization]
    K --> P[Membership Amount]

    L -->|Yes| Q[Apply Discount]
    L -->|No| R[Base Amount]
    Q --> S[Process Payment]
    R --> S
    M --> S
    N --> S
    O --> T{Authorized?}
    P --> S

    T -->|No| U[Return Authorization Error]
    T -->|Yes| S

    %% Payment Processing
    S --> V[Validate Payment Method]
    V --> W{Method Valid?}
    W -->|No| X[Return Method Error]
    W -->|Yes| Y[Process Transaction]
    Y --> Z{Transaction Success?}
    Z -->|No| AA[Return Payment Failed]
    Z -->|Yes| BB[Create Payment Record]
    BB --> CC[Update Related Records]
    CC --> DD[Generate Receipt]

    style A fill:#e1f5fe
    style DD fill:#c8e6c9
    style D fill:#ffcdd2
    style U fill:#ffcdd2
    style X fill:#ffcdd2
    style AA fill:#ffcdd2
```

## API Endpoints

| Method | Endpoint                   | Purpose                         |
| ------ | -------------------------- | ------------------------------- |
| POST   | `/payments`                | Process new payment transaction |
| GET    | `/payments/{id}`           | Retrieve payment details        |
| GET    | `/customers/{id}/payments` | Customer payment history        |
| POST   | `/payments/{id}/refund`    | Process payment refund          |

## Key Features

- **Multiple Payment Methods**: Cash, credit/debit cards, checks, gift cards
- **Customer Discounts**: Automatic discount application before payment
- **Payment Types**: Rental, late fees, damage charges, refunds, membership
- **Authorization**: Manager approval for refunds over threshold
- **Audit Trail**: Complete payment history and transaction logging

## Integration Points

- **Rental Service**: Links payments to rental transactions
- **Customer Service**: Updates customer payment history and status
- **Customer Service**: Validates customer discounts and authorization
- **Payment Gateway**: Processes credit card and electronic transactions
- **Database**: Maintains payment records and transaction integrity

## Error Handling

- **Validation Errors**: Invalid payment amount, method, or customer data
- **Authorization Errors**: Insufficient permissions for refunds or adjustments
- **Transaction Errors**: Payment gateway failures, declined transactions
- **Business Rule Violations**: Invalid payment type or amount combinations
