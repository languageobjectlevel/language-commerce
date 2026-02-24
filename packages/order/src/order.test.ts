import { describe, expect, it } from "vitest";
import { cancelOrder, confirmOrder } from "./index.js";

describe("order management", () => {
  it("requires customer identifier", () => {
    expect(() =>
      confirmOrder(
        {
          proposalId: "prop_1",
          opportunityId: "opp_1",
          lineItems: [{ description: "x", quantity: 1, unitPriceCents: 100 }],
          totalCents: 100,
          discountCents: 0,
          validUntil: new Date().toISOString(),
          generatedAt: new Date().toISOString()
        },
        ""
      )
    ).toThrow(/customerId/);
  });

  it("cancels confirmed order", () => {
    const order = confirmOrder(
      {
        proposalId: "prop_2",
        opportunityId: "opp_2",
        lineItems: [{ description: "x", quantity: 1, unitPriceCents: 100 }],
        totalCents: 100,
        discountCents: 0,
        validUntil: new Date().toISOString(),
        generatedAt: new Date().toISOString()
      },
      "cust-1"
    );

    const cancelled = cancelOrder(order);
    expect(cancelled.status).toBe("cancelled");
  });
});
