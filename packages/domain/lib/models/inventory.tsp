namespace VideoRental.Domain;

@doc("Inventory tracking for video copies")
model Inventory {
  @key("inventoryId")
  @format("uuid")
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
  @doc("Copy is in excellent condition")
  Excellent,

  @doc("Copy is in good condition")
  Good,

  @doc("Copy is in fair condition")
  Fair,

  @doc("Copy is damaged but playable")
  Damaged,

  @doc("Copy is not playable")
  Defective,
}

@doc("Status of a video copy")
enum CopyStatus {
  @doc("Available for rental")
  Available,

  @doc("Currently rented out")
  Rented,

  @doc("Under maintenance or repair")
  Maintenance,

  @doc("Removed from circulation")
  Retired,
}
