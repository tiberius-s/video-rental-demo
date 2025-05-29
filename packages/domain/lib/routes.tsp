// Video Rental Store Routes - Core Business Workflows
import "@typespec/http";
import "@typespec/openapi";
import "@typespec/rest";
import "./models/common.tsp";
import "./models/customer.tsp";
import "./models/video.tsp";
import "./models/rental.tsp";
import "./models/inventory.tsp";
import "./models/payment.tsp";
import "./models/value-objects/rental-period.tsp";
import "./models/value-objects/money.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{
  title: "Video Rental Store API"
})
@server("http://localhost:3000", "Development server")
@route("/api/v1")
@useAuth(BasicAuth)
@tagMetadata(
  "System",
  #{
    description: "System health and monitoring endpoints"
  }
)
@tagMetadata(
  "Videos",
  #{
    description: "Video catalog management and availability operations"
  }
)
@tagMetadata(
  "Customers",
  #{
    description: "Customer registration, management, and eligibility operations"
  }
)
@tagMetadata(
  "Rentals",
  #{
    description: "Core rental workflow operations from creation to return"
  }
)
@tagMetadata(
  "Payments",
  #{
    description: "Payment processing for rentals and fees"
  }
)
@tagMetadata(
  "Inventory",
  #{
    description: "Video copy tracking and availability management"
  }
)
namespace VideoRental.Domain;

using VideoRental.Domain;
using VideoRental.Domain.ValueObjects;

// Health check
@route("/health")
namespace Health {
  @get
  @tag("System")
  @summary("Health check")
  op check(): {
    @statusCode statusCode: 200;
    @body body: HealthResponse;
  } | BadRequestResponse | {
    @statusCode statusCode: 503;
    @body body: HealthResponse;
  };
}

// API Documentation
@route("/docs")
namespace Documentation {
  @get
  @tag("System")
  @summary("API documentation")
  op getDocs(): {
    @statusCode statusCode: 200;
    @body body: ApiDocumentation;
  } | NotFoundResponse;
}

// Video catalog management
@route("/videos")
namespace Videos {
  @post
  @tag("Videos")
  @summary("Add new video to catalog")
  op create(@body video: Video): {
    @statusCode statusCode: 201;
    @body body: Video;
  } | BadRequestResponse;

  @get
  @tag("Videos")
  @summary("List videos with search")
  op list(
    @query search?: string,
    @query genre?: string,
    @query availableOnly?: boolean = false,
    ...PaginationParams
  ): {
    @statusCode statusCode: 200;
    @body body: PaginatedResponse<Video>;
  } | BadRequestResponse;

  @get
  @tag("Videos")
  @summary("Get video details")
  op read(@path videoId: string): {
    @statusCode statusCode: 200;
    @body body: Video;
  } | NotFoundResponse;

  @patch(#{implicitOptionality: true})
  @tag("Videos")
  @summary("Update video information")
  op update(@path videoId: string, @body video: Video): {
    @statusCode statusCode: 200;
    @body body: Video;
  } | NotFoundResponse;

  @get
  @tag("Videos")
  @route("/{videoId}/availability")
  @summary("Check video availability")
  op checkAvailability(@path videoId: string): {
    @statusCode statusCode: 200;
    @body body: {
      @doc("Whether copies are available")
      available: boolean;
      @doc("Number of available copies")
      availableCopies: int32;
      @doc("Total copies owned")
      totalCopies: int32;
    };
  } | NotFoundResponse;

  @delete
  @tag("Videos")
  @summary("Remove video from catalog")
  @doc("Soft delete - marks video as inactive, prevents new rentals")
  op remove(@path videoId: string): {
    @statusCode statusCode: 204;
  } | NotFoundResponse | ConflictResponse;
}

// Customer management
@route("/customers")
namespace Customers {
  @post
  @tag("Customers")
  @summary("Register new customer")
  op create(@body customer: Customer): {
    @statusCode statusCode: 201;
    @body body: Customer;
  } | BadRequestResponse;

  @get
  @tag("Customers")
  @summary("Get customer details")
  op read(@path customerId: string): {
    @statusCode statusCode: 200;
    @body body: Customer;
  } | NotFoundResponse;

  @patch(#{implicitOptionality: true})
  @tag("Customers")
  @summary("Update customer information")
  op update(@path customerId: string, @body customer: Customer): {
    @statusCode statusCode: 200;
    @body body: Customer;
  } | NotFoundResponse;

  @get
  @tag("Customers")
  @route("/{customerId}/eligibility")
  @summary("Check rental eligibility")
  @doc("Verify customer can rent (no overdue items, account in good standing)")
  op checkEligibility(@path customerId: string): {
    @statusCode statusCode: 200;
    @body body: {
      @doc("Can customer rent new videos")
      eligible: boolean;
      @doc("Reason if not eligible")
      reason?: string;
      @doc("Number of active rentals")
      activeRentals: int32;
      @doc("Number of overdue rentals")
      overdueRentals: int32;
      @doc("Outstanding fees")
      outstandingFees: Money;
    };
  } | NotFoundResponse;

  @get
  @tag("Customers")
  @route("/{customerId}/rentals")
  @summary("Get customer's rental history")
  op getRentals(
    @path customerId: string,
    @query status?: "active" | "returned" | "overdue",
    ...PaginationParams
  ): {
    @statusCode statusCode: 200;
    @body body: PaginatedResponse<Rental>;
  } | NotFoundResponse;

  @get
  @tag("Customers")
  @summary("List customers")
  @doc("List active customers with optional filtering")
  op list(
    @query status?: "Active" | "Suspended" | "Inactive",
    ...PaginationParams
  ): {
    @statusCode statusCode: 200;
    @body body: PaginatedResponse<Customer>;
  } | UnauthorizedResponse;

  @delete
  @tag("Customers")
  @summary("Deactivate customer")
  @doc("Soft delete - marks customer as inactive, prevents new rentals")
  op deactivate(@path customerId: string): {
    @statusCode statusCode: 204;
  } | NotFoundResponse | ConflictResponse;
}

// Rental operations - core business workflow
@route("/rentals")
namespace Rentals {
  @post
  @tag("Rentals")
  @summary("Create new rental")
  @doc("Process video rental with eligibility checks and pricing")
  op create(
    @body request: {
      @doc("Customer renting the video")
      customerId: string;
      @doc("Video to rent")
      videoId: string;
      @doc("Rental duration")
      duration: StandardRentalDuration;
    }
  ): {
    @statusCode statusCode: 201;
    @body body: {
      @doc("Created rental")
      rental: Rental;
      @doc("Payment due")
      payment: Payment;
      @doc("Due date")
      dueDate: string;
    };
  } | BadRequestResponse | ConflictResponse;

