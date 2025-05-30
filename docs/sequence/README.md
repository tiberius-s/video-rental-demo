# Sequence Diagrams

This section provides sequence diagrams illustrating key workflows within the video rental system. These diagrams depict the interactions between various components and actors (users or other systems) involved in specific processes.

## Available Diagrams

### Core Business Workflows

1. **[Customer Registration](./01-customer-registration.md)**

   - Illustrates the simplified customer onboarding process.
   - Details validation steps and account creation.
   - Shows how customer status is managed.

2. **[Rental Creation](./02-rental-creation.md)**

   - Covers video selection and real-time availability checking.
   - Demonstrates the application of customer-specific discounts.
   - Explains rental fee calculation and the confirmation process.

3. **[Return Processing](./03-return-processing.md)**

   - Details the process of video return and subsequent condition assessment.
   - Includes logic for late fee calculation, if applicable.
   - Shows how inventory status is updated post-return.

4. **[Payment Processing](./04-payment-processing.md)**
   - Covers handling of multiple payment types (e.g., rental fees, late fees) and methods.
   - Conceptually includes integration with an electronic payment gateway.
   - Illustrates fee aggregation and the application of customer discounts during payment.

### Automated System Workflows

1. **[Overdue Management](./05-overdue-management.md)**

   - Describes the daily automated process for checking overdue rentals.
   - Details how late fees are calculated for identified overdue items.
   - Shows the customer notification system for overdue rentals.

2. **[Inventory Management](./06-inventory-management.md)**
   - Illustrates the lifecycle management of individual video copies.
   - Covers processes for handling damaged items and retiring copies from circulation.
   - Mentions aspects of reporting and analytics related to inventory.

## Diagram Features

### Visual Elements Used

- **Participants**: Represents the key actors (e.g., Customer, API) and system components involved in a sequence.
- **Messages**: Shows the interactions and communication flow between participants.
- **Alternative Flows**: Depicts error handling scenarios, edge cases, and deviations from the primary success path.
- **Business Rules**: Highlights key constraints, logic, and calculations embedded in the process.
- **State Transitions**: Illustrates how the status of entities (e.g., Rental, Inventory) changes throughout the workflow.

### Business Logic Highlights Emphasized

- **Customer Discounts**: Automatic application of discounts based on the `Customer.discountPercentage` attribute.
- **Simplified Enums**: Use of streamlined enumerated types, such as `CopyCondition` (`Good`/`Defective`) and simplified payment types.
- **Error Handling**: Conceptual representation of graceful degradation and rollback scenarios in case of failures.
- **Automation**: Depiction of daily batch processing for tasks like overdue management.

## How to Read These Diagrams

Each sequence diagram generally follows this structure:

1. **Context Setup**: Defines the initial state and identifies the participants involved in the scenario.
2. **Main Flow**: Illustrates the primary success scenario, showing the typical sequence of interactions.
3. **Alternative Flows**: Details variations from the main flow, including error conditions and alternative paths.
4. **Business Rules Application**: Shows where and how key business rules, constraints, and calculations are applied.
5. **State Changes**: Indicates how the states of relevant entities transition as a result of the interactions.

## Implementation Notes (Reflecting Simplified Domain Model)

These diagrams are based on the current, simplified domain model of the video rental system:

- **No Employee Entities**: All operations are depicted as either customer-initiated or system-driven; internal employee roles are not modeled.
- **Simplified Conditions**: Video copy conditions are simplified to a binary assessment (e.g., `Good` or `Defective`).
- **Automatic Discount Application**: Customer-specific discount percentages are applied automatically where relevant.
- **Streamlined Payment Types**: The system supports a focused set of four payment types: `Rental`, `LateFee`, `Damage`, and `Membership`.
- **Clear Status Flows**: Entity statuses (e.g., `RentalStatus`, `PaymentStatus`) have well-defined and clear transition paths.

## Related Documentation

For a comprehensive understanding of the system, refer to the following related documents:

- **[Entity Relationship Diagram (ERD)](../ERD.md)**: Provides a detailed view of the data model and entity relationships.
- **[Workflow Diagrams](../workflows/)**: Offers high-level diagrams illustrating broader business process flows.
- **[API Operations Summary](../API-OPERATIONS-SUMMARY.md)**: Contains technical specifications and summaries of the available API endpoints.
- **[Domain Analysis](../../DOMAIN_ANALYSIS.md)**: _(Note: This file does not currently exist in the provided workspace structure. Link may be invalid or refer to a future document.)_ Provides a comprehensive overview of the business domain.
