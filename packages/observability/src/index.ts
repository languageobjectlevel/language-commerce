export type CounterMap = Record<string, number>;
export type LogRecord = {
  level: "info" | "warn" | "error";
  event: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

const counters: CounterMap = {};
const logs: LogRecord[] = [];

export function increment(metric: string): void {
  counters[metric] = (counters[metric] ?? 0) + 1;
}

export function gauge(metric: string, value: number): void {
  counters[metric] = value;
}

export function snapshot(): CounterMap {
  return { ...counters };
}

export function log(record: Omit<LogRecord, "timestamp">): void {
  logs.push({
    ...record,
    timestamp: new Date().toISOString()
  });
}

export function readLogs(): LogRecord[] {
  return [...logs];
}
