# Publishing Benom

How to publish Benom to the VS Code Marketplace and Open VSX. The release flow
is one tag push; everything below that needs a human is a one-time setup step
or a repository secret.

## One-time setup

### 1. Create a Marketplace publisher

1. Sign in at the [VS Code Marketplace publisher portal] with a Microsoft or
   GitHub account.
2. Create a publisher (an organization or personal publisher id).
3. Set the publisher id in `package.json` (`"publisher"`). It must equal the
   Marketplace publisher id, or `vsce publish` fails with a publisher mismatch.

### 2. Create the Azure DevOps PAT

`vsce publish` authenticates with a Personal Access Token from Azure DevOps. If you have no Azure DevOps
organization yet, create a free one first at https://dev.azure.com (the token page does not exist without one):

1. Open your Azure DevOps user settings → **Personal access tokens**.
2. Create a token with scope **Marketplace → Manage** for **all accessible
   organizations**.
3. Copy the token; it is shown once.

### 3. Create the Open VSX account and token

1. Sign up at [open-vsx.org] and register a namespace (for example `fa137`).
2. In your account settings, create an access token for that namespace.
3. Copy the token; it is shown once.

### 4. Add repository secrets

In the repository settings → **Secrets and variables → Actions**, add:

- `VSCE_PAT` — the Azure DevOps PAT from step 2.
- `OVSX_PAT` — the Open VSX token from step 3.

The release workflow publishes to the Marketplace when `VSCE_PAT` exists and to
Open VSX when `OVSX_PAT` exists; a missing secret skips that target with a
message instead of failing the release.

## Publishing a release

1. **Bump the version** in `package.json` (and this file's changelog entry),
   following Keep a Changelog and Semantic Versioning.
2. Commit the version bump and the regenerated themes if any.
3. **Tag the release**: `git tag v<version>` (for example `git tag v0.1.0`).
4. **Push the tag**: `git push origin v<version>`.

The release workflow runs the build, tests, and packaging, uploads the `.vsix`
as an artifact, creates a GitHub Release with the `.vsix`, then publishes to
the Marketplace and Open VSX using the secrets above.

To publish by hand instead of by tag:

```sh
npm run package          # build + vsce package -> benom-<version>.vsix
npm run publish:vsce     # vsce publish
npm run publish:ovsx     # ovsx publish
```

## Pre-publish checklist

- [ ] `npm ci` succeeds from the committed `package-lock.json`.
- [ ] `npm test` passes (all gates, including the packaging gate).
- [ ] `npm run check` passes with no drift (committed themes are current).
- [ ] `npm run package` produces `benom-<version>.vsix` in the repo root.
- [ ] `vsce ls` shows exactly: `package.json`, `themes/*.json`, `icon.png`,
      `README.md`, `CHANGELOG.md`, `LICENSE`, `NOTICE`.
- [ ] `package.json` `publisher` equals the Marketplace publisher id.
- [ ] `version` is bumped and the changelog has an entry for it.
- [ ] Repository secrets `VSCE_PAT` and `OVSX_PAT` are set and current.
- [ ] The tag `v<version>` is pushed to `main`.

[VS Code Marketplace publisher portal]: https://marketplace.visualstudio.com/manage
[open-vsx.org]: https://open-vsx.org
