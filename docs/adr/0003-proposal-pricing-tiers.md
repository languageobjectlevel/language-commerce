# ADR 0003: Proposal Pricing Tiers

## Status

Accepted

## Decision

Proposal generation applies deterministic discount tiers by opportunity value and returns an explicit validity window.

## Consequences

- Sales and operations can reconcile pricing outcomes deterministically.
- Expired proposals can be invalidated without recalculating historical pricing.
