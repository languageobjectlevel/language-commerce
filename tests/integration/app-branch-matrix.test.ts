import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCommerceApp } from "../../apps/commerce-api/src/app.js";

describe("app branch matrix", () => {
  const app = createCommerceApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("covers rejection and duplicate paths across major endpoints", async () => {
    const noIdempotency = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      payload: {
        opportunityId: "opp_m_0",
        accountId: "acct_0",
        channel: "web",
        valueCents: 120_000_00,
        currency: "USD",
        createdAt: new Date().toISOString()
      }
    });
    expect(noIdempotency.statusCode).toBe(400);

    const badCurrency = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "m-currency" },
      payload: {
        opportunityId: "opp_m_1",
        accountId: "acct_1",
        channel: "web",
        valueCents: 120_000_00,
        currency: "BTC",
        createdAt: new Date().toISOString()
      }
    });
    expect(badCurrency.statusCode).toBe(400);

    const fraud = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "m-fraud" },
      payload: {
        opportunityId: "opp_m_2",
        accountId: "acct_launder_ring",
        channel: "web",
        valueCents: 140_000_00,
        currency: "USD",
        createdAt: new Date().toISOString()
      }
    });
    expect(fraud.statusCode).toBe(403);

    const denied = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "m-denied" },
      payload: {
        opportunityId: "opp_m_3",
        accountId: "acct_3",
        channel: "partner",
        valueCents: 700_000_00,
        currency: "USD",
        createdAt: new Date().toISOString()
      }
    });
    expect(denied.statusCode).toBe(422);

    const accepted = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "m-ok" },
      payload: {
        opportunityId: "opp_m_4",
        accountId: "acct_4",
        channel: "web",
        valueCents: 220_000_00,
        currency: "USD",
        createdAt: new Date().toISOString()
      }
    });
    expect(accepted.statusCode).toBe(201);

    const duplicateAccepted = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "m-ok" },
      payload: {
        opportunityId: "opp_m_4",
        accountId: "acct_4",
        channel: "web",
        valueCents: 220_000_00,
        currency: "USD",
        createdAt: new Date().toISOString()
      }
    });
    expect(duplicateAccepted.statusCode).toBe(200);

    const proposalMissing = await app.inject({
      method: "POST",
      url: "/v1/proposals",
      payload: { opportunityId: "unknown_opp" }
    });
    expect(proposalMissing.statusCode).toBe(404);

    const proposalCreated = await app.inject({
      method: "POST",
      url: "/v1/proposals",
      payload: { opportunityId: "opp_m_4" }
    });
    expect(proposalCreated.statusCode).toBe(201);
    const proposalBody = proposalCreated.json();

    const orderMissing = await app.inject({
      method: "POST",
      url: "/v1/orders",
      payload: { proposalId: "missing_prop", customerId: "cust_x" }
    });
    expect(orderMissing.statusCode).toBe(404);

    const orderCreated = await app.inject({
      method: "POST",
      url: "/v1/orders",
      payload: { proposalId: proposalBody.proposalId, customerId: "cust_4" }
    });
    expect(orderCreated.statusCode).toBe(201);
    const orderBody = orderCreated.json();

    const orderDuplicate = await app.inject({
      method: "POST",
      url: "/v1/orders",
      payload: { proposalId: proposalBody.proposalId, customerId: "cust_4" }
    });
    expect(orderDuplicate.statusCode).toBe(200);

    const invoiceMissing = await app.inject({
      method: "POST",
      url: "/v1/invoices",
      payload: { orderId: "missing_order" }
    });
    expect(invoiceMissing.statusCode).toBe(404);

    const invoiceCreated = await app.inject({
      method: "POST",
      url: "/v1/invoices",
      payload: { orderId: orderBody.orderId }
    });
    expect(invoiceCreated.statusCode).toBe(201);
    const invoiceBody = invoiceCreated.json();

    const invoiceDuplicate = await app.inject({
      method: "POST",
      url: "/v1/invoices",
      payload: { orderId: orderBody.orderId }
    });
    expect(invoiceDuplicate.statusCode).toBe(200);

    const paymentNoHeader = await app.inject({
      method: "POST",
      url: "/v1/payments/reconcile",
      payload: { invoiceId: invoiceBody.invoiceId, paidCents: invoiceBody.amountDueCents }
    });
    expect(paymentNoHeader.statusCode).toBe(400);

    const paymentMissing = await app.inject({
      method: "POST",
      url: "/v1/payments/reconcile",
      headers: { "idempotency-key": "m-pay-missing" },
      payload: { invoiceId: "missing_invoice", paidCents: 1 }
    });
    expect(paymentMissing.statusCode).toBe(404);

    const paymentCreated = await app.inject({
      method: "POST",
      url: "/v1/payments/reconcile",
      headers: { "idempotency-key": "m-pay" },
      payload: { invoiceId: invoiceBody.invoiceId, paidCents: invoiceBody.amountDueCents }
    });
    expect(paymentCreated.statusCode).toBe(201);

    const paymentDuplicate = await app.inject({
      method: "POST",
      url: "/v1/payments/reconcile",
      headers: { "idempotency-key": "m-pay" },
      payload: { invoiceId: invoiceBody.invoiceId, paidCents: invoiceBody.amountDueCents }
    });
    expect(paymentDuplicate.statusCode).toBe(200);

    const webhookInvalid = await app.inject({
      method: "POST",
      url: "/v1/payments/webhook/verify",
      payload: { payload: "{}", signature: "bad" }
    });
    expect(webhookInvalid.statusCode).toBe(401);

    const validPayload = JSON.stringify({ id: "evt_matrix" });
    const validSignature = createHmac("sha256", "local-dev-secret").update(validPayload).digest("hex");
    const webhookValid = await app.inject({
      method: "POST",
      url: "/v1/payments/webhook/verify",
      payload: { payload: validPayload, signature: validSignature }
    });
    expect(webhookValid.statusCode).toBe(200);

    const outbox = await app.inject({ method: "GET", url: "/v1/events/outbox" });
    const tasks = await app.inject({ method: "GET", url: "/v1/operator/tasks" });
    const logs = await app.inject({ method: "GET", url: "/v1/observability/logs" });

    expect(outbox.statusCode).toBe(200);
    expect(tasks.statusCode).toBe(200);
    expect(logs.statusCode).toBe(200);
  });
});
