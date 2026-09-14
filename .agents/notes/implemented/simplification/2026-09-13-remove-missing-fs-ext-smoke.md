# Agent Note: Remove missing fs-ext runtime smoke check

Status: implemented

English | [中文](2026-09-13-remove-missing-fs-ext-smoke.zh.md)

## Problem
The desktop runtime packaging smoke fixture required `fs-ext`, but the project source and production dependency closure do not contain that package. This made the Windows packaging workflow fail on a dependency that is not shipped.

## Decision
The runtime smoke fixture no longer loads or exercises `fs-ext`. Its package-specific exclusion rules, test cases, and workspace build approval entry were removed with the check. Existing checks for `koffi`, `sharp`, HTML dependencies, and `node-pty` remain unchanged.

## Alternatives considered
**Adding `fs-ext` as a production dependency:** rejected because no runtime code imports it and adding it would increase the shipped dependency set without restoring a required capability.

**Skipping the whole runtime smoke fixture:** rejected because the remaining native and HTML runtime checks still cover shipped dependencies.

## Consequences
Windows unsigned packaging completes without requiring an unavailable package. The runtime smoke output no longer reports an `fsExt` field.
