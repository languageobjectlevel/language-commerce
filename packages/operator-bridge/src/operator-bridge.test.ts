import { describe, expect, it } from "vitest";
import { buildOperatorTaskRequest } from "./index.js";

describe("operator bridge", () => {
  it("builds fulfillment task payload", () => {
    const task = buildOperatorTaskRequest({
      orderId: "ord_1",
      proposalId: "prop_1",
      customerId: "cust_1",
      amountCents: 500,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    expect(task.source).toBe("language-commerce");
    expect(task.taskType).toBe("fulfillment");
  });
});
