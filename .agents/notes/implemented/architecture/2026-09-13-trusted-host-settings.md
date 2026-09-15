# Agent Note: Trusted web authorities enable persistent browser settings

Status: implemented

English | [中文](2026-09-13-trusted-host-settings.zh.md)

## Problem

The deployed browser needs persistent model settings, but the client otherwise classifies every non-loopback hostname as memory-only.

## Decision

The connection Host plugin injects its validated `trustedHosts` list into each served page. The client passes that list into the instance-local `installConnection` options and reuses the Host authority matcher when deriving `ctx.connection.isLoopback`. Matching includes explicit ports. An explicitly configured deployment domain can use the Host settings document while an unlisted remote origin remains memory-only. Host/Origin trust and browser token authentication are unchanged.

## Alternatives considered

**Treat every remote page as local.** This would expose privileged settings controls without an explicit deployment trust decision.

**Read global configuration inside every installer.** This would couple worker and test contexts to unrelated page state. Only the browser plugin adapter reads the bootstrap globals.

## Consequences

Deployment owners retain an explicit authority list. Client tests cover trusted hosts, mismatched hosts and ports, and empty authorities; Host tests cover bootstrap injection and disposal. These checks establish settings reachability, not a replacement for request authentication.
