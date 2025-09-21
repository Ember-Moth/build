// @ts-ignore
/* eslint-disable */
import request, { apiPrefix } from "~/utils/request";

/** Payment webhook POST /payment/webhook */
export async function postPaymentWebhook(
  body: API.PaymentWebhookRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string }>(
    `${apiPrefix}/payment/webhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}
