# language-commerce

Revenue and transaction engine for Language Object Level.

## Core API

- `POST /v1/opportunities/ingest`
- `POST /v1/proposals`
- `POST /v1/orders`
- `POST /v1/invoices`
- `POST /v1/payments/reconcile`
- `GET /v1/revenue/metrics`

## Event Contracts

- `commerce.opportunity.created.v1`
- `commerce.proposal.generated.v1`
- `commerce.order.confirmed.v1`
- `commerce.invoice.issued.v1`
- `commerce.payment.settled.v1`
- `commerce.task.requested.v1`

## Engineering Gates

Run before merge:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run contract:validate`
- `npm run security:scan`
- `npm run sbom`
- `npm run license:check`
- `npm run docs:link-check`
