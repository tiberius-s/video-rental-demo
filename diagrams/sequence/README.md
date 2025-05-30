# Sequence Diagrams

This folder contains sequence diagrams that demonstrate the key workflows in the video rental system. These diagrams show the interactions between different components and actors in the system.

## Available Diagrams

### Core Business Workflows

1. **[Customer Registration](01-customer-registration.md)**

   - Simplified customer onboarding process
   - Validation and account creation
   - Status management

2. **[Rental Creation](02-rental-creation.md)**

   - Video selection and availability checking
   - Customer discount application
   - Rental fee calculation and confirmation

3. **[Return Processing](03-return-processing.md)**

   - Video return and condition assessment
   - Late fee calculation
   - Inventory status updates

4. **[Payment Processing](04-payment-processing.md)**
   - Multiple payment types and methods
   - Electronic payment gateway integration
   - Fee aggregation and customer discounts

### Automated Workflows

1. **[Overdue Management](05-overdue-management.md)**

   - Daily automated overdue checking
   - Late fee calculation
   - Customer notification system

2. **[Inventory Management](06-inventory-management.md)**
   - Copy lifecycle management
   - Damage handling and retirement
   - Reporting and analytics

## Diagram Features

### Visual Elements

- **Participants**: Key actors and systems involved
- **Messages**: Interactions between components
- **Alternative Flows**: Error handling and edge cases
- **Business Rules**: Key constraints and logic
- **State Transitions**: Status lifecycle management

### Business Logic Highlights

- **Customer Discounts**: Automatic application based on `discountPercentage`
- **Simplified Enums**: Good/Defective conditions, streamlined payment types
- **Error Handling**: Graceful degradation and rollback scenarios
- **Automation**: Daily batch processing for overdue management

## Reading the Diagrams

Each sequence diagram follows this pattern:

1. **Context Setup**: Initial state and participants
2. **Main Flow**: Primary success scenario
3. **Alternative Flows**: Error cases and variations
4. **Business Rules**: Key constraints and calculations
5. **State Changes**: How entities transition states

## Implementation Notes

These diagrams reflect the current simplified domain model:

- **No Employee Entities**: All operations are customer or system-driven
- **Simplified Conditions**: Binary Good/Defective assessment
- **Automatic Discounts**: Customer discount percentage applied automatically
- **Streamlined Payments**: Four payment types (Rental, LateFee, Damage, Membership)
- **Clear Status Flows**: Well-defined state transitions for all entities

## Related Documentation

- **[ERD Diagram](../ERD.md)**: Entity relationships and data model
- **[Workflow Diagrams](../workflows/)**: Detailed business process flows
- **[API Operations](../API-OPERATIONS-SUMMARY.md)**: Technical API specifications
- **[Domain Analysis](../../DOMAIN_ANALYSIS.md)**: Comprehensive domain overview
