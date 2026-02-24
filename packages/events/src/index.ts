export const commerceEvents = {
  opportunityCreated: "commerce.opportunity.created.v1",
  proposalGenerated: "commerce.proposal.generated.v1",
  orderConfirmed: "commerce.order.confirmed.v1",
  invoiceIssued: "commerce.invoice.issued.v1",
  paymentSettled: "commerce.payment.settled.v1",
  taskRequested: "commerce.task.requested.v1"
} as const;

export type CommerceEventName = (typeof commerceEvents)[keyof typeof commerceEvents];

export type EventEnvelope<TPayload> = {
  id: string;
  name: CommerceEventName;
  emittedAt: string;
  idempotencyKey?: string;
  payload: TPayload;
};

const outbox: Array<EventEnvelope<unknown>> = [];

export function publishEvent<TPayload>(event: EventEnvelope<TPayload>): void {
  outbox.push(event as EventEnvelope<unknown>);
}

export function readOutbox(): Array<EventEnvelope<unknown>> {
  return [...outbox];
}

export function clearOutbox(): void {
  outbox.length = 0;
}
