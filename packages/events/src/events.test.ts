import { describe, expect, it } from "vitest";
import { clearOutbox, commerceEvents, publishEvent, readOutbox } from "./index.js";

describe("event outbox", () => {
  it("stores emitted events with deterministic fields", () => {
    clearOutbox();
    publishEvent({
      id: "evt_1",
      name: commerceEvents.orderConfirmed,
      emittedAt: new Date().toISOString(),
      payload: { orderId: "ord_1" }
    });

    const outbox = readOutbox();
    expect(outbox).toHaveLength(1);
    expect(outbox[0]?.name).toBe(commerceEvents.orderConfirmed);
  });
});
