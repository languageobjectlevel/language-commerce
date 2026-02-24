import type { OperatorTaskRequest, OrderRecord } from "@language-commerce/contracts";

export function buildOperatorTaskRequest(order: OrderRecord): OperatorTaskRequest {
  return {
    requestId: `task_${order.orderId}`,
    taskType: "fulfillment",
    source: "language-commerce",
    correlationId: order.orderId,
    payload: {
      orderId: order.orderId,
      customerId: order.customerId,
      amountCents: order.amountCents
    },
    createdAt: new Date().toISOString()
  };
}
