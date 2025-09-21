import { type RequestHandler } from '@builder.io/qwik-city';
import { and, desc, eq, like } from 'drizzle-orm';
import { parse } from 'valibot';
import { errorResponse, paginatedResponse, successResponse } from '~/routes/api/utils/api-response';
import { getDB } from '~drizzle/client';
import type { CreateSecret } from '~drizzle/schema/secrets';
import { createSecretSchema, secrets } from '~drizzle/schema/secrets';
import { generateRandomSecret } from '../utils/crypto';

/**
 * GET请求处理函数 - 获取密钥列表
 * 支持分页查询和按名称过滤
 */
export const onGet: RequestHandler = async ({ env, query, json }) => {
  try {
    const db = getDB(env);

    // 解析分页参数
    const hasPageParams = query.has('page') || query.has('size');
    const page = hasPageParams ? Math.max(1, parseInt(query.get('page') || '1')) : null;
    const size = hasPageParams
      ? Math.max(1, Math.min(100, parseInt(query.get('size') || '10')))
      : null;

    // 解析过滤参数
    const name = query.get('name') || '';
    const projectId = query.get('project_id') ? parseInt(query.get('project_id')!) : undefined;

    // 构建查询条件
    const whereConditions = [];
    if (name) whereConditions.push(like(secrets.name, `%${name}%`));
    if (projectId) whereConditions.push(eq(secrets.project_id, projectId));

    // 基本查询
    const baseQuery = db
      .select()
      .from(secrets)
      .where(and(...whereConditions))
      .orderBy(desc(secrets.created_at));

    // 处理分页或返回全部结果
    if (page !== null && size !== null) {
      const total = await db.$count(secrets, and(...whereConditions));
      const pagedResults = await baseQuery.limit(size).offset((page - 1) * size);

      json(
        200,
        paginatedResponse(pagedResults, { page, pageSize: size, total }, '获取密钥列表成功'),
      );
    } else {
      const allResults = await baseQuery;
      json(200, successResponse(allResults, '获取密钥列表成功'));
    }
  } catch (error) {
    json(200, errorResponse(500, '获取密钥列表失败', error));
  }
};

/**
 * POST请求处理函数 - 创建新密钥
 */
export const onPost: RequestHandler = async ({ env, parseBody, json }) => {
  try {
    const db = getDB(env);
    const body = (await parseBody()) as CreateSecret;

    try {
      // 处理必要的字段和默认值
      const processedBody = {
        ...body,
        name: body.name || `secret-${Date.now()}`,
        value: body.value || generateRandomSecret(),
        expires_at: body.expires_at ? new Date(body.expires_at).toISOString() : null,
        max_calls: body.max_calls === undefined ? 0 : body.max_calls,
        current_calls: 0,
        last_used_at: null,
      };

      // 验证数据
      const validatedData = parse(createSecretSchema, processedBody);

      // 创建新密钥
      const newSecret = await db.insert(secrets).values(validatedData).returning();

      json(200, successResponse(newSecret[0], '创建密钥成功'));
    } catch (e) {
      json(200, errorResponse(400, '数据验证失败，请检查必填字段', e));
    }
  } catch (error) {
    json(200, errorResponse(500, '创建密钥失败', error));
  }
};
