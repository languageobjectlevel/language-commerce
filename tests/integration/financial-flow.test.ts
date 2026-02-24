import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCommerceApp } from "../../apps/commerce-api/src/app.js";

describe("financial integration flow", () => {
  const app = createCommerceApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("runs opportunity to settlement workflow", async () => {
    const opportunityResponse = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "opp-idem-1" },
      payload: {
        opportunityId: "opp_1",
        accountId: "acct_1",
        channel: "web",
        valueCents: 300_000_00,
        currency: "USD",
        createdAt: new Date().toISOString()
      }
    });

    expect(opportunityResponse.statusCode).toBe(201);

    const proposalResponse = await app.inject({
      method: "POST",
      url: "/v1/proposals",
      payload: { opportunityId: "opp_1" }
    });
    expect(proposalResponse.statusCode).toBe(201);
    const proposalBody = proposalResponse.json();

    const orderResponse = await app.inject({
      method: "POST",
      url: "/v1/orders",
      payload: { proposalId: proposalBody.proposalId, customerId: "cust_1" }
    });
    expect(orderResponse.statusCode).toBe(201);
    const orderBody = orderResponse.json();

    const invoiceResponse = await app.inject({
      method: "POST",
      url: "/v1/invoices",
      payload: { orderId: orderBody.orderId, dueDays: 30 }
    });
    expect(invoiceResponse.statusCode).toBe(201);
    const invoiceBody = invoiceResponse.json();

    const paymentResponse = await app.inject({
      method: "POST",
      url: "/v1/payments/reconcile",
      headers: { "idempotency-key": "pay-idem-1" },
      payload: { invoiceId: invoiceBody.invoiceId, paidCents: invoiceBody.amountDueCents }
    });

    expect(paymentResponse.statusCode).toBe(201);

    const metricsResponse = await app.inject({
      method: "GET",
      url: "/v1/revenue/metrics"
    });
    expect(metricsResponse.statusCode).toBe(200);
    expect(metricsResponse.json().recognizedCents).toBeGreaterThan(0);
  });
});
