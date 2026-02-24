export type OpportunityRecord = {
  opportunityId: string;
  accountId: string;
  channel: "web" | "api" | "partner";
  valueCents: number;
  currency: string;
  createdAt: string;
};

export type OpportunityAssessment = {
  opportunityId: string;
  riskScore: number;
  priority: "low" | "normal" | "high";
  accepted: boolean;
  reason?: string;
};

export type ProposalDraft = {
  proposalId: string;
  opportunityId: string;
  lineItems: Array<{ description: string; quantity: number; unitPriceCents: number }>;
  totalCents: number;
  discountCents: number;
  validUntil: string;
  generatedAt: string;
};

export type OrderRecord = {
  orderId: string;
  proposalId: string;
  customerId: string;
  amountCents: number;
  status: "draft" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type InvoiceRecord = {
  invoiceId: string;
  orderId: string;
  amountDueCents: number;
  dueDate: string;
  issuedAt: string;
};

export type PaymentSettlement = {
  settlementId: string;
  invoiceId: string;
  paidCents: number;
  provider: "stripe" | "adyen" | "manual";
  reconciledAt: string;
};

export type RevenueSnapshot = {
  periodStart: string;
  periodEnd: string;
  recognizedCents: number;
  unsettledCents: number;
  outstandingInvoices: number;
};
