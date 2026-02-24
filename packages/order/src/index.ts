import type { OrderRecord, ProposalDraft } from "@language-commerce/contracts";

export function confirmOrder(proposal: ProposalDraft, customerId: string): OrderRecord {
  if (!customerId.trim()) {
    throw new Error("customerId is required");
  }

  return {
    orderId: `ord_${proposal.proposalId}`,
    proposalId: proposal.proposalId,
    customerId,
    amountCents: proposal.totalCents,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function cancelOrder(order: OrderRecord): OrderRecord {
  if (order.status !== "confirmed") {
    throw new Error("Only confirmed orders can be cancelled");
  }

  return {
    ...order,
    status: "cancelled",
    updatedAt: new Date().toISOString()
  };
}
