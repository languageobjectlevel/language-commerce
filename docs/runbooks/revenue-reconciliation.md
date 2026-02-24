# Revenue Reconciliation Runbook

## Trigger Conditions

- Unexpected mismatch between settled payments and recognized revenue.
- Settlement duplicate alerts.

## Steps

1. Freeze reconciliation requests at ingress.
2. Export `/v1/events/outbox` and settlement snapshots.
3. Run replay simulation in isolated test environment.
4. Apply corrective entries with explicit audit references.
5. Resume traffic after sign-off.
