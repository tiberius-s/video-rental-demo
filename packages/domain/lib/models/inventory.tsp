namespace VideoRental.Domain;

@doc("Inventory tracking for video copies")
model Inventory {
  @key("inventoryId")
  @format("uuid")
  @visibility(Lifecycle.Read, Lifecycle.Update)
  @doc("The unique ID of the inventory item")
  id: string;

  @doc("The ID of the video this inventory tracks")
  videoId: string;

  @doc("Physical copy identifier (barcode, serial number)")
  copyId: string;

  @doc("Current condition of the copy")
  condition: CopyCondition;

  @doc("Current status of this copy")
  status: CopyStatus;

  @format("date-time")
  @doc("Date this copy was acquired")
  dateAcquired: string;

  @format("date-time")
  @doc("Date this copy was last rented")
  lastRentedDate?: string;
}

@doc("Physical condition of a video copy")
enum CopyCondition {
  @doc("Copy is in good condition")
  Good,

  @doc("Copy is not playable")
  Defective,
}

@doc("Status of a video copy")
enum CopyStatus {
  @doc("Available for rental")
  Available,

  @doc("Currently rented out")
  Rented,

  @doc("Removed from circulation")
  Retired,
}

@doc("Response for video inventory lookup")
model VideoInventoryResponse {
  @doc("Video information")
  video: Video;

  @doc("Physical copies")
  copies: Inventory[];

  @doc("Available count")
  availableCount: int32;

  @doc("Total count")
  totalCount: int32;
}
