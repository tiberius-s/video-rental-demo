import { createTestHost, createTestWrapper } from "@typespec/compiler/testing";
import { VideoRentalDemoDomainTestLibrary } from "../src/testing/index.js";

export async function createVideoRentalDemoDomainTestHost() {
  return createTestHost({
    libraries: [VideoRentalDemoDomainTestLibrary],
  });
}

export async function createVideoRentalDemoDomainTestRunner() {
  const host = await createVideoRentalDemoDomainTestHost();

  return createTestWrapper(host, {
    autoUsings: ["VideoRentalDemoDomain"],
  });
}
