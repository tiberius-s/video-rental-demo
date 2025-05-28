import { resolvePath } from "@typespec/compiler";
import type { TypeSpecTestLibrary } from "@typespec/compiler/testing";
import { createTestLibrary } from "@typespec/compiler/testing";
import { fileURLToPath } from "url";

export const VideoRentalDemoDomainTestLibrary: TypeSpecTestLibrary = createTestLibrary({
  name: "@video-rental-demo/domain",
  packageRoot: resolvePath(fileURLToPath(import.meta.url), "../../../../"),
});
