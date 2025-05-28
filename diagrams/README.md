# Video Rental Store - Diagrams & Documentation

This folder contains comprehensive documentation and visual diagrams for the Video Rental Store domain implementation.

## 📋 Documentation Files

### [`DDD-IMPLEMENTATION.md`](./DDD-IMPLEMENTATION.md)

Detailed Domain-Driven Design implementation documentation covering:

- **Domain Structure**: Value objects, domain models, and services
- **Business Rules**: Customer management, rental logic, inventory tracking
- **API Overview**: 25 endpoints across 7 functional areas
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
- 25 API endpoints organized by functional area

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

- **Total Endpoints**: 25 across 7 functional areas
- **Domain Models**: 8 core entities + shared PersonBase pattern
- **Value Objects**: 6 immutable business concepts
- **Domain Services**: 3 business logic services
- **Business Rules**: Comprehensive coverage of rental operations

## 🎯 Functional Areas

1. **System** (2 endpoints) - Health monitoring and documentation
2. **Videos** (5 endpoints) - Catalog management and availability
3. **Customers** (5 endpoints) - Registration and eligibility management
4. **Rentals** (4 endpoints) - Core rental workflow operations
5. **Payments** (3 endpoints) - Financial transaction processing
6. **Employees** (4 endpoints) - Staff management and roles
7. **Inventory** (2 endpoints) - Physical copy tracking

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
