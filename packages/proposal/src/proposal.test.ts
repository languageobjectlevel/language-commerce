import { describe, expect, it } from "vitest";
import { calculateDiscount, generateProposal } from "./index.js";

describe("proposal service", () => {
  it("applies discount tiers for enterprise values", () => {
    expect(calculateDiscount(1_000_000_00)).toBe(100_000_00);
    expect(calculateDiscount(500_000_00)).toBe(25_000_00);
    expect(calculateDiscount(50_000_00)).toBe(0);
  });

  it("generates proposal with validity window", () => {
    const draft = generateProposal({
      opportunityId: "opp_3",
      accountId: "acct_3",
      channel: "api",
      valueCents: 300_000_00,
      currency: "USD",
      createdAt: new Date().toISOString()
    });

    expect(draft.validUntil).toBeTruthy();
    expect(draft.discountCents).toBeGreaterThan(0);
    expect(draft.totalCents).toBe(285_000_00);
  });
});
