# Agent Note: Mount Leila AC resources as a source-level skill provider

Status: implemented

English | [中文](2026-09-14-leila-ac-source-integration.zh.md)

## Problem

The Leila-Codex Offline resource set was available outside the harness, so profiles in this repository could not expose its AC route, Leila identity skill, or shared direct-execution instructions.

## Decision

`@deepseek-ai/dsh-skill-leila-ac` packages the resource set under `packages/skill/skill-leila-ac/assets/`. Its Cordis plugin registers an `leila-ac` provider with `ctx.skills` for the `ac` and `leila-identity` entries, and adds `gpt5.5-unrestricted.md` as a `ctx.systemPrompt` section after `HARNESS_IDENTITY`. The `dsh-base` bundle enables the plugin so web, headless, SDK, ACP, and desktop compositions receive the same source-level resources. Skill bodies remain immutable package assets and are loaded on demand; session state and routing execution remain owned by the existing skill registry and agent loop.

## Alternatives considered

**Copy the files into each profile or user skill directory.** Rejected: duplicated assets would drift across profiles and would not be part of the published package closure.

**Add the routing behavior inside `agent-loop`.** Rejected: the resource set is prompt and skill content, while loop lifecycle and session logging already have established owners; changing the loop would broaden the contract without adding runtime semantics.

**Load the external installation directory at runtime.** Rejected: deployments and packaged desktop builds cannot rely on a machine-specific `F:` path; package-owned assets make the source and artifact planes reproducible.

## Consequences

The `dsh-base` dependency closure grows by one package and its immutable Markdown assets. Updating the resource set requires changing the package assets and rebuilding the affected runtime. Focused tests verify provider registration, body loading, disposal, and system-prompt assembly; the normal package and Host build gates remain the release checks.
