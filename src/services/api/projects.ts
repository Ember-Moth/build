// @ts-ignore
/* eslint-disable */
import request, { apiPrefix } from "~/utils/request";

/** Get projects Get list of projects GET /project */
export async function getProject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getProjectParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Project[] }>(
    `${apiPrefix}/project`,
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

/** Create project POST /project */
export async function postProject(
  body: API.ProjectCreateRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Project }>(
    `${apiPrefix}/project`,
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

/** Get project by ID GET /project/${param0} */
export async function getProjectId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getProjectIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string; data?: API.Project }>(
    `${apiPrefix}/project/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** Update project PUT /project/${param0} */
export async function putProjectId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.putProjectIdParams,
  body: API.ProjectUpdateRequest,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string }>(
    `${apiPrefix}/project/${param0}`,
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

/** Delete project DELETE /project/${param0} */
export async function deleteProjectId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteProjectIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string }>(
    `${apiPrefix}/project/${param0}`,
    {
      method: "DELETE",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
