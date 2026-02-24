import Fastify from "fastify";
import type {
  OpportunityAssessment,
  OperatorTaskRequest,
  OpportunityRecord,
  PaymentSettlement,
  ProposalDraft,
  OrderRecord,
  InvoiceRecord,
  RevenueSnapshot
} from "@language-commerce/contracts";
import { assessOpportunity, validateOpportunityInput } from "@language-commerce/opportunity";
import { generateProposal } from "@language-commerce/proposal";
import { confirmOrder } from "@language-commerce/order";
import { issueInvoice } from "@language-commerce/invoice";
import { reconcilePayment } from "@language-commerce/payment";
import { buildOperatorTaskRequest } from "@language-commerce/operator-bridge";
import { commerceEvents, publishEvent, readOutbox } from "@language-commerce/events";
import { hasFraudSignal } from "@language-commerce/security";
import { gauge, increment, snapshot } from "@language-commerce/observability";

const opportunities = new Map<string, OpportunityRecord>();
const opportunityAssessments = new Map<string, OpportunityAssessment>();
const proposals = new Map<string, ProposalDraft>();
const orders = new Map<string, OrderRecord>();
const orderByProposal = new Map<string, string>();
const invoices = new Map<string, InvoiceRecord>();
const invoiceByOrder = new Map<string, string>();
const settlements = new Map<string, PaymentSettlement>();
const operatorTasks = new Map<string, OperatorTaskRequest>();
const idempotencyIndex = new Map<string, { opportunityId: string }>();
const paymentIdempotency = new Map<string, string>();

export function createCommerceApp() {
  const app = Fastify({ logger: false });

  app.get("/v1/health/liveness", async () => ({ status: "ok" }));

  app.post("/v1/opportunities/ingest", async (request, reply) => {
    const input = request.body as OpportunityRecord;
    const idempotencyKey = request.headers["idempotency-key"]?.toString();
    if (!idempotencyKey) {
      return reply.code(400).send({ error: "idempotency-key header is required" });
    }

    const previous = idempotencyIndex.get(idempotencyKey);
    if (previous) {
      return reply.code(200).send({ opportunityId: previous.opportunityId, duplicate: true });
    }

    if (hasFraudSignal(JSON.stringify(input))) {
      return reply.code(403).send({ error: "Opportunity rejected by anti-fraud rules" });
    }

    const record = validateOpportunityInput(input);
    const assessment = assessOpportunity(record);
    if (!assessment.accepted) {
      increment("commerce.opportunity.denied.v1");
      return reply.code(422).send({ error: assessment.reason ?? "Opportunity denied" });
    }

    opportunities.set(record.opportunityId, record);
    opportunityAssessments.set(record.opportunityId, assessment);
    idempotencyIndex.set(idempotencyKey, { opportunityId: record.opportunityId });
    increment("commerce.opportunity.created.v1");
    publishEvent({
      id: `evt_${record.opportunityId}`,
      name: commerceEvents.opportunityCreated,
      emittedAt: new Date().toISOString(),
      idempotencyKey,
      payload: record
    });
    return reply.code(201).send({ opportunityId: record.opportunityId, assessment });
  });

  app.post("/v1/proposals", async (request, reply) => {
    const body = request.body as { opportunityId: string; pricingMode?: "standard" | "expedite" };
    const opportunity = opportunities.get(body.opportunityId);
    if (!opportunity) {
      return reply.code(404).send({ error: "Opportunity not found" });
    }

    const draft = generateProposal(opportunity);
    proposals.set(draft.proposalId, draft);
    increment("commerce.proposal.generated.v1");
    publishEvent({
      id: `evt_${draft.proposalId}`,
      name: commerceEvents.proposalGenerated,
      emittedAt: new Date().toISOString(),
      payload: draft
    });
    return reply.code(201).send({
      ...draft,
      pricingMode: body.pricingMode ?? "standard"
    });
  });

  app.post("/v1/orders", async (request, reply) => {
    const body = request.body as { proposalId: string; customerId: string };
    const proposal = proposals.get(body.proposalId);
    if (!proposal) {
      return reply.code(404).send({ error: "Proposal not found" });
    }

    const existingOrderId = orderByProposal.get(body.proposalId);
    if (existingOrderId) {
      const existingOrder = orders.get(existingOrderId);
      if (existingOrder) {
        return reply.code(200).send({ ...existingOrder, duplicate: true });
      }
    }

    const order = confirmOrder(proposal, body.customerId);
    orders.set(order.orderId, order);
    orderByProposal.set(body.proposalId, order.orderId);
    increment("commerce.order.confirmed.v1");
    publishEvent({
      id: `evt_${order.orderId}`,
      name: commerceEvents.orderConfirmed,
      emittedAt: new Date().toISOString(),
      payload: order
    });

    const operatorTask = buildOperatorTaskRequest(order);
    operatorTasks.set(operatorTask.requestId, operatorTask);
    increment("commerce.task.requested.v1");
    publishEvent({
      id: `evt_${operatorTask.requestId}`,
      name: commerceEvents.taskRequested,
      emittedAt: new Date().toISOString(),
      payload: operatorTask
    });

    return reply.code(201).send(order);
  });

  app.post("/v1/invoices", async (request, reply) => {
    const body = request.body as { orderId: string; dueDays?: number };
    const order = orders.get(body.orderId);
    if (!order) {
      return reply.code(404).send({ error: "Order not found" });
    }

    const existingInvoiceId = invoiceByOrder.get(body.orderId);
    if (existingInvoiceId) {
      const existingInvoice = invoices.get(existingInvoiceId);
      if (existingInvoice) {
        return reply.code(200).send({ ...existingInvoice, duplicate: true });
      }
    }

    const invoice = issueInvoice(order, body.dueDays ?? 30);
    invoices.set(invoice.invoiceId, invoice);
    invoiceByOrder.set(body.orderId, invoice.invoiceId);
    increment("commerce.invoice.issued.v1");
    publishEvent({
      id: `evt_${invoice.invoiceId}`,
      name: commerceEvents.invoiceIssued,
      emittedAt: new Date().toISOString(),
      payload: invoice
    });
    return reply.code(201).send(invoice);
  });

  app.post("/v1/payments/reconcile", async (request, reply) => {
    const body = request.body as { invoiceId: string; paidCents: number };
    const idempotencyKey = request.headers["idempotency-key"]?.toString();
    if (!idempotencyKey) {
      return reply.code(400).send({ error: "idempotency-key header is required" });
    }

    const previousSettlementId = paymentIdempotency.get(idempotencyKey);
    if (previousSettlementId) {
      const existing = settlements.get(previousSettlementId);
      if (existing) {
        return reply.code(200).send({ ...existing, duplicate: true });
      }
    }

    const invoice = invoices.get(body.invoiceId);
    if (!invoice) {
      return reply.code(404).send({ error: "Invoice not found" });
    }

    const settlement = reconcilePayment(invoice, body.paidCents, idempotencyKey);
    settlements.set(settlement.settlementId, settlement);
    paymentIdempotency.set(idempotencyKey, settlement.settlementId);
    increment("commerce.payment.settled.v1");
    publishEvent({
      id: `evt_${settlement.settlementId}`,
      name: commerceEvents.paymentSettled,
      emittedAt: new Date().toISOString(),
      idempotencyKey,
      payload: settlement
    });
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

  app.get("/v1/operator/tasks", async () => ({
    count: operatorTasks.size,
    items: Array.from(operatorTasks.values())
  }));

  app.get("/v1/events/outbox", async () => ({
    count: readOutbox().length,
    items: readOutbox()
  }));

  return app;
}
