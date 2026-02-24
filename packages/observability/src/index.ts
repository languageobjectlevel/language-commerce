export type CounterMap = Record<string, number>;

const counters: CounterMap = Object.create(null);

export function increment(metric: string): void {
  counters[metric] = (counters[metric] ?? 0) + 1;
}

export function gauge(metric: string, value: number): void {
  counters[metric] = value;
}

export function snapshot(): CounterMap {
  return { ...counters };
}
