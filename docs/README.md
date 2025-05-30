# Learning Domain-Driven Design Through Diagrams

Welcome to the visual learning center! This folder contains diagrams and documentation designed to teach Domain-Driven Design (DDD) concepts using the familiar business domain of a video rental store.

## Why Start Here?

Before diving into the codebase, it is beneficial to understand the business domain visually. These diagrams and documents aim to answer fundamental questions such as:

- What are the core activities and components of the business? (Illustrated by entity relationships and workflows)
- How do the various parts of the system interact and depend on each other? (Explained through system architecture and dependency descriptions)
- What are the typical sequences of events when customers interact with the system? (Detailed in sequence diagrams)

Consider this section as a preparatory business analysis phase before you begin coding.

## Your Learning Path

### 🌱 **Start Here: Understanding the Business Domain**

1. **[Entity Relationship Diagram](./ERD.md)**: This diagram illustrates the core business entities and their interrelationships.

   - What defines a `Customer`, a `Video`, or a `Rental`?
   - How is financial information managed within the system?
   - What specific business rules govern these relationships?

2. **[Domain-Driven Design Implementation](./DDD-IMPLEMENTATION.md)**: This document explains how abstract business concepts are translated into concrete code structures.
   - What is the distinction between Value Objects and Entities?
   - Where is the primary business logic located (i.e., Domain Services)?
   - How does TypeSpec facilitate the modeling of business domains?

### 🔄 **Then Explore: Business Processes and Workflows**

1. **[Workflow Documentation](./workflows/)**: Explore detailed diagrams illustrating how key business operations are executed.

   - How do new customers register an account?
   - What are the steps involved in renting a video?
   - How does the system handle overdue video returns?

2. **[Workflow Interconnections](./workflows/00-workflow-interconnections.md)**: This diagram provides a high-level overview of how different business processes are interconnected.
   - How do various business processes depend on one another?
   - What are the key integration points between different workflows?
   - What are the primary drivers and triggers within the system?

### 🎬 **Finally Experience: Interactive System Flows**

1. **[Sequence Diagrams](./sequence/)**: These diagrams provide a step-by-step visualization of system interactions for various scenarios.

   - Observe detailed customer interaction flows.
   - Understand how error conditions and edge cases are managed.
   - See how business rules are enforced in practical scenarios.

   Key scenarios include:

   - **Customer Registration**: A streamlined process for onboarding new customers.
   - **Video Catalog Management**: Procedures for managing video content and metadata.
   - **Rental Creation**: The complete workflow for renting a video, including the integration of customer discounts.
   - **Return Processing**: Simplified handling of video returns and condition assessment.
   - **Overdue Management**: An automated system for notifying customers about overdue rentals.
   - **Payment Processing**: Handling of various payment types for rentals and fees.
   - **Inventory Management**: Managing the lifecycle of individual video copies, focusing on core availability and condition tracking.

## 🔧 How to View Diagrams

Mermaid diagrams are rendered directly in Markdown. For Excalidraw files (if any are added later):

### In VS Code

1. Install the [Excalidraw extension](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor).
2. Click on any `.excalidraw` file to open it in the visual editor.
3. You can then edit, modify, or export diagrams as needed.

### In Browser

1. Navigate to [excalidraw.com](https://excalidraw.com).
2. Click "Open" and select the `.excalidraw` file from your local system.
3. View and edit the diagram directly in your web browser.

## 📊 Current Domain Statistics (Simplified Model)

- **Total Operations**: Over 25 API endpoints distributed across 6 primary functional areas.
- **Domain Models**: 5 core entities (the `PersonBase` pattern has been removed for simplification).
- **Value Objects**: 5 immutable objects representing fundamental business concepts.
- **Domain Services**: 2 streamlined services encapsulating core business logic.
- **Business Rules**: Simplified rental operations focusing on essential workflows.
- **Enum Simplification**: Reduced complexity with only essential values for enumerated types.

## 🎯 Functional Areas

1. **System** (2 operations): Provides health monitoring and access to documentation.
2. **Videos** (6 operations): Manages the video catalog, including full CRUD (Create, Read, Update, Delete) capabilities.
3. **Customers** (5 operations): Handles the customer lifecycle (simplified, with no employee-related references).
4. **Rentals** (5 operations): Manages the core rental workflow, including integration with customer discount policies.
5. **Payments** (4 operations): Processes payments for various transaction types (supporting 4 distinct payment types).
6. **Inventory** (4+ operations): Manages individual video copies (simplified to `Good` or `Defective` conditions only).

## 🏗️ Architecture Highlights

- **API-First Development**: Utilizes TypeSpec for defining and designing APIs prior to implementation.
- **Simplified Domain Model**: Focuses on essential entities to reduce complexity.
- **Customer-Centric Design**: Prioritizes customer interactions and removes complexities related to internal employee roles.
- **Streamlined Enums**: Employs simplified enumerated types for improved clarity and usability.
- **Automatic Discount Application**: Discounts are automatically applied based on the `discountPercentage` field in the `Customer` entity.
- **Type Safety**: Ensures type consistency and safety throughout the domain layer.
- **Clean Separation of Concerns**: Maintains a clear distinction between domain logic and infrastructure components.
- **Comprehensive Validation**: Implements validation based on simplified business rules.
- **Rich Documentation**: API documentation is auto-generated from TypeSpec definitions.

## 🔄 Recent Simplifications

- **Removed `PersonBase`**: Integrated fields directly into the `Customer` entity for a flatter structure.
- **Eliminated Employee References**: Focused operations solely on customer-facing interactions.
- **Streamlined Enums**: Simplified `CopyCondition` (to 2 values) and `PaymentType` (to 4 values).
- **Simplified Workflows**: Removed complex branching logic and paths related to maintenance or less common scenarios.
- **Enhanced Documentation**: Updated all diagrams and textual documentation to reflect the current, simplified domain model.

---

_Last Updated: May 30, 2025_
_All diagrams and documentation reflect the current simplified domain implementation_
