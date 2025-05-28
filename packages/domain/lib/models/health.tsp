namespace VideoRental.Domain;

@doc("Status of the service")
model Health {
  @doc("The status of the service")
  status: string;

  @doc("The name of the service")
  name: string;

  @doc("The version of the service")
  version: string;
}
