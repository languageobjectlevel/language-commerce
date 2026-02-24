# language-commerce

`language-commerce` is the revenue and transaction engine for Language Object Level. It automates opportunity intake through proposal, order, invoice, and payment settlement flows with deterministic controls.

## Platform Role

`language-commerce` is one of three platform repositories:

- `language-commerce` handles revenue and financial workflow automation
- `language-operator` executes downstream operational tasks requested by commerce
- `language-fleet` coordinates distributed runtime capacity and control-plane actions

## End-to-End Commerce Flow

1. Ingest opportunity (`/v1/opportunities/ingest`)
2. Generate proposal (`/v1/proposals`)
3. Confirm order (`/v1/orders`)
4. Issue invoice (`/v1/invoices`)
5. Reconcile payment (`/v1/payments/reconcile`)
6. Publish metrics and settlement state (`/v1/revenue/metrics`)

## API Surface (v1)

- `POST /v1/opportunities/ingest`
- `POST /v1/proposals`
- `POST /v1/orders`
- `POST /v1/invoices`
- `POST /v1/payments/reconcile`
- `GET /v1/revenue/metrics`

Additional operational endpoints:

- `GET /v1/operator/tasks`
- `GET /v1/events/outbox`
- `GET /v1/observability/logs`

Contract source of truth:

- `contracts/openapi/commerce.v1.yaml`

## Event Contracts (v1)

- `commerce.opportunity.created.v1`
- `commerce.proposal.generated.v1`
- `commerce.order.confirmed.v1`
- `commerce.invoice.issued.v1`
- `commerce.payment.settled.v1`
- `commerce.task.requested.v1`

Contract source of truth:

- `contracts/asyncapi/commerce.events.v1.yaml`

## Cross-Repository Integration

`language-commerce` is contract-compatible with `language-operator` through `commerce.task.requested.v1` payloads that request execution work with deterministic correlation ids.

## Core Domain Types

Exported from workspace packages:

- `OpportunityRecord`
- `ProposalDraft`
- `OrderRecord`
- `InvoiceRecord`
- `PaymentSettlement`
- `RevenueSnapshot`
- `OperatorTaskRequest`

## Repository Layout

```text
apps/
  commerce-api/
packages/
  contracts/
  events/
  opportunity/
  proposal/
  order/
  invoice/
  payment/
  operator-bridge/
  security/
  observability/
contracts/
  openapi/
  asyncapi/
docs/
  adr/
  runbooks/
```

## Quick Start

### Prerequisites

- Node.js 22+
- npm 10+

### Install and Verify

```bash
npm ci
npm run lint
npm run typecheck
npm run test
```

## Required Engineering Gates

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run contract:validate
npm run security:scan
npm run sbom
npm run license:check
npm run docs:link-check
```

Coverage target policy:

- Lines: >= 85%
- Branches: >= 80%

## Security and Financial Correctness Controls

- Idempotency headers on critical write endpoints
- Replay-safe payment reconciliation behavior
- Webhook signature verification support
- Currency allowlist and fraud-signal filtering
- Threat model and incident runbooks in `docs/`

## Documentation Path (Recommended Order)

1. `docs/architecture.md`
2. `docs/testing-strategy.md`
3. `docs/threat-model.md`
4. `docs/adr/`
5. `docs/runbooks/incident-response.md`
6. `docs/runbooks/revenue-reconciliation.md`
7. `docs/release-notes-1.0.0.md`

## Release and Branch Model

- Long-lived branches: `main`, `develop`
- Working branches: `feature/*`, `security/*`, `test/*`, `docs/*`, `release/*`, `hotfix/*`
- Releases are produced from `release/x.y.z`, then merged to `main` and back-merged to `develop`

## Contributing and Support

- Contribution process: `CONTRIBUTING.md`
- Code ownership: `CODEOWNERS`
- Security reporting: `SECURITY.md`
- Operational support: `SUPPORT.md`
