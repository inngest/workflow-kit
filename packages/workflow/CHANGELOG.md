# @inngest/workflow-kit

## 0.2.0

### Minor Changes

- f12d53f: Execute Provider.onChange callback when action input values change
- 36d19d5: Switch to a maintained version of jsonpath
- 8b34595: Show edge names in editor

### Patch Changes

- 26ad93b: Minor improvements to conditional support
- 1099e8b: Fix to ensure nodes in a workflow are only run once
- b71b675: Address security vulnerabilities in transitive dependencies. No runtime API changes; updates dev/build dependency versions and adds pnpm overrides for transitive packages with known advisories (vite, esbuild, cookie, path-to-regexp, qs, cross-spawn, tmp, minimatch, brace-expansion, picomatch, postcss, ws, @babel/runtime, @babel/helpers, next, uuid). Bumps `inngest` devDep to ^3.54.2 (fixes GHSA env-var disclosure), `@storybook/*` addons to ^8.6.18, `typescript` to ^5.9.3, and `@changesets/cli` to ^2.31.0.

## 0.1.3

### Patch Changes

- a40a1b6: feat(core): typing fixes
- 04c146f: fix: do not update state in render
