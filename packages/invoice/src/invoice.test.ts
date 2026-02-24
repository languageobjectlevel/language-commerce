import { describe, expect, it } from "vitest";
import { issueInvoice } from "./index.js";

describe("invoicing", () => {
  it("enforces due day range", () => {
    expect(() =>
      issueInvoice(
        {
          orderId: "ord_1",
          proposalId: "prop_1",
          customerId: "cust_1",
          amountCents: 100,
          status: "confirmed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        0
      )
    ).toThrow(/between 1 and 90/);
  });

  it("issues invoice with deterministic invoice number", () => {
    const invoice = issueInvoice({
      orderId: "ord_ABC12345",
      proposalId: "prop_2",
      customerId: "cust_2",
      amountCents: 250,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    expect(invoice.invoiceNumber).toContain("LOC-");
    expect(invoice.status).toBe("issued");
  });
});
