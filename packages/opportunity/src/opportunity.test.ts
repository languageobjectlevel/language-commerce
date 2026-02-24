import { describe, expect, it } from "vitest";
import { assessOpportunity, validateOpportunityInput } from "./index.js";

describe("opportunity validation", () => {
  it("rejects non-positive values", () => {
    expect(() =>
      validateOpportunityInput({
        opportunityId: "opp_1",
        accountId: "acct_1",
        channel: "web",
        valueCents: 0,
        currency: "USD",
        createdAt: new Date().toISOString()
      })
    ).toThrow(/positive/);
  });

  it("calculates risk score and priority", () => {
    const result = assessOpportunity({
      opportunityId: "opp_2",
      accountId: "acct_2",
      channel: "partner",
      valueCents: 600_000_00,
      currency: "USD",
      createdAt: new Date().toISOString()
    });

    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.accepted).toBe(true);
    expect(result.priority).toBe("high");
  });
});
