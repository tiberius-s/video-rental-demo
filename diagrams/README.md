# Video Rental Store - Diagrams & Documentation

This folder contains comprehensive documentation and visual diagrams for the Video Rental Store domain implementation.

## 📋 Documentation Files

### [`DDD-IMPLEMENTATION.md`](./DDD-IMPLEMENTATION.md)

Detailed Domain-Driven Design implementation documentation covering:

- **Domain Structure**: Value objects, domain models, and services
- **Business Rules**: Customer management, rental logic, inventory tracking
- **API Overview**: 32 operations across 21 endpoints covering complete CRUD operations
- **Technical Implementation**: TypeSpec-based development approach
- **Architectural Benefits**: Separation of concerns and type safety

### [`ERD.md`](./ERD.md)

Entity Relationship documentation describing:

- **Core Entities**: Customer, Employee, Video, Rental, Payment, Inventory
- **Relationships**: How entities connect and interact
- **Business Rules**: Constraints and validation rules
- **Data Flow**: How information moves through the system

## 🎨 Visual Diagrams

### [`video-rental-erd.excalidraw`](./video-rental-erd.excalidraw)

**Entity Relationship Diagram** - Visual representation of:

- All domain entities with color-coded categories
- Relationships between entities (1:1, 1:many, many:many)
- Key fields and data types
- Business constraints and rules

### [`ddd-architecture.excalidraw`](./ddd-architecture.excalidraw)

**Domain Architecture Diagram** - Visual representation of:

- Layered architecture (API → Domain → Business Rules → Database)
- Domain services, models, and value objects
- Business rules implementation
- Technical benefits and features
- 32 API operations organized by functional area

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

- **Total Operations**: 32 across 21 endpoints in 7 functional areas
- **Domain Models**: 8 core entities + shared PersonBase pattern
- **Value Objects**: 5 immutable business concepts
- **Domain Services**: 2 business logic services
- **Business Rules**: Comprehensive coverage of rental operations

## 🎯 Functional Areas

1. **System** (2 operations) - Health monitoring and documentation
2. **Videos** (6 operations) - Complete catalog management with CRUD operations
3. **Customers** (7 operations) - Full customer lifecycle management
4. **Rentals** (5 operations) - Core rental workflow operations with cancellation
5. **Payments** (3 operations) - Financial transaction processing
6. **Employees** (5 operations) - Complete staff management with CRUD operations
7. **Inventory** (4 operations) - Physical copy lifecycle management

## 🏗️ Architecture Highlights

- **API-First Development** with TypeSpec
- **Pragmatic DDD** approach focusing on essential patterns
- **Type Safety** throughout the domain layer
- **Clean Separation** between domain logic and infrastructure
- **Comprehensive Validation** with business rule enforcement
- **Rich Documentation** auto-generated from TypeSpec definitions

---

_Last Updated: May 28, 2025_
_All diagrams and documentation reflect the current domain implementation_