  @get
  @tag("Rentals")
  @summary("Get rental details")
  op read(@path rentalId: string): {
    @statusCode statusCode: 200;
    @body body: Rental;
  } | NotFoundResponse;

  @post
  @tag("Rentals")
  @route("/{rentalId}/return")
  @summary("Return rented video")
  @doc("Process return, calculate late fees if applicable")
  op returnVideo(
    @path rentalId: string,
    @body returnInfo: {
      @doc("Return date/time")
      @format("date-time")
      returnDate: string;
      @doc("Condition of returned copy")
      condition?: "Excellent" | "Good" | "Fair" | "Damaged";
      @doc("Return notes")
      notes?: string;
    }
  ): {
    @statusCode statusCode: 200;
    @body body: {
      @doc("Updated rental")
      rental: Rental;
      @doc("Late fees (if any)")
      lateFees?: Money;
      @doc("Additional payment required")
      additionalPayment?: Payment;
      @doc("Return was on time")
      onTime: boolean;
    };
  } | NotFoundResponse | ConflictResponse;

  @get
  @tag("Rentals")
  @route("/overdue")
  @summary("List overdue rentals")
  @doc("Get rentals past due date for follow-up")
  op getOverdue(...PaginationParams): {
    @statusCode statusCode: 200;
    @body body: {
      @doc("Overdue rentals")
      rentals: PaginatedResponse<Rental>;
      @doc("Total late fees outstanding")
      totalLateFees: Money;
    };
  } | UnauthorizedResponse;

  @delete
  @tag("Rentals")
  @route("/{rentalId}")
  @summary("Cancel rental")
  @doc("Cancel active rental and process refund if applicable")
  op cancel(@path rentalId: string): {
    @statusCode statusCode: 204;
  } | NotFoundResponse | ConflictResponse;
}

// Payment processing
@route("/payments")
namespace Payments {
  @post
  @tag("Payments")
  @summary("Process payment")
  @doc("Handle payment for rental, late fees, or other charges")
  op create(@body payment: Payment): {
    @statusCode statusCode: 201;
    @body body: Payment;
  } | BadRequestResponse;

  @get
  @tag("Payments")
  @summary("Get payment details")
  op read(@path paymentId: string): {
    @statusCode statusCode: 200;
    @body body: Payment;
  } | NotFoundResponse;

  @get
  @tag("Payments")
  @route("/customer/{customerId}")
  @summary("Get customer payment history")
  op getByCustomer(
    @path customerId: string,
    ...PaginationParams
  ): {
    @statusCode statusCode: 200;
    @body body: {
      @doc("Customer payments")
      payments: PaginatedResponse<Payment>;
      @doc("Total paid")
      totalPaid: Money;
      @doc("Outstanding balance")
      outstandingBalance: Money;
    };
  } | NotFoundResponse;
}

// Inventory management (essential operations only)
@route("/inventory")
namespace InventoryManagement {
  @post
  @tag("Inventory")
  @summary("Add new video copy")
  @doc("Add physical copy to inventory")
  op create(@body inventory: Inventory): {
    @statusCode statusCode: 201;
    @body body: Inventory;
  } | BadRequestResponse;

  @get
  @tag("Inventory")
  @route("/video/{videoId}")
  @summary("Get video inventory")
  @doc("Get all copies for a specific video")
  op getByVideo(@path videoId: string): {
    @statusCode statusCode: 200;
    @body body: {
      @doc("Video information")
      video: Video;
      @doc("Physical copies")
      copies: Inventory[];
      @doc("Available count")
      availableCount: int32;
      @doc("Total count")
      totalCount: int32;
    };
  } | NotFoundResponse;

  @patch(#{implicitOptionality: true})
  @tag("Inventory")
  @route("/{inventoryId}")
  @summary("Update inventory item")
  @doc("Update copy status or condition")
  op update(@path inventoryId: string, @body inventory: Inventory): {
    @statusCode statusCode: 200;
    @body body: Inventory;
  } | NotFoundResponse;

  @delete
  @tag("Inventory")
  @route("/{inventoryId}")
  @summary("Remove inventory copy")
  @doc("Permanently remove copy from inventory (for damaged/lost items)")
  op remove(@path inventoryId: string): {
    @statusCode statusCode: 204;
  } | NotFoundResponse | ConflictResponse;
}
