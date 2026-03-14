# Sentry Changelogs

Versioned changelog artifacts live in this folder.

Contract:
- filename pattern: `CHANGELOGS_x_y_z.md`
- version source of truth: repository `package.json`
- generation moment: at delivery closure time, using the real current project version at that moment

Release workflow contract:
- tag format: `vX.Y.Z`
- preferred changelog path for tag `vX.Y.Z`: `changelogs/CHANGELOGS_X_Y_Z.md`
- GitHub Release uses the curated file body when it exists
- if the file is missing, the release workflow falls back to generated GitHub release notes without failing in v1

Local helpers:
- `npm run release:changelog:resolve`
- `npm run release:changelog:validate`
