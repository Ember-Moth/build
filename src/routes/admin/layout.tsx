import type { QRL } from '@builder.io/qwik';
import { $, component$, Slot, useSignal } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { setError, useForm, valiForm$, type SubmitHandler } from '@modular-forms/qwik';
import {
  LuBriefcase,
  LuFileText,
  LuKey,
  LuLayoutDashboard,
  LuMenu,
  LuX,
} from '@qwikest/icons/lucide';
import { minLength, object, pipe, string, type InferOutput } from 'valibot';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { useAuth, useProvideAuth } from '~/stores/auth';

const Schema = object({
  apiKey: pipe(string(), minLength(1, 'API Key 不能为空')),
});

type FormType = InferOutput<typeof Schema>;

// 定义导航菜单项类型
interface NavItem {
  href: string;
  label: string;
  icon: any;
}

export default component$(() => {
  useProvideAuth();
  const { authStore, login, logout } = useAuth();
  const location = useLocation();
  // 控制移动端侧边栏的展开状态
  const isSidebarOpen = useSignal(false);

  const [authForm, { Form, Field }] = useForm<FormType>({
    loader: { value: { apiKey: '' } },
    validate: valiForm$(Schema),
  });

  const handleSubmit: QRL<SubmitHandler<FormType>> = $(async (values) => {
    try {
      await login(values.apiKey);
    } catch (error) {
      setError(authForm, 'apiKey', 'API Key 无效或验证失败');
    }
  });

  // 切换侧边栏
  const toggleSidebar = $(() => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });

  // 关闭侧边栏
  const closeSidebar = $(() => {
    isSidebarOpen.value = false;
  });

  // 菜单项配置
  const navItems: NavItem[] = [
    {
      href: '/admin',
      label: '仪表盘',
      icon: LuLayoutDashboard,
    },
    {
      href: '/admin/workflow',
      label: '工作流管理',
      icon: LuFileText,
    },
    {
      href: '/admin/project',
      label: '项目管理',
      icon: LuFileText,
    },
    {
      href: '/admin/secret',
      label: '密钥管理',
      icon: LuKey,
    },
  ];

  // 检查菜单项是否处于活动状态
  const isActive = (href: string) => {
    const currentPath = location.url.pathname.endsWith('/')
      ? location.url.pathname.slice(0, -1)
      : location.url.pathname;

    const menuPath = href.endsWith('/') ? href.slice(0, -1) : href;

    if (menuPath === '/admin') {
      return currentPath === '/admin' || currentPath === '';
    }

    return currentPath.startsWith(menuPath);
  };

  if (!authStore.detail) {
    return (
      <div class="flex min-h-screen w-full items-center justify-center bg-background">
        <Card.Root class="w-full max-w-md">
          <Card.Header class="text-center">
            <Card.Title class="text-2xl">管理员认证</Card.Title>
            <Card.Description>请输入您的API KEY进行认证</Card.Description>
          </Card.Header>
          <Card.Content class="space-y-4">
            <Form onSubmit$={handleSubmit} class="space-y-4">
              <Field name="apiKey">
                {(field, props) => (
                  <Input
                    {...props}
                    value={field.value}
                    error={field.error}
                    placeholder="请输入API KEY"
                    required
                    disabled={authStore.loading.detail}
                  />
                )}
              </Field>
              <Button
                type="submit"
                disabled={authStore.loading.detail || !authForm.dirty}
                loading={authStore.loading.detail}
                class="w-full"
              >
                {authStore.loading.detail ? '验证中...' : '验证'}
              </Button>
            </Form>
            <p class="px-8 text-center text-sm text-muted-foreground">
              认证成功后将自动跳转到管理面板
            </p>
          </Card.Content>
        </Card.Root>
      </div>
    );
  }

  return (
    <div class="flex min-h-screen w-full overflow-hidden bg-background">
      {/* 移动端侧边栏打开时的背景遮罩 */}
      {isSidebarOpen.value && (
        <div class="fixed inset-0 bg-black/50 z-40 md:hidden" onClick$={closeSidebar}></div>
      )}

      {/* 侧边导航栏 - 响应式设计 */}
      <aside
        class={`fixed md:static left-0 top-0 z-50 h-screen flex flex-col bg-background border-r
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen.value ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                w-64`}
      >
        <div class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center gap-2">
            <LuBriefcase class="h-5 w-5" />
            <h2 class="font-semibold">管理后台</h2>
          </div>
          <Button variant="ghost" size="icon" class="md:hidden" onClick$={closeSidebar}>
            <LuX class="h-5 w-5" />
          </Button>
        </div>

        <nav class="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick$={closeSidebar} // 移动端点击导航后自动关闭侧边栏
                class={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors my-1
                  ${
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon class="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div class="p-4 border-t">
          <Button variant="outline" class="w-full" onClick$={logout}>
            退出登录
          </Button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main class="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 移动端顶栏 */}
        <header class="md:hidden flex items-center justify-between p-4 border-b">
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick$={toggleSidebar}>
              <LuMenu class="h-5 w-5" />
            </Button>
            <h2 class="font-semibold">管理后台</h2>
          </div>
        </header>

        {/* 页面内容 */}
        <div class="flex-1 overflow-y-auto p-4">
          <Slot />
        </div>
      </main>
    </div>
  );
});
