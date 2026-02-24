# Recovery Runbook

## Service Recovery

1. Validate datastore consistency for opportunities, orders, invoices, settlements.
2. Replay pending outbox events in order.
3. Re-run security regression and integration suites.
4. Resume public API traffic after post-recovery checks pass.
