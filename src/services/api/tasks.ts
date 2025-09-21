// @ts-ignore
/* eslint-disable */
import request, { apiPrefix } from "~/utils/request";

/** Get tasks GET /task */
export async function getTask(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Task[] }>(
    `${apiPrefix}/task`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** Create task POST /task */
export async function postTask(
  body: API.TaskCreateRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Task }>(
    `${apiPrefix}/task`,
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
