import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  enforceCurrencyAllowlist,
  hasFraudSignal,
  sanitizeFreeText,
  verifyWebhookSignature
} from "./index.js";

describe("security controls", () => {
  it("rejects disallowed currencies", () => {
    expect(() => enforceCurrencyAllowlist("BTC")).toThrow(/not allowed/);
  });

  it("sanitizes control characters", () => {
    expect(sanitizeFreeText("acct\u0000value")).toBe("acctvalue");
  });

  it("verifies webhook signatures", () => {
    const secret = "secret";
    const payload = "{\"id\":\"evt_1\"}";
    const signature = createHmac("sha256", secret).update(payload).digest("hex");
    expect(verifyWebhookSignature(secret, payload, signature)).toBe(true);
  });

  it("detects obvious fraud signal text", () => {
    expect(hasFraudSignal("possible launder operation")).toBe(true);
  });
});
