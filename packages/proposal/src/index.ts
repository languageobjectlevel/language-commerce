import type { OpportunityRecord, ProposalDraft } from "@language-commerce/contracts";

export function generateProposal(opportunity: OpportunityRecord): ProposalDraft {
  const lineItems = [
    { description: "Autonomous service package", quantity: 1, unitPriceCents: opportunity.valueCents }
  ];

  return {
    proposalId: `prop_${opportunity.opportunityId}`,
    opportunityId: opportunity.opportunityId,
    lineItems,
    totalCents: lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0),
    generatedAt: new Date().toISOString()
  };
}
