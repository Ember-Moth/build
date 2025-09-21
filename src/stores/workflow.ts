import { $, createContextId, useContext, useContextProvider, useStore } from '@builder.io/qwik';
import {
  deleteWorkflowId,
  getWorkflow,
  getWorkflowId,
  postWorkflow,
  putWorkflowId,
} from '~/services/api/workflows';
import { DEFAULT_STORE, type BaseStore } from './base';

export type WorkflowParams = Pick<API.getWorkflowParams, 'name'> & {
  repo_owner?: string;
  repo_name?: string;
};

export type WorkflowStore = BaseStore<API.Workflow, WorkflowParams>;

export const DEFAULT_WORKFLOW_STORE: WorkflowStore = {
  ...DEFAULT_STORE,
  params: {
    ...DEFAULT_STORE.params,
  },
};

export const WorkflowContext = createContextId<WorkflowStore>('workflow-store');

export const useProvideWorkflow = (initialState?: Partial<WorkflowStore>) => {
  const store = useStore<WorkflowStore>({
    ...DEFAULT_WORKFLOW_STORE,
    ...initialState,
  });

  useContextProvider(WorkflowContext, store);

  return store;
};

export const useWorkflow = () => {
  const workflowStore = useContext(WorkflowContext);

  const getWorkflows = $(async () => {
    if (workflowStore.loading.list) return;
    workflowStore.loading.list = true;
    try {
      const { data } = await getWorkflow({
        ...workflowStore.params,
        page: undefined,
        size: undefined,
      });
      workflowStore.list = data.data || [];
    } finally {
      workflowStore.loading.list = false;
    }
    console.log('getWorkflows', workflowStore);
  });

  const getWorkflowDetail = $(async (id: number) => {
    if (workflowStore.loading.detail) return;

    workflowStore.loading.detail = true;
    try {
      const { data } = await getWorkflowId({ id });

      if (data.data) {
        workflowStore.detail = data.data;
      }
    } finally {
      workflowStore.loading.detail = false;
    }
  });

  const createWorkflow = $(async (workflowData: Omit<API.Workflow, 'id'>) => {
    if (workflowStore.loading.create) return;

    workflowStore.loading.create = true;
    try {
      const { data } = await postWorkflow(workflowData);

      if (data.data) {
        workflowStore.list = [data.data, ...workflowStore.list];
        return data.data;
      }
    } finally {
      workflowStore.loading.create = false;
    }
  });

  const updateWorkflow = $(async (id: number, workflowData: Partial<Omit<API.Workflow, 'id'>>) => {
    if (workflowStore.loading.update) return;

    workflowStore.loading.update = true;
    try {
      await putWorkflowId({ id }, workflowData);
      return true;
    } finally {
      workflowStore.loading.update = false;
    }
  });

  const deleteWorkflow = $(async (id: number) => {
    if (workflowStore.loading.delete) return;

    workflowStore.loading.delete = true;
    try {
      await deleteWorkflowId({ id });
      return true;
    } finally {
      workflowStore.loading.delete = false;
    }
  });

  const setParams = $(async (params: Partial<WorkflowParams>) => {
    workflowStore.params = {
      ...workflowStore.params,
      ...params,
    };

    await getWorkflows();
  });

  return {
    workflowStore,
    getWorkflows,
    getWorkflowDetail,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    setParams,
  };
};
