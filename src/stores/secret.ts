import { $, createContextId, useContext, useContextProvider, useStore } from '@builder.io/qwik';
import {
  deleteSecretId,
  getSecret,
  getSecretId,
  postSecret,
  postSecretValidate,
  putSecretId,
} from '~/services/api/secrets';
import { DEFAULT_STORE, type BaseStore } from './base';

export type SecretParams = {
  name?: string;
  project_id?: number;
};

export type SecretStore = BaseStore<API.Secret, SecretParams>;

export const DEFAULT_SECRET_STORE: SecretStore = {
  ...DEFAULT_STORE,
  params: {
    ...DEFAULT_STORE.params,
  },
};

export const SecretContext = createContextId<SecretStore>('secret-store');

export const useProvideSecret = (initialState?: Partial<SecretStore>) => {
  const store = useStore<SecretStore>({
    ...DEFAULT_SECRET_STORE,
    ...initialState,
  });

  useContextProvider(SecretContext, store);

  return store;
};

export const useSecret = () => {
  const secretStore = useContext(SecretContext);

  const getSecrets = $(async () => {
    if (secretStore.loading.list) return;

    secretStore.loading.list = true;
    try {
      const { data } = await getSecret({
        ...secretStore.params,
        page: undefined,
        size: undefined,
      });

      if (data.data) {
        secretStore.list = data.data;
      }
    } finally {
      secretStore.loading.list = false;
    }
  });

  const getSecretDetail = $(async (id: number) => {
    if (secretStore.loading.detail) return;

    secretStore.loading.detail = true;
    try {
      const { data } = await getSecretId({ id });

      if (data.data) {
        secretStore.detail = data.data;
      }
    } finally {
      secretStore.loading.detail = false;
    }
  });

  const createSecret = $(
    async (secretData: {
      name: string;
      description?: string;
      project_id: number;
      value?: string;
      expires_at?: string;
      max_calls?: number;
    }) => {
      if (secretStore.loading.create) return;

      secretStore.loading.create = true;
      try {
        const { data } = await postSecret(secretData);

        if (data.data) {
          secretStore.list = [data.data, ...secretStore.list];
          return data.data;
        }
      } finally {
        secretStore.loading.create = false;
      }
    },
  );

  const updateSecret = $(
    async (
      id: number,
      secretData: {
        name?: string;
        description?: string;
        value?: string;
        expires_at?: string;
        max_calls?: number;
      },
    ) => {
      if (secretStore.loading.update) return;

      secretStore.loading.update = true;
      try {
        await putSecretId({ id }, secretData);
        return true;
      } finally {
        secretStore.loading.update = false;
      }
    },
  );

  const deleteSecret = $(async (id: number) => {
    if (secretStore.loading.delete) return;

    secretStore.loading.delete = true;
    try {
      await deleteSecretId({ id });
      return true;
    } finally {
      secretStore.loading.delete = false;
    }
  });

  const validateSecret = $(async (secret: string, project_id: number) => {
    try {
      const { data } = await postSecretValidate({ secret, project_id });
      return data.data?.valid || false;
    } catch (error) {
      return false;
    }
  });

  const setParams = $(async (params: Partial<SecretParams>) => {
    secretStore.params = {
      ...secretStore.params,
      ...params,
    };

    await getSecrets();
  });

  return {
    secretStore,
    getSecrets,
    getSecretDetail,
    createSecret,
    updateSecret,
    deleteSecret,
    validateSecret,
    setParams,
  };
};
