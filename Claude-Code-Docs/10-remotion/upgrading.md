# Upgrading Remotion

> Source: https://www.remotion.dev/docs/upgrading

## Automatic Upgrade (Recommended)

Run in the root of your project:

```bash
npx remotion upgrade
# or
pnpm exec remotion upgrade
# or
yarn remotion upgrade
# or
bunx remotion upgrade
```

> Requires `@remotion/cli` to be installed.

## Manual Upgrade

1. Edit the version number of all `@remotion/*` packages and `remotion` in your `package.json`.
   - Current stable version: `4.0.438`
2. Delete the `^` in front of the version number to force the exact version.
3. Run your package manager's install command:

```bash
npm i
# or pnpm i / yarn / bun i
```

## Breaking Changes

Remotion follows **semantic versioning**:
- Same major version = backwards compatible (e.g., 4.0.0 → 4.1.100)
- New major version = migration required (e.g., upgrading to 5.0 requires following the migration guide)
- Experimental APIs are exempt from the breaking change rule

## Changelog

Visit https://remotion.dev/changelog to see all changes.

## Stable Versions

A repo with the latest stable version of Remotion is available for customers needing higher stability.
Access via the [remotion.pro](https://remotion.pro) portal.

## Related

- [CLI Reference](./cli-reference.md)
- [Getting Started](./getting-started.md)
