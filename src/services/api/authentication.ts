// @ts-ignore
/* eslint-disable */
import request, { apiPrefix } from "~/utils/request";

/** Validate API key GET /auth */
export async function getAuth(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    message?: string;
    data?: API.ApiKeyValidationResponse;
  }>(`${apiPrefix}/auth`, {
    method: "GET",
    ...(options || {}),
  });
}
