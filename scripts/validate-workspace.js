#!/usr/bin/env node

import { readFileSync } from "fs";

console.log("🔍 Validating workspace configuration...\n");

const rootPkg = JSON.parse(readFileSync("package.json", "utf8"));

let hasErrors = false;

// Check that all workspace packages exist
console.log("📦 Checking workspace packages...");
const packages = [
  "packages/domain/package.json",
  "packages/api/package.json",
  "packages/db/package.json",
];

for (const pkgPath of packages) {
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    console.log(`  ✅ ${pkg.name} (${pkg.version})`);

    // Check for consistent version
    if (pkg.version !== rootPkg.version) {
      console.log(`    ⚠️  Version mismatch: ${pkg.version} !== ${rootPkg.version}`);
    }

    // Check for workspace dependencies
    if (pkg.dependencies) {
      for (const [depName, depVersion] of Object.entries(pkg.dependencies)) {
        if (depName.startsWith("@video-rental/")) {
          if (!depVersion.startsWith("workspace:")) {
            console.log(`    ⚠️  Should use workspace: protocol for ${depName}`);
          } else {
            console.log(`    ✅ Using workspace protocol for ${depName}`);
          }
        }
      }
    }
  } catch (error) {
    console.log(`  ❌ Failed to read ${pkgPath}: ${error.message}`);
    hasErrors = true;
  }
}

// Check for common scripts across packages
console.log("\n🔧 Checking script consistency...");
const commonScripts = ["build", "clean", "test", "lint", "format", "typecheck"];

for (const pkgPath of packages) {
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const missingScripts = commonScripts.filter((script) => !pkg.scripts?.[script]);

    if (missingScripts.length > 0) {
      console.log(`  ⚠️  ${pkg.name} missing scripts: ${missingScripts.join(", ")}`);
    } else {
      console.log(`  ✅ ${pkg.name} has all common scripts`);
    }
  } catch (error) {
    console.log(`  ❌ Failed to check scripts for ${pkgPath}: ${error.message}`);
    hasErrors = true;
  }
}

console.log(hasErrors ? "\n❌ Validation failed" : "\n✅ Workspace validation passed");
process.exit(hasErrors ? 1 : 0);
