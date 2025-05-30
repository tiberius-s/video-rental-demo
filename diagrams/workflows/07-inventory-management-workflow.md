# Inventory Management Workflow

## Overview

Physical copy tracking workflow managing individual video copies with condition monitoring and real-time availability calculations. Handles complete copy lifecycle from purchase to retirement.

## Business Rules

- Individual tracking for each physical copy with unique identifier
- Copy conditions: Good or Defective
- Available copies must be in Good condition for rental
- Defective copies removed from rental inventory
- Real-time availability calculations based on copy status

## Workflow Diagram

```mermaid
flowchart TD
    A[Inventory Request] --> B[Determine Action Type]
    B --> C{Action Type}
    C -->|Add Copy| D[Add New Copy]
    C -->|Update Status| E[Update Copy Status]
    C -->|Check Availability| F[Calculate Availability]

    %% Add New Copy
    D --> G[Validate Video Exists]
    G --> H{Video Valid?}
    H -->|No| I[Return Video Error]
    H -->|Yes| J[Create Copy Record]
    J --> K[Set Good Condition]
    K --> L[Update Video Availability]

    %% Update Copy Status
    E --> M[Validate Copy Exists]
    M --> N{Copy Valid?}
    N -->|No| O[Return Copy Error]
    N -->|Yes| P[Update Copy Condition]
    P --> Q[Update Availability]

    %% Availability Calculation
    F --> R[Query All Copies for Video]
    R --> S[Filter Good Condition]
    S --> T[Count Available Copies]
    T --> U[Return Availability Count]

    style A fill:#e1f5fe
    style L fill:#c8e6c9
    style Q fill:#c8e6c9
    style U fill:#c8e6c9
    style I fill:#ffcdd2
    style O fill:#ffcdd2
    style P fill:#ffcdd2
```

## API Endpoints

| Method | Endpoint                         | Purpose                      |
| ------ | -------------------------------- | ---------------------------- |
| POST   | `/inventory`                     | Add new copy to inventory    |
| PATCH  | `/inventory/{copyId}`            | Update copy status/condition |
| GET    | `/inventory/video/{videoId}`     | List copies for video        |
| GET    | `/videos/{videoId}/availability` | Check real-time availability |

## Key Features

- **Individual Copy Tracking**: Unique identifier and condition for each copy
- **Condition Management**: Good or Defective status tracking
- **Real-time Availability**: Live calculations based on copy status and condition
- **Lifecycle Management**: Complete tracking from purchase to retirement

## Integration Points

- **Video Service**: Links copies to video catalog entries
- **Rental Service**: Provides availability data for rental creation
- **Return Service**: Updates copy condition after returns
- **Maintenance Service**: Schedules and tracks repair activities
- **Database**: Maintains copy records and availability calculations

## Error Handling

- **Validation Errors**: Invalid copy ID, video ID, or condition values
- **Business Rule Violations**: Invalid condition transitions or status changes
- **Availability Errors**: Calculation failures or inconsistent copy counts
- **Maintenance Errors**: Scheduling conflicts or invalid repair requests
