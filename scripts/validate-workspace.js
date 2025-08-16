#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import path from "path";

console.log("🔍 Validating workspace configuration...\n");

const rootJsonPath = path.resolve("package.json");
if (!existsSync(rootJsonPath)) {
  console.error(`❌ Root package.json not found at ${rootJsonPath}`);
  process.exit(1);
}

const rootPkg = JSON.parse(readFileSync(rootJsonPath, "utf8"));

let hasErrors = false;

const packages = [
  "packages/domain/package.json",
  "packages/api/package.json",
  "packages/db/package.json",
];

function readJson(filePath) {
  const absolute = path.resolve(filePath);
  if (!existsSync(absolute)) {
    return { error: `not found: ${absolute}` };
  }

  try {
    return { value: JSON.parse(readFileSync(absolute, "utf8")) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

console.log("📦 Checking workspace packages...");

for (const pkgPath of packages) {
  const { value: pkg, error } = readJson(pkgPath);

  if (error) {
    console.log(`  ❌ Failed to read ${pkgPath}: ${error}`);
    hasErrors = true;
    continue;
  }

  console.log(`  ✅ ${pkg.name} (${pkg.version ?? "<no-version>"})`);

  if (pkg.version && pkg.version !== rootPkg.version) {
    console.log(`    ⚠️  Version mismatch: ${pkg.version} !== ${rootPkg.version}`);
  }

  const deps = pkg.dependencies ?? {};
  for (const [depName, depVersion] of Object.entries(deps)) {
    if (!depName.startsWith("@video-rental/")) continue;

    if (typeof depVersion !== "string") {
      console.log(`    ⚠️  Unexpected version format for ${depName}: ${String(depVersion)}`);
      continue;
    }

    if (depVersion.startsWith("workspace:")) {
      console.log(`    ✅ Using workspace protocol for ${depName}`);
    } else if (depVersion.startsWith("file:")) {
      console.log(`    ✅ Using file protocol for ${depName} (workspace alternative)`);
    } else {
      console.log(
        `    ⚠️  Should use workspace: or file: protocol for ${depName} (found ${depVersion})`,
      );
    }
  }
}

console.log("\n🔧 Checking script consistency...");
const commonScripts = ["build", "clean", "test", "lint", "format", "typecheck"];

for (const pkgPath of packages) {
  const { value: pkg, error } = readJson(pkgPath);
  if (error) {
    console.log(`  ❌ Failed to check scripts for ${pkgPath}: ${error}`);
    hasErrors = true;
    continue;
  }

  const missing = commonScripts.filter((s) => !pkg.scripts || !pkg.scripts[s]);
  if (missing.length > 0) {
    console.log(`  ⚠️  ${pkg.name} missing scripts: ${missing.join(", ")}`);
  } else {
    console.log(`  ✅ ${pkg.name} has all required scripts`);
  }
}

console.log(hasErrors ? "\n❌ Validation failed" : "\n✅ Workspace validation passed");
process.exit(hasErrors ? 1 : 0);
