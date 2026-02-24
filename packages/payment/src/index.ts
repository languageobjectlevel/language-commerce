import type { InvoiceRecord, PaymentSettlement } from "@language-commerce/contracts";

export function reconcilePayment(invoice: InvoiceRecord, paidCents: number, sourceEventId: string): PaymentSettlement {
  if (paidCents < invoice.amountDueCents) {
    throw new Error("Partial settlement is not permitted in v1");
  }

  if (!sourceEventId.trim()) {
    throw new Error("sourceEventId is required");
  }

  return {
    settlementId: `set_${invoice.invoiceId}`,
    invoiceId: invoice.invoiceId,
    paidCents,
    provider: "manual",
    status: "settled",
    sourceEventId,
    reconciledAt: new Date().toISOString()
  };
}
