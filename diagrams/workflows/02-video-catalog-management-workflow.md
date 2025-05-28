# Video Catalog Management Workflow

## Overview

Video catalog management including adding titles, updating metadata, availability checking, and video information maintenance. Each video supports multiple physical copies tracked through inventory integration.

## Business Rules

- Video titles must be unique within catalog
- Valid pricing information required (rental rates)
- Genre classification and rating information mandatory
- Available copy count calculated from inventory status
- Video status: Active, Inactive, or Discontinued
- Real-time availability calculations with inventory integration

## Workflow Diagram

```mermaid
flowchart TD
    A[Video Request] --> B[Determine Operation]
    B --> C{Operation Type}
    C -->|Add Video| D[Validate Metadata]
    C -->|Update Video| E[Update Video Info]
    C -->|Check Availability| F[Calculate Availability]
    C -->|Search Videos| G[Search Catalog]

    %% Add Video
    D --> H{Valid Data?}
    H -->|No| I[Return Validation Errors]
    H -->|Yes| J[Check Title Uniqueness]
    J --> K{Title Available?}
    K -->|No| L[Return Duplicate Error]
    K -->|Yes| M[Create Video Record]
    M --> N[Save to Database]

    %% Update Video
    E --> O[Validate Video ID]
    O --> P{Video Exists?}
    P -->|No| Q[Return Not Found]
    P -->|Yes| R[Apply Updates]
    R --> S[Save Changes]

    %% Check Availability
    F --> T[Query Inventory]
    T --> U[Count Available Copies]
    U --> V[Return Availability]

    %% Search Catalog
    G --> W[Apply Search Filters]
    W --> X[Query Video Catalog]
    X --> Y[Return Search Results]

    style A fill:#e1f5fe
    style N fill:#c8e6c9
    style S fill:#c8e6c9
    style V fill:#c8e6c9
    style Y fill:#c8e6c9
    style I fill:#ffcdd2
    style L fill:#ffcdd2
    style Q fill:#ffcdd2
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/videos` | Add new video to catalog |
| GET | `/videos/{id}` | Retrieve video details |
| PATCH | `/videos/{id}` | Update video information |
| GET | `/videos/search` | Search catalog with filters |

## Key Features

- **Title Management**: Unique title enforcement and metadata validation
- **Inventory Integration**: Real-time availability calculations from physical copies
- **Search & Filtering**: Advanced search by genre, rating, and availability
- **Status Management**: Active/Inactive/Discontinued video lifecycle
- **Pricing Management**: Rental rate configuration and updates

## Integration Points

- **Inventory Service**: Queries physical copy availability and condition
- **Rental Service**: Provides video data for rental transactions
- **Search Service**: Indexes video metadata for advanced searching
- **Database**: Maintains video catalog and metadata integrity

## Error Handling

- **Validation Errors**: Invalid metadata, missing required fields
- **Business Rule Violations**: Duplicate titles, invalid status transitions
- **Integration Errors**: Inventory service failures, search index issues
- **Database Errors**: Constraint violations, update failures
