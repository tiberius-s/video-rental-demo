namespace VideoRental.Domain;

@doc("A video that can be rented")
model Video {
  @key("videoId")
  @format("uuid")
  @visibility(Lifecycle.Read, Lifecycle.Update)
  @doc("The ID of the video")
  id: string;

  @doc("The title of the video")
  title: string;

  @doc("The genre of the video")
  genre: string;

  @doc("The MPAA rating of the video (G, PG, PG-13, R, NC-17)")
  rating: string;

  @doc("The year the video was released")
  releaseYear: int32;

  @doc("Duration of the video in minutes")
  duration: int32;

  @doc("Brief description of the video")
  description: string;

  @doc("Director of the video")
  director: string;

  @doc("Daily rental price")
  rentalPrice: decimal;

  @doc("Number of copies available for rental")
  availableCopies: int32;

  @doc("Total number of copies owned")
  totalCopies: int32;
}

@doc("Availability summary for a video")
model VideoAvailability {
  @doc("Whether copies are available")
  available: boolean;

  @doc("Number of available copies")
  availableCopies: int32;

  @doc("Total copies owned")
  totalCopies: int32;
}
