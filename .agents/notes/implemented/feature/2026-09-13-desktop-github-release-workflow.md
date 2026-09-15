# Agent Note: Build fixed-name Desktop installers in GitHub Actions

Status: implemented

English | [中文](2026-09-13-desktop-github-release-workflow.zh.md)

## Problem
Desktop installers were built only through local target commands, and the Windows builder emitted only an NSIS installer. A tagged GitHub release needs repeatable Windows x64 NSIS/MSI and macOS arm64 DMG assets with stable download names.

## Decision
The Desktop release workflow runs native Windows and macOS arm64 jobs against the triggering commit. Windows electron-builder targets `nsis` and `msi`; the workflow copies the resulting installers to `windows-x64-setup.exe` and `windows-x64.msi`. WiX uses a short output directory to avoid its path-length limit. The macOS job packages an ad-hoc-signed, unnotarized DMG as `macos-arm64.dmg`, preserving the separate credentialed packaging commands. Both platform jobs must succeed before a draft containing exactly those three files becomes public.

Main pushes and manual dispatch select the next version from published releases, not orphaned tags. A manual version input permits retrying an unpublished version. Tags are written after artifacts exist; an unpublished tag left by a failed build may move with an exact lease. Published releases are never replaced.

## Alternatives considered
**Cross-building every target on one Ubuntu runner:** rejected because the Desktop packaging script requires a native Windows host for `win-x64` and a macOS host for macOS targets.

**Changing the versioned electron-builder artifact names globally:** rejected because updater metadata and COS upload validation rely on versioned names; stable GitHub download names are applied only to release copies.

## Consequences
GitHub assets do not require signing secrets. Windows security warnings and macOS Gatekeeper restrictions remain; the release notes disclose unsigned Windows and unnotarized macOS artifacts. Packaging tests exercise credential-free configuration and workflow command resolution; shell fixtures verify version increments, invalid input, and published-version rejection. Native Actions builds verify MSI and DMG production before publication.
