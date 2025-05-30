# Inventory Management Sequence Diagram

This document outlines the simplified workflow for managing the inventory of video copies within the rental system. The diagram below illustrates the interactions between a Manager, the Admin User Interface (UI), the Inventory API, the Video Service, the Database, and the Reporting Service.

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

The state diagram below illustrates the lifecycle of a video copy, from its acquisition to its eventual retirement.

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

The flowchart below provides a high-level overview of how total video copies are categorized by their status (Available, Rented, Retired) and condition.

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

The mind map below details the types of information and analyses available through inventory reports, covering copy status, condition analysis, video performance, and operational metrics.

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

The inventory management system offers the following key features:

- **Simplified Workflow**: Core operations include adding new copies and retiring damaged or obsolete ones, minimizing complexity in maintenance tasks.
- **Automatic Availability Counting**: The system automatically calculates the availability of videos based on the status of individual copies.
- **Condition Tracking**: A straightforward binary assessment (Good/Defective) is used to track the condition of each copy.
- **Retirement Management**: A clear and defined process is in place for removing copies from circulation when they are no longer suitable for rental.
- **Reporting Integration**: The system provides access to real-time inventory status and enables historical analysis through integrated reporting features.

## Business Rules

The inventory management process is governed by the following business rules:

- **New Copy Defaults**: Newly added copies are automatically set to "Good" condition and "Available" status.
- **Status Transition Control**: Only predefined and logical transitions between statuses are permitted (as depicted in the state diagram).
- **Retirement Criteria**: Copies marked as defective must be retired and cannot be returned to active circulation.
- **Availability Accuracy**: The count of available videos accurately reflects the number of copies that are currently rentable.
- **Audit Trail Maintenance**: All changes to a copy's status are logged with timestamps and reasons for the change, ensuring a comprehensive audit trail.

## Administrative Controls

The system includes the following administrative controls to manage inventory effectively:

- **Access Control**: Inventory modification privileges (adding/retiring copies) are restricted to authorized personnel, typically managers.
- **Input Validation**: The system enforces rules to prevent invalid status transitions or data entries.
- **Bulk Operations Support**: Functionality is provided to support adding multiple copies of a video in a single operation.
- **Search Capabilities**: Robust search functionality allows users to find specific copies based on ID, video title, status, or condition.
- **Comprehensive Reporting**: Detailed reports are available for inventory analysis, trend identification, and operational oversight.
