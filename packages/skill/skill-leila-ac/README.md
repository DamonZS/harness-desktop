---
description: "Bundled Leila AC routing skills and direct-execution system instructions for deployments that need the external Leila resource set."
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-leila-ac

English | [中文](README.zh.md)

## Summary

This package carries the source-level Leila resource set: the `ac` router skill, the `leila-identity` skill, and the global direct-execution instruction file. It registers the two skills through `ctx.skills` and adds the instruction file to `ctx.systemPrompt`, so the same behavior is available to CLI, Web, and Desktop profiles.

## Use this package

The `dsh-base` bundle mounts this package by default. A profile patch can disable the `skill-leila-ac` row when a deployment does not want the global instruction section. The provider reads skill bodies on demand and keeps the packaged `assets/` directory as their resource base.

## Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Provider registration and global prompt section |
| [`assets/gpt5.5-unrestricted.md`](assets/gpt5.5-unrestricted.md) | Global direct-execution instructions |
| [`assets/ac/SKILL.md`](assets/ac/SKILL.md) | AC route selection and delivery contract |
| [`assets/leila-identity/SKILL.md`](assets/leila-identity/SKILL.md) | Leila identity response |

## Model Experience

Indirectly, through `dsh-tool-skill`, which renders the provider's catalog entries and selected skill bodies to the model.

#### KV Cache effect

The static global section remains part of the reusable request prefix. Skill bodies enter at their normal tool-result insertion points and do not rewrite earlier prompt content.

## Known Limitations and Deferred Work

- The router state fields are prompt instructions; durable state remains owned by the session log and agent loop.
- Resource files are immutable package assets; changing them requires rebuilding the package and Desktop runtime.
