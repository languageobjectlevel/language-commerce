import type { OpportunityAssessment, OpportunityRecord } from "@language-commerce/contracts";

export function validateOpportunityInput(candidate: OpportunityRecord): OpportunityRecord {
  if (candidate.valueCents <= 0) {
    throw new Error("Opportunity value must be positive");
  }

  if (!candidate.accountId.trim()) {
    throw new Error("Account id is required");
  }

  return candidate;
}

export function assessOpportunity(candidate: OpportunityRecord): OpportunityAssessment {
  let riskScore = 0;

  if (candidate.channel === "partner") {
    riskScore += 20;
  }

  if (candidate.valueCents > 500_000_00) {
    riskScore += 35;
  }

  const priority = candidate.valueCents >= 100_000_00 ? "high" : "normal";
  const accepted = riskScore < 50;

  return {
    opportunityId: candidate.opportunityId,
    riskScore,
    priority,
    accepted,
    reason: accepted ? undefined : "Risk score exceeded ingestion threshold"
  };
}
