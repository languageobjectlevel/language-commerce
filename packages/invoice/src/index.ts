import type { InvoiceRecord, OrderRecord } from "@language-commerce/contracts";

export function issueInvoice(order: OrderRecord, dueDays = 30): InvoiceRecord {
  if (dueDays < 1 || dueDays > 90) {
    throw new Error("dueDays must be between 1 and 90");
  }

  const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();
  const suffix = order.orderId.slice(-8).toUpperCase();

  return {
    invoiceId: `inv_${order.orderId}`,
    invoiceNumber: `LOC-${suffix}`,
    orderId: order.orderId,
    amountDueCents: order.amountCents,
    status: "issued",
    dueDate,
    issuedAt: new Date().toISOString()
  };
}
