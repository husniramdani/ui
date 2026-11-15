# Stylebase fork

This fork of [vercel-labs/ui](https://github.com/vercel-labs/ui) is what Stylebase builds on while fixes wait to land upstream.

## Branches

- `main` mirrors upstream `main` and holds nothing of ours.
- `stylebase` is `main` plus our fixes. It's rebased onto `main` whenever upstream moves, and it's what gets published.
- Each fix has its own branch from `main`, so it can go upstream unchanged.

## A fix, start to finish

1. Open an issue on this fork: the problem, how to reproduce it, before and after (screenshots or test output), the cause and the fix.
2. Fix it on a branch from `main`, with a test that fails without the fix. Open a pull request into `stylebase` that closes the issue.
3. Once it has held up in Stylebase, open an issue upstream (unless one exists), then the upstream pull request from the same branch.
4. When upstream releases it, drop it from `stylebase` on the next rebase.

Behaviour upstream means to have isn't patched here; it's raised with them or handled in Stylebase.

## Publishing

The packages Stylebase uses go to npm as `@husniramdani/ui-sdk-core`, `-svelte`, `-vue` and `-react`. The version is upstream's with a `stylebase.N` suffix, like `0.1.0-beta.5.stylebase.1`, so it sorts after the upstream release it's based on and before the next one.

```sh
node scripts/stylebase/pack.mjs 0.1.0-beta.5.stylebase.1
npm publish .stylebase/husniramdani-ui-sdk-core-0.1.0-beta.5.stylebase.1.tgz --access public --tag stylebase
# then svelte, vue and react, which name core as a peer
```

Stylebase installs them by alias, so its code keeps importing `@ui-sdk/*`:

```sh
pnpm add @ui-sdk/core@npm:@husniramdani/ui-sdk-core@0.1.0-beta.5.stylebase.1 \
  @ui-sdk/svelte@npm:@husniramdani/ui-sdk-svelte@0.1.0-beta.5.stylebase.1
```

Going back to upstream is a version change in the same place.
