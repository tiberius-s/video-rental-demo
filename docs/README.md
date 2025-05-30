# Learning Domain-Driven Design Through Diagrams

Welcome to the visual learning center! This folder contains diagrams and documentation that teach Domain-Driven Design concepts through a familiar business domain - video rental.

## Why Start Here?

Before diving into code, it's helpful to understand the business domain visually. These diagrams answer fundamental questions:

- **What does the business do?** (Entity relationships and workflows)
- **How do the pieces fit together?** (System architecture and dependencies)
- **What happens when customers interact with the system?** (Sequence diagrams)

Think of this as your business analysis before writing any code.

## Your Learning Path

### 🌱 **Start Here: Understanding the Business**

1. **[Entity Relationship Diagram](./ERD.md)** - See the core business entities and how they relate

   - What is a Customer? A Video? A Rental?
   - How does money flow through the system?
   - What business rules govern these relationships?

2. **[Domain-Driven Design Implementation](./DDD-IMPLEMENTATION.md)** - Learn how business concepts become code
   - Value objects vs entities - what's the difference?
   - Domain services - where business logic lives
   - How TypeSpec helps model business domains

### 🔄 **Then Explore: Business Processes**

1. **[Workflow Documentation](./workflows/)** - See how business operations actually work

   - How do customers register?
   - What happens during a video rental?
   - How are overdue videos handled?

2. **[Workflow Interconnections](./workflows/00-workflow-interconnections.md)** - Understand the big picture
   - How do different business processes depend on each other?
   - Where are the integration points?
   - What drives what in the system?

### 🎬 **Finally Experience: Interactive Flows**

1. **[Sequence Diagrams](./sequence/)** - Watch the system in action
   - Step-by-step customer interactions
   - Error handling and edge cases
   - How business rules get enforced in real scenarios

- **Customer Registration**: Streamlined customer onboarding
- **Video Catalog Management**: Content and metadata management
- **Rental Creation**: Complete rental workflow with discount integration
- **Return Processing**: Simplified condition handling
- **Overdue Management**: Automated notification system
- **Payment Processing**: Multi-type payment handling
- **Inventory Management**: Copy lifecycle without maintenance complexity

## 🔧 How to View Diagrams

### In VS Code

1. Install the [Excalidraw extension](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor)
2. Click on any `.excalidraw` file to open it in the visual editor
3. Edit, modify, or export diagrams as needed

### In Browser

1. Go to [excalidraw.com](https://excalidraw.com)
2. Click "Open" and select the `.excalidraw` file
3. View and edit the diagram online

## 📊 Current Domain Stats

- **Total Operations**: 25+ endpoints across 6 functional areas (simplified)
- **Domain Models**: 5 core entities (removed PersonBase pattern)
- **Value Objects**: 5 immutable business concepts
- **Domain Services**: 2 streamlined business logic services
- **Business Rules**: Simplified rental operations focusing on core workflows
- **Enum Simplification**: Reduced complexity with essential values only

## 🎯 Functional Areas

1. **System** (2 operations) - Health monitoring and documentation
2. **Videos** (6 operations) - Complete catalog management with CRUD operations
3. **Customers** (5 operations) - Simplified customer lifecycle (no employee references)
4. **Rentals** (5 operations) - Core rental workflow with customer discount integration
5. **Payments** (4 operations) - Streamlined payment processing (4 payment types)
6. **Inventory** (4+ operations) - Simplified copy management (Good/Defective only)

## 🏗️ Architecture Highlights

- **API-First Development** with TypeSpec
- **Simplified Domain Model** with essential entities only
- **Customer-Centric Design** removing employee complexity
- **Streamlined Enums** for better usability
- **Automatic Discount Application** via customer percentage field
- **Type Safety** throughout the domain layer
- **Clean Separation** between domain logic and infrastructure
- **Comprehensive Validation** with simplified business rules
- **Rich Documentation** auto-generated from TypeSpec definitions

## 🔄 Recent Simplifications

- **Removed PersonBase**: Folded fields directly into Customer entity
- **Eliminated Employee References**: Customer-focused operations only
- **Streamlined Enums**: CopyCondition (2 values), PaymentType (4 values)
- **Simplified Workflows**: Removed complex branching and maintenance paths
- **Enhanced Documentation**: Updated all diagrams and workflows

---

_Last Updated: May 30, 2025_
_All diagrams and documentation reflect the current simplified domain implementation_
