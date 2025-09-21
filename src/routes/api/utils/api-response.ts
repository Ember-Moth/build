// API 响应类型命名空间
export namespace API {
  export interface Response<T> {
    code: number;
    message: string;
    data: T | null;
    error?: string;
  }

  export interface PaginatedData<T> {
    list: T[];
    page: number;
    pageSize: number;
    total: number;
  }
}

export function successResponse<T>(data: T, message = 'success'): API.Response<T> {
  return {
    code: 0,
    message,
    data,
  };
}

export function errorResponse(
  statusCode: number,
  message: string,
  error?: any,
): API.Response<null> {
  return {
    code: statusCode,
    message,
    data: null,
    error: error instanceof Error ? error.message : String(error),
  };
}

// 标准分页数据响应
export function paginatedResponse<T>(
  data: T[],
  pagination: { page: number; pageSize: number; total: number },
  message = 'success',
) {
  return successResponse(
    {
      list: data,
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
    } as API.PaginatedData<T>,
    message,
  );
}

export const filterSensitiveData = (project: any, isApiKeyValid: boolean) => {
  const filteredProject = { ...project };

  if (!isApiKeyValid) {
    delete filteredProject.repo_owner;
    delete filteredProject.repo_name;
    delete filteredProject.branch;
    delete filteredProject.workflow_id;
    delete filteredProject.payment_config;
  }

  return filteredProject;
};
