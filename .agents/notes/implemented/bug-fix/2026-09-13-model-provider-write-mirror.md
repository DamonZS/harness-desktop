# Agent Note: Immediate model-provider visibility after settings writes

Status: implemented

English | [中文](2026-09-13-model-provider-write-mirror.zh.md)

## Problem

The Models page wrote a newly created provider successfully, but its shared settings mirror still held the pre-write namespace view. The page reused that ready snapshot before a pushed invalidation arrived, classified the provider as unconfigured, and omitted it from the configured rows.

## Decision

The Models operations binding receives the shared settings describe face from the plugin apply function. Every successful `settings.mutate` folds its returned namespace view into that mirror through `acceptView` before returning the written outcome to the card. Existing direct operation callers may omit the face; production wiring always supplies it.

## Alternatives considered

**Wait for `settings/document-updated`.** Event delivery is asynchronous and the page can render a ready snapshot first, leaving the provider absent until a later refresh.

**Force a full `settings.describe` after every write.** This adds a wire round trip and duplicates the namespace view already returned by the write operation.

**Teach the list store to infer the new provider locally.** The store does not own the complete settings document or write semantics, so local inference could diverge from the Host response.

## Consequences

Successful create, edit, and delete operations update every consumer of the shared mirror immediately while preserving the existing invalidation path for external changes. The optional operation parameter keeps isolated component tests and non-page callers source-compatible; the page's apply wiring remains the owner of the shared face.

## Testing

The Models apply suite verifies that a successful settings write returns the written view and calls the shared mirror's `acceptView` synchronously in the operation flow.
