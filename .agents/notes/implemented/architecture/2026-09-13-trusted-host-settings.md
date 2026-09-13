---
title: Trusted web authorities enable persistent browser settings
status: implemented
---

The connection Host plugin injects its validated `trustedHosts` list into each served page. The client reuses the Host authority matcher when deriving `ctx.connection.isLoopback`, so an explicitly configured deployment domain can use the Host settings document while an unlisted remote origin remains memory-only. Host/Origin trust and browser token authentication are unchanged.
