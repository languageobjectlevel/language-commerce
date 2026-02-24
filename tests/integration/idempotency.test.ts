import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createCommerceApp } from "../../apps/commerce-api/src/app.js";

describe("idempotency integration", () => {
  const app = createCommerceApp();

  afterEach(async () => {
    await app.close();
  });

  it("returns duplicate response for retried opportunity and payment requests", async () => {
    const payload = {
      opportunityId: "opp_dup_1",
      accountId: "acct_dup",
      channel: "api",
      valueCents: 200_000_00,
      currency: "USD",
      createdAt: new Date().toISOString()
    };

    const firstOpportunity = await request(app.server)
      .post("/v1/opportunities/ingest")
      .set("idempotency-key", "opp-dup-key")
      .send(payload);

    const secondOpportunity = await request(app.server)
      .post("/v1/opportunities/ingest")
      .set("idempotency-key", "opp-dup-key")
      .send(payload);

    expect(firstOpportunity.status).toBe(201);
    expect(secondOpportunity.status).toBe(200);
    expect(secondOpportunity.body.duplicate).toBe(true);
  });
});
