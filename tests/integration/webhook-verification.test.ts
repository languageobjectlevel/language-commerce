import { createHmac } from "node:crypto";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createCommerceApp } from "../../apps/commerce-api/src/app.js";

describe("webhook verification integration", () => {
  const app = createCommerceApp();

  afterEach(async () => {
    await app.close();
  });

  it("accepts valid webhook signatures", async () => {
    const payload = JSON.stringify({ id: "evt_1" });
    const signature = createHmac("sha256", "local-dev-secret").update(payload).digest("hex");

    const response = await request(app.server)
      .post("/v1/payments/webhook/verify")
      .send({ payload, signature });

    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(true);
  });
});
