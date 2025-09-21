import {
  $,
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import MD5 from 'crypto-js/md5';
import { getAuth } from '~/services/api/authentication';
import { tokenManager } from '~/utils/token';
import { DEFAULT_STORE, type BaseStore } from './base';

type AuthStore = BaseStore<boolean>;

export const DEFAULT_AUTH: AuthStore = {
  ...DEFAULT_STORE,
  detail: false,
};

export const AuthContext = createContextId<AuthStore>('auth-store');

const authenticateWithKey$ = $(async (key: string, store: AuthStore) => {
  store.loading.detail = true;
  try {
    const { data } = await getAuth({
      headers: {
        'x-api-key': key,
      },
    });
    if (data.data?.authorized) {
      tokenManager.setToken(key);
      store.detail = true;
    }
  } catch (error) {
    tokenManager.clearToken();
    store.detail = false;
    throw error;
  } finally {
    store.loading.detail = false;
  }
});

export const useProvideAuth = (initialState?: Partial<AuthStore>) => {
  const store = useStore<AuthStore>({
    ...DEFAULT_AUTH,
    ...initialState,
  });
  useContextProvider(AuthContext, store);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const key = tokenManager.getToken();
    if (key) {
      await authenticateWithKey$(key, store);
    }
  });
  return store;
};

// Hook to consume the Auth store and associated actions
export const useAuth = () => {
  const authStore = useContext(AuthContext);

  const login = $(async (key: string) => {
    if (authStore.loading.detail) return;
    await authenticateWithKey$(MD5(key).toString(), authStore);
  });

  const logout = $(() => {
    tokenManager.clearToken();
    authStore.detail = false;
  });

  return {
    authStore,
    login,
    logout,
  };
};
