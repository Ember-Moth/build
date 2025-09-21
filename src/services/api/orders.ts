// @ts-ignore
/* eslint-disable */
import request, { apiPrefix } from "~/utils/request";

/** Create order POST /order */
export async function postOrder(
  body: API.OrderCreateRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Order }>(
    `${apiPrefix}/order`,
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

/** Get order by ID GET /order/${param0} */
export async function getOrderId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOrderIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string; data?: API.Order }>(
    `${apiPrefix}/order/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
