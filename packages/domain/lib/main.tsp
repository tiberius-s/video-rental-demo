import "@typespec/http";
import "@typespec/openapi";
import "@typespec/rest";
import "./routes.tsp";

// Import essential models and value objects
import "./models/common.tsp";
import "./models/customer.tsp";
import "./models/video.tsp";
import "./models/rental.tsp";
import "./models/inventory.tsp";
import "./models/payment.tsp";
import "./models/value-objects/address.tsp";
import "./models/value-objects/email.tsp";
import "./models/value-objects/phone-number.tsp";
import "./models/value-objects/money.tsp";
import "./models/value-objects/rental-period.tsp";

// Note: Domain services are internal business logic and not exposed as REST endpoints
// They are available for implementation reference but not compiled into the API

using TypeSpec.OpenAPI;

@info(#{
  title: "Video Rental Store API",
  version: "1.0.0",
  license: #{
    name: "MIT",
    url: "https://opensource.org/licenses/MIT"
  }
})
@doc("""
A streamlined RESTful API focused on core video rental store operations.

## Core Features

- **Customer Management**: Essential customer operations with discount support
- **Video Catalog**: Basic video catalog with availability tracking
- **Rental Operations**: Complete rental lifecycle from creation to return
- **Inventory Management**: Copy tracking and availability management
- **Payment Processing**: Payment handling with late fee support

## Business Rules

- **Customer Discounts**: Customers can receive discounts on rentals
- **Rental Eligibility**: Customers must have no overdue rentals to rent new videos
- **Late Fees**: Calculated automatically when videos are returned after due date
- **Inventory Tracking**: Simple copy availability and condition tracking

## API Design Principles

- Focus on essential business workflows
- Minimize complex reporting and analytics
- Streamlined customer management
- Clear separation of core vs. administrative operations

This API provides all essential rental store functionality while maintaining simplicity.
""")
namespace VideoRental.Domain;
