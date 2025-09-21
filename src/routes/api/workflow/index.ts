import type { RequestHandler } from '@builder.io/qwik-city';
import { and, desc, like } from 'drizzle-orm';
import { parse } from 'valibot';
import { errorResponse, paginatedResponse, successResponse } from '~/routes/api/utils/api-response';
import { getDB } from '~drizzle/client';
import { createWorkflowSchema, workflows } from '~drizzle/schema/workflows';

export const onGet: RequestHandler = async ({ env, query, json }) => {
  try {
    const db = getDB(env);

    const hasPageParams = query.has('page') || query.has('size');
    const page = hasPageParams ? Math.max(1, parseInt(query.get('page') || '1')) : null;
    const size = hasPageParams
      ? Math.max(1, Math.min(100, parseInt(query.get('size') || '10')))
      : null;
    const name = query.get('name') || '';

    const whereConditions = [];
    if (name) whereConditions.push(like(workflows.name, `%${name}%`));

    const baseQuery = db
      .select()
      .from(workflows)
      .where(and(...whereConditions))
      .orderBy(desc(workflows.created_at));

    if (page !== null && size !== null) {
      const total = await db.$count(workflows, and(...whereConditions));
      const pagedResults = await baseQuery.limit(size).offset((page - 1) * size);

      json(
        200,
        paginatedResponse(pagedResults, { page, pageSize: size, total }, '获取工作流列表成功'),
      );
    } else {
      const allResults = await baseQuery;
      json(200, successResponse(allResults, '获取工作流列表成功'));
    }
  } catch (error) {
    json(200, errorResponse(500, '获取工作流列表失败', error));
  }
};

export const onPost: RequestHandler = async ({ env, parseBody, json }) => {
  try {
    const db = getDB(env);
    const body = await parseBody();

    try {
      // 使用 valibot 验证数据
      const validatedData = parse(createWorkflowSchema, body);

      const newWorkflow = await db.insert(workflows).values(validatedData).returning();

      json(200, successResponse(newWorkflow[0], '创建工作流成功'));
    } catch (e) {
      json(200, errorResponse(400, '数据验证失败，请检查必填字段', e));
    }
  } catch (error) {
    json(200, errorResponse(500, '创建工作流失败', error));
  }
};
