import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createCommerceApp } from "../../apps/commerce-api/src/app.js";

describe("financial integration flow", () => {
  const app = createCommerceApp();

  afterEach(async () => {
    await app.close();
  });

  it("runs opportunity to settlement workflow", async () => {
    const opportunityResponse = await request(app.server)
      .post("/v1/opportunities/ingest")
      .set("idempotency-key", "opp-idem-1")
      .send({
        opportunityId: "opp_1",
        accountId: "acct_1",
        channel: "web",
        valueCents: 300_000_00,
        currency: "USD",
        createdAt: new Date().toISOString()
      });

    expect(opportunityResponse.status).toBe(201);

    const proposalResponse = await request(app.server).post("/v1/proposals").send({ opportunityId: "opp_1" });
    expect(proposalResponse.status).toBe(201);

    const orderResponse = await request(app.server)
      .post("/v1/orders")
      .send({ proposalId: proposalResponse.body.proposalId, customerId: "cust_1" });
    expect(orderResponse.status).toBe(201);

    const invoiceResponse = await request(app.server)
      .post("/v1/invoices")
      .send({ orderId: orderResponse.body.orderId, dueDays: 30 });
    expect(invoiceResponse.status).toBe(201);

    const paymentResponse = await request(app.server)
      .post("/v1/payments/reconcile")
      .set("idempotency-key", "pay-idem-1")
      .send({ invoiceId: invoiceResponse.body.invoiceId, paidCents: invoiceResponse.body.amountDueCents });

    expect(paymentResponse.status).toBe(201);

    const metricsResponse = await request(app.server).get("/v1/revenue/metrics");
    expect(metricsResponse.status).toBe(200);
    expect(metricsResponse.body.recognizedCents).toBeGreaterThan(0);
  });
});
