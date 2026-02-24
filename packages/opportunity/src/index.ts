import type { OpportunityRecord } from "@language-commerce/contracts";

export function validateOpportunityInput(candidate: OpportunityRecord): OpportunityRecord {
  if (candidate.valueCents <= 0) {
    throw new Error("Opportunity value must be positive");
  }

  if (!candidate.accountId.trim()) {
    throw new Error("Account id is required");
  }

  return candidate;
}
