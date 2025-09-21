// @ts-ignore
/* eslint-disable */
import request, { apiPrefix } from "~/utils/request";

/** Get secrets GET /secret */
export async function getSecret(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSecretParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Secret[] }>(
    `${apiPrefix}/secret`,
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

/** Create secret POST /secret */
export async function postSecret(
  body: API.SecretCreateRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; message?: string; data?: API.Secret }>(
    `${apiPrefix}/secret`,
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

/** Get secret by ID GET /secret/${param0} */
export async function getSecretId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSecretIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string; data?: API.Secret }>(
    `${apiPrefix}/secret/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** Update secret PUT /secret/${param0} */
export async function putSecretId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.putSecretIdParams,
  body: API.SecretUpdateRequest,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string }>(
    `${apiPrefix}/secret/${param0}`,
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

/** Delete secret DELETE /secret/${param0} */
export async function deleteSecretId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteSecretIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<{ code?: number; message?: string }>(
    `${apiPrefix}/secret/${param0}`,
    {
      method: "DELETE",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** Validate secret POST /secret/validate */
export async function postSecretValidate(
  body: API.SecretValidateRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    message?: string;
    data?: API.SecretValidateResponse;
  }>(`${apiPrefix}/secret/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
