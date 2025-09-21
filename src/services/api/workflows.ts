// @ts-ignore
/* eslint-disable */
import request, { apiPrefix } from "~/utils/request";

/** Get workflows GET /workflow */
export async function getWorkflow(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getWorkflowParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Workflow[] }>(
    `${apiPrefix}/workflow`,
    {
      method: "GET",
      params: {
        // page has a default value: 1
        page: "1",
        // size has a default value: 10
        size: "10",
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** Create workflow POST /workflow */
export async function postWorkflow(
  body: API.WorkflowCreateRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Workflow }>(
    `${apiPrefix}/workflow`,
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

/** Get workflow by ID GET /workflow/${param0} */
export async function getWorkflowId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getWorkflowIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string; data?: API.Workflow }>(
    `${apiPrefix}/workflow/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** Update workflow PUT /workflow/${param0} */
export async function putWorkflowId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.putWorkflowIdParams,
  body: API.WorkflowUpdateRequest,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string }>(
    `${apiPrefix}/workflow/${param0}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** Delete workflow DELETE /workflow/${param0} */
export async function deleteWorkflowId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteWorkflowIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string }>(
    `${apiPrefix}/workflow/${param0}`,
    {
      method: "DELETE",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
