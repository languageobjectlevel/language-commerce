import { describe, expect, it } from "vitest";
import { reconcilePayment } from "./index.js";

describe("payment reconciliation", () => {
  it("requires source event id", () => {
    expect(() =>
      reconcilePayment(
        {
          invoiceId: "inv_1",
          invoiceNumber: "LOC-1",
          orderId: "ord_1",
          amountDueCents: 200,
          status: "issued",
          dueDate: new Date().toISOString(),
          issuedAt: new Date().toISOString()
        },
        200,
        ""
      )
    ).toThrow(/sourceEventId/);
  });

  it("produces settled status for full payment", () => {
    const settlement = reconcilePayment(
      {
        invoiceId: "inv_2",
        invoiceNumber: "LOC-2",
        orderId: "ord_2",
        amountDueCents: 300,
        status: "issued",
        dueDate: new Date().toISOString(),
        issuedAt: new Date().toISOString()
      },
      300,
      "event_123"
    );

    expect(settlement.status).toBe("settled");
    expect(settlement.sourceEventId).toBe("event_123");
  });
});
