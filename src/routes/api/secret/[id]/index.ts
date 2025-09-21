import { type RequestHandler } from '@builder.io/qwik-city';
import { eq } from 'drizzle-orm';
import { parse } from 'valibot';
import { errorResponse, successResponse } from '~/routes/api/utils/api-response';
import { generateRandomSecret } from '~/routes/api/utils/crypto';
import { getDB } from '~drizzle/client';
import type { Secret } from '~drizzle/schema/secrets';
import { secrets, updateSecretSchema } from '~drizzle/schema/secrets';

/**
 * GET请求处理函数 - 获取单个密钥详情
 */
export const onGet: RequestHandler = async ({ env, params, json }) => {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的密钥ID'));
      return;
    }

    const result = await getDB(env).select().from(secrets).where(eq(secrets.id, id));

    if (result.length === 0) {
      json(200, errorResponse(404, '密钥不存在'));
      return;
    }

    json(200, successResponse(result[0], '获取密钥成功'));
  } catch (error) {
    json(200, errorResponse(500, '获取密钥失败', error));
  }
};

/**
 * PUT请求处理函数 - 更新密钥
 */
export const onPut: RequestHandler = async ({ env, params, parseBody, json }) => {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的密钥ID格式'));
      return;
    }

    const db = getDB(env);

    // 检查密钥是否存在
    const exists = await db.select().from(secrets).where(eq(secrets.id, id));
    if (exists.length === 0) {
      json(200, errorResponse(404, '密钥不存在'));
      return;
    }

    const body = (await parseBody()) as Secret;

    // 处理特殊字段
    if (!body.value) {
      body.value = generateRandomSecret();
    }

    body.expires_at = body.expires_at ? new Date(body.expires_at).toISOString() : null;

    try {
      // 验证数据
      const validated = parse(updateSecretSchema, body);

      // 更新数据
      const updateData = {
        ...validated,
        updated_at: new Date().toISOString(),
      };

      const updated = await db
        .update(secrets)
        .set(updateData)
        .where(eq(secrets.id, id))
        .returning();

      json(200, successResponse(updated[0], '更新密钥成功'));
    } catch (e) {
      json(200, errorResponse(400, '无效的请求数据', e));
    }
  } catch (error) {
    json(200, errorResponse(500, '更新密钥失败', error));
  }
};

/**
 * DELETE请求处理函数 - 删除密钥
 */
export const onDelete: RequestHandler = async ({ env, params, json }) => {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的密钥ID格式'));
      return;
    }

    const db = getDB(env);

    // 检查密钥是否存在
    const exists = await db.select().from(secrets).where(eq(secrets.id, id));
    if (exists.length === 0) {
      json(200, errorResponse(404, '密钥不存在'));
      return;
    }

    // 删除密钥
    await db.delete(secrets).where(eq(secrets.id, id));
    json(200, successResponse(null, '删除密钥成功'));
  } catch (error) {
    json(200, errorResponse(500, '删除密钥失败', error));
  }
};
