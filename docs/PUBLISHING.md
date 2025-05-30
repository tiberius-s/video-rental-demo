# Publishing Multiple Packages from a Monorepo

This document outlines strategies and workflows for publishing multiple packages from this npm workspace monorepo to the npm registry.

## Package Publishing Strategy

### Current Package Structure

```
@video-rental/domain   - TypeSpec definitions and generated TypeScript types
@video-rental/api      - Express API implementation
@video-rental/db       - Database client utilities
```

### Package Visibility Considerations

**Option 1: All Public Packages**

- Publish all packages as public npm packages
- Allows external consumers to use individual pieces
- Good for open source or reusable components

**Option 2: Mixed Visibility**

- `@video-rental/domain` - Public (shared types/contracts)
- `@video-rental/api` - Private (application code)
- `@video-rental/db` - Public (reusable database utilities)

**Option 3: All Private Packages**

- Use for internal company packages
- Requires npm organization or private registry

## Publishing Workflows

### 1. Manual Publishing Workflow

#### Prerequisites Setup

```bash
# Login to npm (one-time setup)
npm login

# Set up npm organization (if needed)
npm org:set @video-rental

# Configure package access (for scoped packages)
npm access public @video-rental/domain
npm access public @video-rental/db
```

#### Step-by-Step Manual Process

```bash
# 1. Ensure workspace is clean and tested
npm run workspace:validate
npm test
npm run typecheck
npm run lint

# 2. Version all packages consistently
npm version patch --workspaces

# 3. Build all packages
npm run build

# 4. Publish packages in dependency order
cd packages/domain && npm publish
cd ../db && npm publish
cd ../api && npm publish

# 5. Tag the release
git add .
git commit -m "chore: release v$(node -p "require('./package.json').version")"
git tag "v$(node -p "require('./package.json').version")"
git push origin main --tags
```

### 2. Automated Publishing with Scripts

Add these scripts to your root `package.json`:

```json
{
  "scripts": {
    "release:patch": "npm run release:prepare && npm version patch --workspaces && npm run release:publish",
    "release:minor": "npm run release:prepare && npm version minor --workspaces && npm run release:publish",
    "release:major": "npm run release:prepare && npm version major --workspaces && npm run release:publish",
    "release:prepare": "npm run workspace:validate && npm test && npm run build",
    "release:publish": "npm run publish:domain && npm run publish:db && npm run publish:api",
    "publish:domain": "cd packages/domain && npm publish",
    "publish:db": "cd packages/db && npm publish",
    "publish:api": "cd packages/api && npm publish",
    "release:tag": "git add . && git commit -m \"chore: release v$(node -p \"require('./package.json').version\")\" && git tag \"v$(node -p \"require('./package.json').version\")\" && git push origin main --tags"
  }
}
```

Usage:

```bash
npm run release:patch
npm run release:tag
```

### 3. Advanced: Automated Publishing with Changesets

