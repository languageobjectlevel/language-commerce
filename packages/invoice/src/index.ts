import type { InvoiceRecord, OrderRecord } from "@language-commerce/contracts";

export function issueInvoice(order: OrderRecord, dueDays = 30): InvoiceRecord {
  const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    invoiceId: `inv_${order.orderId}`,
    orderId: order.orderId,
    amountDueCents: order.amountCents,
    dueDate,
    issuedAt: new Date().toISOString()
  };
}
