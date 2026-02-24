# ADR 0006: Payment Reconciliation Idempotency

## Status

Accepted

## Decision

Payment reconciliation requires `idempotency-key` and uses it as the settlement source event identifier.

## Outcome

Replay attempts resolve to previously settled state without duplicating revenue recognition.
