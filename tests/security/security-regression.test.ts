import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCommerceApp } from "../../apps/commerce-api/src/app.js";

describe("security regression", () => {
  const app = createCommerceApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects unsupported currency", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "sec-1" },
      payload: {
        opportunityId: "opp_sec_1",
        accountId: "acct_sec",
        channel: "web",
        valueCents: 100_000_00,
        currency: "BTC",
        createdAt: new Date().toISOString()
      }
    });

    expect(response.statusCode).toBe(500);
  });

  it("blocks fraud signals", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "sec-2" },
      payload: {
        opportunityId: "opp_sec_2",
        accountId: "acct_launder_pattern",
        channel: "web",
        valueCents: 120_000_00,
        currency: "USD",
        createdAt: new Date().toISOString()
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it("requires payment idempotency key", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/payments/reconcile",
      payload: { invoiceId: "inv_missing", paidCents: 1 }
    });

    expect(response.statusCode).toBe(400);
  });
});
