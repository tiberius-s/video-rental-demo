# Customer Registration & Management Workflow

## Overview

Handles customer registration, profile management, and eligibility verification with support for employee discount privileges through PersonBase composition.

## Business Rules

- Valid personal information required (name, email, address, phone)
- Email addresses must be unique across customers and employees
- Phone numbers in E.164 international format
- US addresses with proper state codes
- Employees can register as customers with automatic discount privileges
- Customer status: Active, Suspended, or Inactive

## Workflow Diagram

```mermaid
flowchart TD
    A[User Registration Request] --> B[Validate Input Data]
    B --> C{Valid Data?}
    C -->|No| D[Return Validation Errors]
    C -->|Yes| E[Check Email Uniqueness]
    E --> F{Email Available?}
    F -->|No| G[Return Email Conflict]
    F -->|Yes| H[Check Employee Reference]
    H --> I{Employee ID?}
    I -->|Yes| J[Validate Employee]
    J --> K{Valid Employee?}
    K -->|No| L[Return Employee Error]
    K -->|Yes| M[Create Customer + Employee Link]
    I -->|No| N[Create Regular Customer]
    M --> O[Set Discount Eligibility]
    N --> P[Set Standard Pricing]
    O --> Q[Save to Database]
    P --> Q
    Q --> R{Save Success?}
    R -->|No| S[Return Database Error]
    R -->|Yes| T[Return Customer Profile]

    %% Update workflow
    U[Update Request] --> V[Validate Customer ID]
    V --> W{Customer Exists?}
    W -->|No| X[Return Not Found]
    W -->|Yes| Y[Apply Updates]
    Y --> Z[Save Changes]
    Z --> AA[Return Updated Profile]

    %% Eligibility check
    BB[Eligibility Check] --> CC[Load Customer]
    CC --> DD{Active Status?}
    DD -->|No| EE[Return Inactive]
    DD -->|Yes| FF[Check Overdue Items]
    FF --> GG{Has Overdue?}
    GG -->|Yes| HH[Return Blocked]
    GG -->|No| II[Return Eligible]

    style A fill:#e1f5fe
    style T fill:#c8e6c9
    style AA fill:#c8e6c9
    style II fill:#c8e6c9
    style D fill:#ffcdd2
    style G fill:#ffcdd2
    style L fill:#ffcdd2
    style S fill:#ffcdd2
```

## API Endpoints

| Method | Endpoint                      | Purpose                             |
| ------ | ----------------------------- | ----------------------------------- |
| POST   | `/customers`                  | Create new customer with validation |
| GET    | `/customers/{id}`             | Retrieve customer profile           |
| PATCH  | `/customers/{id}`             | Update customer information         |
| GET    | `/customers/{id}/eligibility` | Check rental eligibility            |

## Key Features

- **Email Validation**: Uniqueness across customers and employees
- **Employee Integration**: Automatic discount linking for staff
- **Eligibility Checking**: Real-time rental availability verification
- **Profile Management**: Comprehensive customer data updates

## Integration Points

- **Employee Service**: Validates employee references for discount eligibility
- **Rental Service**: Provides eligibility data for rental creation
- **Payment Service**: Links customer to payment history and transactions
- **Database**: Persists customer data with referential integrity constraints

## Error Handling

- **Validation Errors**: Invalid email format, phone number, or address
- **Business Rule Violations**: Duplicate email, invalid employee reference
- **Database Errors**: Connection issues, constraint violations
- **Not Found Errors**: Customer ID not found for updates/lookups
