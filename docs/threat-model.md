# Threat Model

## Assets

- Financial records and payment state.
- Opportunity and proposal data.
- Event and audit streams.

## Threats

- Payment replay and duplicate settlement.
- Fraudulent opportunity ingestion.
- Unauthorized order mutation.

## Controls

- Idempotency keys on money movement endpoints.
- Signed webhook validation.
- Immutable audit trail with request ids.
