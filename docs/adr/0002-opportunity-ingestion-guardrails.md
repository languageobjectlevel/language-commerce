# ADR 0002: Opportunity Ingestion Guardrails

## Status

Accepted

## Decision

All opportunity ingestion requests require an `idempotency-key` header and pass through risk scoring before being persisted.

## Rationale

This prevents duplicate intake and creates deterministic admission behavior under retries.