[Changesets](https://github.com/changesets/changesets) is the gold standard for monorepo publishing.

#### Installation

```bash
npm install --save-dev @changesets/cli @changesets/changelog-github
npx changeset init
```

#### Configuration (.changeset/config.json)

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "your-username/video-rental-demo" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

#### Changesets Workflow

```bash
# 1. During development, create changesets for changes
npx changeset add

# 2. Version packages based on changesets
npx changeset version

# 3. Publish all changed packages
npx changeset publish

# 4. Create GitHub release (if using GitHub Actions)
git push --follow-tags
```

#### GitHub Actions for Changesets

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 22
          registry-url: "https://registry.npmjs.org"

      - name: Install Dependencies
        run: npm ci

      - name: Validate Workspace
        run: npm run workspace:validate

      - name: Run Tests
        run: npm test

      - name: Build Packages
        run: npm run build

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: npx changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 4. Independent vs Fixed Versioning

#### Fixed Versioning (Current Setup)

- All packages share the same version number
- Simpler to manage and reason about
- Good for tightly coupled packages

#### Independent Versioning

```json
// .changeset/config.json
{
  "fixed": [],
  "linked": []
  // packages can have different versions
}
```

Benefits:

- Packages can evolve at different rates
- Smaller version bumps for unchanged packages
- More complex to manage dependencies

## Package.json Preparation for Publishing

### Update Package Metadata

Each package should have proper metadata:

```json
{
  "name": "@video-rental/domain",
  "version": "1.0.0",
  "description": "Domain models and TypeSpec definitions for video rental system",
  "keywords": ["video-rental", "typespec", "domain-models"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "homepage": "https://github.com/your-username/video-rental-demo#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/video-rental-demo.git",
    "directory": "packages/domain"
  },
  "bugs": {
    "url": "https://github.com/your-username/video-rental-demo/issues"
  },
  "publishConfig": {
    "access": "public"
  },
  "files": ["dist", "tsp-output", "lib"]
}
```

### Files to Include/Exclude

#### .npmignore (per package)

```
# Development files
src/
*.test.ts
*.spec.ts
tsconfig.json
tsconfig.tsbuildinfo

# TypeSpec source (include only compiled output)
lib/
tspconfig.yaml

# Documentation
*.md
docs/
```

#### files field in package.json

```json
{
  "files": ["dist/**/*", "tsp-output/@typespec/openapi3/openapi.json"]
}
```

## Publishing Checklist

### Pre-Publishing Validation

- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Workspace validation passes (`npm run workspace:validate`)
- [ ] All packages build successfully (`npm run build`)
- [ ] README files are up to date
- [ ] CHANGELOG is updated (if not using changesets)
- [ ] Git working directory is clean

### Package-Specific Checks

#### Domain Package

- [ ] TypeSpec compiles successfully
- [ ] OpenAPI specification is generated
- [ ] TypeScript types are exported correctly

#### API Package

- [ ] Application starts without errors
- [ ] All routes are functional
- [ ] Environment variables are documented

#### DB Package

- [ ] All database tests pass
- [ ] Database client exports are correct

### Post-Publishing

- [ ] Verify packages are published to npm registry
- [ ] Test installation in a fresh project
- [ ] Update documentation with new version numbers
- [ ] Create GitHub release with changelog
- [ ] Notify team/users of the release

## Common Issues and Solutions

### Workspace Protocol Resolution

**Issue**: `workspace:*` dependencies cause publish failures

**Solution**: Configure `.npmrc` or use npm publish flags:

```bash
# Option 1: Configure .npmrc
echo "save-workspace-protocol=false" >> .npmrc

# Option 2: Use npm version with workspace protocol handling
npm version patch --workspaces --workspace-save-exact=false
```

### Circular Dependencies

**Issue**: Packages depend on each other creating publish order issues

**Solution**:

1. Publish in dependency order (domain → db → api)
2. Use `npm publish --dry-run` to test without actually publishing
3. Consider using `lerna` or `rush` for complex dependency graphs

### Private Package Dependencies

**Issue**: Public packages depending on private packages

**Solution**:

1. Make all dependent packages private
2. Extract shared code into public packages
3. Use bundling to include private dependencies

## Alternative Tools

### Lerna

- Mature monorepo tool with publishing capabilities
- More opinionated but handles complex scenarios
- Good for large monorepos with many packages

### Rush

- Microsoft's monorepo tool
- Excellent for large-scale projects
- Advanced caching and build orchestration

### nx

- Powerful build system and monorepo tool
- Great for complex dependency graphs
- Advanced caching and distributed builds

## Recommended Workflow

For this project, I recommend:

1. **Start with manual publishing** to understand the process
2. **Add automated scripts** for consistency
3. **Migrate to changesets** for production-ready workflow
4. **Use GitHub Actions** for fully automated releases

This approach provides a smooth learning curve while building toward a robust, automated publishing pipeline.
