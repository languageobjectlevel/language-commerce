import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCommerceApp } from "../../apps/commerce-api/src/app.js";

describe("idempotency integration", () => {
  const app = createCommerceApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns duplicate response for retried opportunity requests", async () => {
    const payload = {
      opportunityId: "opp_dup_1",
      accountId: "acct_dup",
      channel: "api",
      valueCents: 200_000_00,
      currency: "USD",
      createdAt: new Date().toISOString()
    };

    const firstOpportunity = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "opp-dup-key" },
      payload
    });

    const secondOpportunity = await app.inject({
      method: "POST",
      url: "/v1/opportunities/ingest",
      headers: { "idempotency-key": "opp-dup-key" },
      payload
    });

    expect(firstOpportunity.statusCode).toBe(201);
    expect(secondOpportunity.statusCode).toBe(200);
    expect(secondOpportunity.json().duplicate).toBe(true);
  });
});
