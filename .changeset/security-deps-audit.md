---
"@inngest/workflow-kit": patch
---

Address security vulnerabilities in transitive dependencies. No runtime API changes; updates dev/build dependency versions and adds pnpm overrides for transitive packages with known advisories (vite, esbuild, cookie, path-to-regexp, qs, cross-spawn, tmp, minimatch, brace-expansion, picomatch, postcss, ws, @babel/runtime, @babel/helpers, next, uuid). Bumps `inngest` devDep to ^3.54.2 (fixes GHSA env-var disclosure), `@storybook/*` addons to ^8.6.18, `typescript` to ^5.9.3, and `@changesets/cli` to ^2.31.0.
