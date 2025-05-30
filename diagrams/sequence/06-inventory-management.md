# Inventory Management Sequence Diagram

This diagram shows the simplified inventory management workflow for video copies.

## Sequence Flow

```mermaid
sequenceDiagram
    participant M as Manager
    participant UI as Admin UI
    participant API as Inventory API
    participant VDB as Video Service
    participant DB as Database
    participant RS as Reporting Service

    note over M, RS: Simplified Inventory Management

    M->>UI: Access inventory management
    UI->>API: GET /inventory/dashboard
    API->>DB: Query inventory statistics
    DB->>API: Current inventory data
    API->>UI: Inventory overview

    alt Add New Copies
        M->>UI: Add copies for video
        UI->>VDB: GET /videos (search/select)
        VDB->>UI: Available videos list

        M->>UI: Select video + quantity
        UI->>API: POST /inventory/copies
        note over UI, API: {videoId, quantity, condition: "Good"}

        loop For each copy
            API->>DB: Create inventory record
            note over API, DB: Generate copyId, set status: "Available"
            DB->>API: Copy created
        end

        API->>VDB: Update video total copies count
        VDB->>API: Count updated

        API->>UI: Copies added successfully
        UI->>M: Show confirmation + copy IDs

    else Retire Damaged Copies
        M->>UI: Search for copy to retire
        UI->>API: GET /inventory/search?copyId={id}
        API->>DB: Find copy details
        DB->>API: Copy information

        alt Copy found and available for retirement
            API->>UI: Copy details
            M->>UI: Confirm retirement reason
            note over M, UI: Damaged, Lost, Obsolete

            UI->>API: PUT /inventory/{id}/retire
            note over UI, API: {condition: "Defective", status: "Retired"}

            API->>DB: Update copy status
            API->>VDB: Update video available copies count

            DB->>API: Copy retired
            VDB->>API: Count updated

            API->>UI: Copy retirement successful
            UI->>M: Confirmation message

        else Copy not found or ineligible
            API->>UI: Error message
            UI->>M: Cannot retire copy
        end

    else Generate Inventory Reports
        M->>UI: Request inventory report
        UI->>RS: Generate report request

        RS->>DB: Query inventory data
        note over RS, DB: By status, condition, video, date ranges

        DB->>RS: Inventory data
        RS->>UI: Formatted report
        UI->>M: Display/download report
    end
```

## Copy Lifecycle Management

```mermaid
stateDiagram-v2
    [*] --> Available: Copy acquired
    Available --> Rented: Customer rental
    Rented --> Available: Returned in good condition
    Rented --> Retired: Returned damaged/defective
    Available --> Retired: Proactive retirement
    Retired --> [*]: End of lifecycle

    note right of Available: Ready for rental
    note right of Rented: Out with customer
    note right of Retired: Removed from circulation
```

## Inventory Status Overview

```mermaid
flowchart TD
    A[Total Video Copies] --> B[Available Copies]
    A --> C[Rented Copies]
    A --> D[Retired Copies]

    B --> E[Good Condition]
    C --> F[Currently Out]
    D --> G[Damaged/Defective]
    D --> H[Lost/Obsolete]

    style B fill:#c8e6c9
    style C fill:#fff3e0
    style D fill:#ffcdd2
```

## Inventory Reporting

```mermaid
mindmap
  root((Inventory Reports))
    Copy Status
      Available Count
      Rented Count
      Retired Count
    Condition Analysis
      Good Condition
      Defective Copies
      Damage Trends
    Video Performance
      Most Rented
      Least Popular
      Revenue per Copy
    Operational Metrics
      Utilization Rates
      Copy Turnover
      Retirement Reasons
```

## Key Features

1. **Simplified Workflow**: Add copies and retire damaged ones - no maintenance complexity
2. **Automatic Counting**: Video availability automatically calculated from copy status
3. **Condition Tracking**: Binary condition assessment (Good/Defective)
4. **Retirement Management**: Clear process for removing copies from circulation
5. **Reporting Integration**: Real-time inventory status and historical analysis

## Business Rules

- **Copy Addition**: New copies default to "Good" condition and "Available" status
- **Status Transitions**: Only specific transitions allowed (see state diagram)
- **Retirement Criteria**: Defective copies must be retired, cannot return to circulation
- **Count Accuracy**: Video availability reflects actual rentable copies
- **Audit Trail**: All status changes logged with timestamps and reasons

## Administrative Controls

- **Access Control**: Only managers can add/retire inventory
- **Validation**: System prevents invalid status transitions
- **Bulk Operations**: Support for adding multiple copies at once
- **Search Capabilities**: Find copies by ID, video, status, or condition
- **Reporting**: Comprehensive inventory analysis and trends
