import { describe, expect, it } from "vitest";
import { increment, log, readLogs, snapshot } from "./index.js";

describe("observability package", () => {
  it("records counter updates", () => {
    increment("metric.test");
    expect(snapshot()["metric.test"]).toBeGreaterThanOrEqual(1);
  });

  it("captures structured log entries", () => {
    log({ level: "info", event: "test.event", metadata: { source: "unit" } });
    const logs = readLogs();
    expect(logs.at(-1)?.event).toBe("test.event");
  });
});
