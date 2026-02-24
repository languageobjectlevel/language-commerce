import { createHmac, timingSafeEqual } from "node:crypto";

const riskyWords = ["launder", "stolen", "fraud", "chargeback ring"];
const allowedCurrencies = new Set(["USD", "EUR", "GBP"]);

export function hasFraudSignal(input: string): boolean {
  const lower = input.toLowerCase();
  return riskyWords.some((token) => lower.includes(token));
}

export function verifyWebhookSignature(secret: string, body: string, signature: string): boolean {
  const computed = createHmac("sha256", secret).update(body).digest("hex");
  const left = Buffer.from(computed);
  const right = Buffer.from(signature);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function enforceCurrencyAllowlist(currency: string): void {
  if (!allowedCurrencies.has(currency)) {
    throw new Error(`Currency ${currency} is not allowed`);
  }
}

export function sanitizeFreeText(input: string): string {
  const withoutControlChars = input.replace(/[\x00-\x1f\x7f]/g, "");
  return withoutControlChars.slice(0, 1024);
}
