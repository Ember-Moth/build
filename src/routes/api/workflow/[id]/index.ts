import { type RequestHandler } from '@builder.io/qwik-city';
import { eq } from 'drizzle-orm';
import { parse } from 'valibot';
import { errorResponse, successResponse } from '~/routes/api/utils/api-response';
import { getDB } from '~drizzle/client';
import { updateWorkflowSchema, workflows, type Workflow } from '~drizzle/schema/workflows';

/**
 * GET请求处理函数 - 获取单个工作流详情
 */
export const onGet: RequestHandler = async ({ env, params, json }) => {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的工作流ID'));
      return;
    }

    const result = await getDB(env).select().from(workflows).where(eq(workflows.id, id));

    if (result.length === 0) {
      json(200, errorResponse(404, '工作流不存在'));
      return;
    }

    json(200, successResponse(result[0], '获取工作流成功'));
  } catch (error) {
    json(200, errorResponse(500, '获取工作流失败', error));
  }
};

/**
 * PUT请求处理函数 - 更新工作流
 */
export const onPut: RequestHandler = async ({ env, params, parseBody, json }) => {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的工作流ID格式'));
      return;
    }

    const db = getDB(env);
    const exists = await db.select().from(workflows).where(eq(workflows.id, id));

    if (exists.length === 0) {
      json(200, errorResponse(404, '工作流不存在'));
      return;
    }

    const body = (await parseBody()) as Workflow;

    try {
      const validated = parse(updateWorkflowSchema, body);
      const updateData = {
        ...validated,
        updated_at: new Date().toISOString(),
      };

      const updated = await db
        .update(workflows)
        .set(updateData)
        .where(eq(workflows.id, id))
        .returning();

      json(200, successResponse(updated[0], '更新工作流成功'));
    } catch (e) {
      json(200, errorResponse(400, '无效的请求数据', e));
    }
  } catch (error) {
    json(200, errorResponse(500, '更新工作流失败', error));
  }
};

/**
 * DELETE请求处理函数 - 删除工作流
 */
export const onDelete: RequestHandler = async ({ env, params, json }) => {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的工作流ID格式'));
      return;
    }

    const db = getDB(env);
    const exists = await db.select().from(workflows).where(eq(workflows.id, id));

    if (exists.length === 0) {
      json(200, errorResponse(404, '工作流不存在'));
      return;
    }

    await db.delete(workflows).where(eq(workflows.id, id));
    json(200, successResponse(null, '删除工作流成功'));
  } catch (error) {
    json(200, errorResponse(500, '删除工作流失败', error));
  }
};
