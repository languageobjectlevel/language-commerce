import type { InvoiceRecord, PaymentSettlement } from "@language-commerce/contracts";

export function reconcilePayment(invoice: InvoiceRecord, paidCents: number): PaymentSettlement {
  if (paidCents < invoice.amountDueCents) {
    throw new Error("Partial settlement is not permitted in v1");
  }

  return {
    settlementId: `set_${invoice.invoiceId}`,
    invoiceId: invoice.invoiceId,
    paidCents,
    provider: "manual",
    reconciledAt: new Date().toISOString()
  };
}
