# Architecture

language-commerce is organized as a TypeScript workspace with a dedicated API app and domain packages:

- `opportunity`: intake validation and risk admission.
- `proposal`: pricing and proposal generation.
- `order`: contract-to-order conversion.
- `invoice`: billing issuance.
- `payment`: settlement and reconciliation.

Event and API contracts are maintained under `contracts/`.
