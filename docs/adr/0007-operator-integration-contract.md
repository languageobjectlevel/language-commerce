# ADR 0007: Operator Integration Contract

## Status

Accepted

## Decision

Order confirmation emits `commerce.task.requested.v1` payloads compatible with `language-operator` task intake.

## Notes

Bridge payloads include deterministic correlation ids for end-to-end auditability.
