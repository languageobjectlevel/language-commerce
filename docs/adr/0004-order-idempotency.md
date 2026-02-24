# ADR 0004: Order Idempotency

## Status

Accepted

## Decision

Order creation is idempotent by proposal identifier; repeat calls return existing confirmed order state.
