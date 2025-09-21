import type { RequestHandler } from '@builder.io/qwik-city';
import { and, eq, gte, isNull, lt, or, sql } from 'drizzle-orm';
import { errorResponse, successResponse } from '~/routes/api/utils/api-response';
import { getDB } from '~drizzle/client';
import { secrets } from '~drizzle/schema/secrets';

/**
 * 请求体接口定义
 */
interface ValidateSecretRequest {
  secret: string;
  project_id: number;
}

/**
 * POST请求处理函数 - 验证密钥是否有效
 */
export const onPost: RequestHandler = async ({ json, parseBody, env }) => {
  try {
    const db = getDB(env);
    const body = (await parseBody()) as ValidateSecretRequest;

    // 验证必要参数
    if (!body.secret) {
      json(200, errorResponse(400, '密钥不能为空'));
      return;
    }

    if (!body.project_id) {
      json(200, errorResponse(400, '项目ID不能为空'));
      return;
    }

    const now = new Date().toISOString();

    // 查询有效密钥
    // 条件：密钥值匹配 && 项目ID匹配 && (无过期时间 || 过期时间为0 || 未过期) && (无最大调用次数 || 最大调用次数为0 || 当前调用次数小于最大调用次数)
    const validSecrets = await db
      .select()
      .from(secrets)
      .where(
        and(
          eq(secrets.value, body.secret),
          eq(secrets.project_id, body.project_id),
          or(isNull(secrets.expires_at), eq(secrets.expires_at, '0'), gte(secrets.expires_at, now)),
          or(
            isNull(secrets.max_calls),
            eq(secrets.max_calls, 0),
            lt(sql`IFNULL(${secrets.current_calls}, 0)`, secrets.max_calls),
          ),
        ),
      );

    // 返回验证结果
    json(
      200,
      successResponse({
        valid: validSecrets.length > 0,
        message: validSecrets.length > 0 ? '密钥有效' : '无效的密钥',
      }),
    );
  } catch (error) {
    json(
      200,
      errorResponse(500, `验证密钥失败: ${error instanceof Error ? error.message : '未知错误'}`),
    );
  }
};
