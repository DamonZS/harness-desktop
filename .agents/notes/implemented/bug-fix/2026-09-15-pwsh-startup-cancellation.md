# Agent Note: Preserve PowerShell cancellation during managed startup

Status: implemented

English | [中文](2026-09-15-pwsh-startup-cancellation.zh.md)

## Problem

The Windows managed subprocess provider can reject its direct outcome with the caller's cancellation reason before startup completes. The PowerShell foreground executor previously treated that rejection as an infrastructure failure, so short deadlines and early cancellation lost their documented result flags.

## Decision

The executor converts only a rejection identical to its aborted deadline signal's reason into a result without an exit outcome. It awaits process cleanup before returning the existing timeout or cancellation flags. Other provider errors remain rejections.

## Alternatives considered

**Increase timeouts.** This hides the startup race without handling cancellation on slower hosts.

**Convert every rejection after cancellation.** This hides independent provider failures that happen concurrently with an abort.

## Consequences

Deterministic provider tests cover deadline and caller cancellation, cleanup waiting, and independent failures both with and without an aborted signal. Real PowerShell executor and tool integration tests exercise the Windows startup path. The tool result format and permission decisions do not change.
