import Fastify from "fastify";
import type {
  OpportunityRecord,
  PaymentSettlement,
  ProposalDraft,
  OrderRecord,
  InvoiceRecord,
  RevenueSnapshot
} from "@language-commerce/contracts";
import { validateOpportunityInput } from "@language-commerce/opportunity";
import { generateProposal } from "@language-commerce/proposal";
import { confirmOrder } from "@language-commerce/order";
import { issueInvoice } from "@language-commerce/invoice";
import { reconcilePayment } from "@language-commerce/payment";
import { hasFraudSignal } from "@language-commerce/security";
import { gauge, increment, snapshot } from "@language-commerce/observability";

const opportunities = new Map<string, OpportunityRecord>();
const proposals = new Map<string, ProposalDraft>();
const orders = new Map<string, OrderRecord>();
const invoices = new Map<string, InvoiceRecord>();
const settlements = new Map<string, PaymentSettlement>();

export function createCommerceApp() {
  const app = Fastify({ logger: false });

  app.get("/v1/health/liveness", async () => ({ status: "ok" }));

  app.post("/v1/opportunities/ingest", async (request, reply) => {
    const input = request.body as OpportunityRecord;
    if (hasFraudSignal(JSON.stringify(input))) {
      return reply.code(403).send({ error: "Opportunity rejected by anti-fraud rules" });
    }

    const record = validateOpportunityInput(input);
    opportunities.set(record.opportunityId, record);
    increment("commerce.opportunity.created.v1");
    return reply.code(201).send({ opportunityId: record.opportunityId });
  });

  app.post("/v1/proposals", async (request, reply) => {
    const body = request.body as { opportunityId: string };
    const opportunity = opportunities.get(body.opportunityId);
    if (!opportunity) {
      return reply.code(404).send({ error: "Opportunity not found" });
    }

    const draft = generateProposal(opportunity);
    proposals.set(draft.proposalId, draft);
    increment("commerce.proposal.generated.v1");
    return reply.code(201).send(draft);
  });

  app.post("/v1/orders", async (request, reply) => {
    const body = request.body as { proposalId: string; customerId: string };
    const proposal = proposals.get(body.proposalId);
    if (!proposal) {
      return reply.code(404).send({ error: "Proposal not found" });
    }

    const order = confirmOrder(proposal, body.customerId);
    orders.set(order.orderId, order);
    increment("commerce.order.confirmed.v1");
    return reply.code(201).send(order);
  });

  app.post("/v1/invoices", async (request, reply) => {
    const body = request.body as { orderId: string; dueDays?: number };
    const order = orders.get(body.orderId);
    if (!order) {
      return reply.code(404).send({ error: "Order not found" });
    }

    const invoice = issueInvoice(order, body.dueDays ?? 30);
    invoices.set(invoice.invoiceId, invoice);
    increment("commerce.invoice.issued.v1");
    return reply.code(201).send(invoice);
  });

  app.post("/v1/payments/reconcile", async (request, reply) => {
    const body = request.body as { invoiceId: string; paidCents: number };
    const invoice = invoices.get(body.invoiceId);
    if (!invoice) {
      return reply.code(404).send({ error: "Invoice not found" });
    }

    const settlement = reconcilePayment(invoice, body.paidCents);
    settlements.set(settlement.settlementId, settlement);
    increment("commerce.payment.settled.v1");
    return reply.code(201).send(settlement);
  });

  app.get("/v1/revenue/metrics", async (): Promise<RevenueSnapshot> => {
    const recognizedCents = Array.from(settlements.values()).reduce((sum, settlement) => sum + settlement.paidCents, 0);
    const unsettledCents = Array.from(invoices.values()).reduce((sum, invoice) => {
      const paid = Array.from(settlements.values())
        .filter((settlement) => settlement.invoiceId === invoice.invoiceId)
        .reduce((local, settlement) => local + settlement.paidCents, 0);
      return sum + Math.max(invoice.amountDueCents - paid, 0);
    }, 0);

    gauge("commerce.outstanding.invoices", invoices.size);

    return {
      periodStart: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date().toISOString(),
      recognizedCents,
      unsettledCents,
      outstandingInvoices: invoices.size
    };
  });

  app.get("/v1/metrics", async () => snapshot());

  return app;
}
