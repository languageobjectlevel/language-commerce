import type { OpportunityRecord, ProposalDraft } from "@language-commerce/contracts";

export function generateProposal(opportunity: OpportunityRecord): ProposalDraft {
  const discountCents = calculateDiscount(opportunity.valueCents);
  const lineItems = [
    { description: "Autonomous service package", quantity: 1, unitPriceCents: opportunity.valueCents - discountCents }
  ];

  return {
    proposalId: `prop_${opportunity.opportunityId}`,
    opportunityId: opportunity.opportunityId,
    lineItems,
    totalCents: lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0),
    discountCents,
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    generatedAt: new Date().toISOString()
  };
}

export function calculateDiscount(valueCents: number): number {
  if (valueCents >= 750_000_00) {
    return Math.round(valueCents * 0.1);
  }

  if (valueCents >= 250_000_00) {
    return Math.round(valueCents * 0.05);
  }

  return 0;
}
