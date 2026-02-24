import type { OrderRecord, ProposalDraft } from "@language-commerce/contracts";

export function confirmOrder(proposal: ProposalDraft, customerId: string): OrderRecord {
  return {
    orderId: `ord_${proposal.proposalId}`,
    proposalId: proposal.proposalId,
    customerId,
    amountCents: proposal.totalCents,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };
}
