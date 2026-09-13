# Agent Note: Build fixed-name Desktop installers in GitHub Actions

Status: implemented

English | [中文](2026-09-13-desktop-github-release-workflow.zh.md)

## Problem
Desktop installers were built only through local target commands, and the Windows builder emitted only an NSIS installer. A tagged GitHub release needs repeatable Windows x64 NSIS/MSI and macOS arm64 DMG assets with stable download names.

## Decision
The Desktop release workflow runs native Windows and macOS arm64 jobs. Windows electron-builder targets `nsis` and `msi`; the workflow copies the resulting installers to `windows-x64-setup.exe` and `windows-x64.msi`. The macOS job packages the signed and notarized arm64 DMG and copies it to `macos-arm64.dmg`. A tag-triggered release job publishes exactly those three files to the GitHub release.

## Alternatives considered
**Cross-building every target on one Ubuntu runner:** rejected because the Desktop packaging script requires a native Windows host for `win-x64` and a macOS host for macOS targets.

**Changing the versioned electron-builder artifact names globally:** rejected because updater metadata and COS upload validation rely on versioned names; stable GitHub download names are applied only to release copies.

## Consequences
Tags matching `V*` or `v*` produce a GitHub release containing the three fixed-name installers. macOS releases require repository secrets for the signing certificate, certificate password, signing identity, Team ID, and App Store Connect API key credentials. Windows assets are currently unsigned and may show a Windows security warning.
