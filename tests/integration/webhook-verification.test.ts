import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCommerceApp } from "../../apps/commerce-api/src/app.js";

describe("webhook verification integration", () => {
  const app = createCommerceApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("accepts valid webhook signatures", async () => {
    const payload = JSON.stringify({ id: "evt_1" });
    const signature = createHmac("sha256", "local-dev-secret").update(payload).digest("hex");

    const response = await app.inject({
      method: "POST",
      url: "/v1/payments/webhook/verify",
      payload: { payload, signature }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().valid).toBe(true);
  });
});
