// Common models and types used across the API
import "@typespec/http";

using TypeSpec.Http;

namespace VideoRental.Domain;

@doc("API health status response")
model HealthResponse {
  @doc("Service status")
  status: "healthy" | "degraded" | "unhealthy";

  @doc("Service name")
  service: string;

  @doc("Service version")
  version: string;

  @doc("Current timestamp")
  @format("date-time")
  timestamp: string;

  @doc("Additional health details")
  details?: Record<unknown>;
}

@doc("Pagination parameters")
model PaginationParams {
  @doc("Page number (1-based)")
  @query
  page?: int32 = 1;

  @doc("Number of items per page (max 100)")
  @query
  @minValue(1)
  @maxValue(100)
  limit?: int32 = 20;

  @doc("Sort field")
  @query
  sortBy?: string;

  @doc("Sort direction")
  @query
  sortOrder?: "asc" | "desc" = "asc";
}

@doc("Paginated response wrapper")
model PaginatedResponse<T> {
  @doc("Array of items")
  data: T[];

  @doc("Pagination metadata")
  pagination: {
    @doc("Current page number")
    page: int32;

    @doc("Items per page")
    limit: int32;

    @doc("Total number of items")
    total: int32;

    @doc("Total number of pages")
    pages: int32;

    @doc("Whether there is a next page")
    hasNext: boolean;

    @doc("Whether there is a previous page")
    hasPrev: boolean;
  };
}

@doc("API documentation metadata")
model ApiDocumentation {
  @doc("API title")
  title: string;

  @doc("API version")
  version: string;

  @doc("API description")
  description: string;

  @doc("Base URL")
  baseUrl: string;

  @doc("Documentation links")
  links: {
    @doc("OpenAPI specification URL")
    openapi?: string;

    @doc("Business documentation URL")
    documentation?: string;

    @doc("Health check URL")
    health?: string;
  };
}
