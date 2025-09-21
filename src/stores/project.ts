import { $, createContextId, useContext, useContextProvider, useStore } from '@builder.io/qwik';
import {
  deleteProjectId,
  getProject,
  getProjectId,
  postProject,
  putProjectId,
} from '~/services/api/projects';
import { DEFAULT_STORE, type BaseStore } from './base';

export type ProjectParams = {
  name?: string;
  workflow_id?: number;
};

export type ProjectStore = BaseStore<API.Project, ProjectParams>;

export const DEFAULT_PROJECT_STORE: ProjectStore = {
  ...DEFAULT_STORE,
  params: {
    ...DEFAULT_STORE.params,
  },
};

export const ProjectContext = createContextId<ProjectStore>('project-store');

export const useProvideProject = (initialState?: Partial<ProjectStore>) => {
  const store = useStore<ProjectStore>({
    ...DEFAULT_PROJECT_STORE,
    ...initialState,
  });

  useContextProvider(ProjectContext, store);

  return store;
};

export const useProject = () => {
  const projectStore = useContext(ProjectContext);

  const getProjects = $(async () => {
    if (projectStore.loading.list) return;

    projectStore.loading.list = true;
    try {
      const { data } = await getProject({
        ...projectStore.params,
        page: undefined,
        size: undefined,
      });

      if (data.data) {
        projectStore.list = data.data;
      }
    } finally {
      projectStore.loading.list = false;
    }
  });

  const getProjectDetail = $(async (id: number) => {
    if (projectStore.loading.detail) return;

    projectStore.loading.detail = true;
    try {
      const { data } = await getProjectId({ id });

      if (data.data) {
        projectStore.detail = data.data;
      }
    } finally {
      projectStore.loading.detail = false;
    }
  });

  const createProject = $(
    async (projectData: API.ProjectCreateRequest) => {
      if (projectStore.loading.create) return;

      projectStore.loading.create = true;
      try {
        const { data } = await postProject(projectData);

        if (data.data) {
          projectStore.list = [data.data, ...projectStore.list];
          return data.data;
        }
      } finally {
        projectStore.loading.create = false;
      }
    },
  );

  const updateProject = $(
    async (
      id: number,
      projectData: API.ProjectCreateRequest,
    ) => {
      if (projectStore.loading.update) return;

      projectStore.loading.update = true;
      try {
        await putProjectId({ id }, projectData);
        return true;
      } finally {
        projectStore.loading.update = false;
      }
    },
  );

  const deleteProject = $(async (id: number) => {
    if (projectStore.loading.delete) return;

    projectStore.loading.delete = true;
    try {
      await deleteProjectId({ id });
      return true;
    } finally {
      projectStore.loading.delete = false;
    }
  });

  const setParams = $(async (params: Partial<ProjectParams>) => {
    projectStore.params = {
      ...projectStore.params,
      ...params,
    };

    await getProjects();
  });

  return {
    projectStore,
    getProjects,
    getProjectDetail,
    createProject,
    updateProject,
    deleteProject,
    setParams,
  };
};
