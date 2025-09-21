import { component$, Slot } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { ThemeSwitcher } from '~/layout/theme-switcher';
import { useProvideProject } from '~/stores/project';
import { useProvideSecret } from '~/stores/secret';
import { useProvideWorkflow } from '~/stores/workflow';

export default component$(() => {
  useProvideWorkflow();
  useProvideProject();
  useProvideSecret();

  const location = useLocation();
  const currentYear = new Date().getFullYear();

  if (location.url.pathname.startsWith('/admin')) {
    return <Slot />;
  }

  return (
    <div class="flex flex-col min-h-screen">
      <header class="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div class="container max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Link href="/" class="flex items-center gap-2">
              <span class="text-primary font-bold text-2xl">Bygga</span>
              <span class="text-xs px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                Beta
              </span>
            </Link>
          </div>
          <div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main class="flex-auto">
        <Slot />
      </main>

      <footer class="border-t border-border bg-muted/40 mt-6">
        <div class="container max-w-screen-xl mx-auto px-4 py-4">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div class="flex flex-col">
              <h3 class="font-medium text-base">Bygga</h3>
              <p class="text-xs text-muted-foreground">
                专业高效的项目打包构建平台，提供一站式的构建服务。
              </p>
            </div>
            <div class="flex flex-col sm:items-end">
              <p class="text-xs text-muted-foreground">
                联系我们：
                <a href="mailto:support@bygga.app" class="text-primary hover:underline">
                  support@bygga.app
                </a>
              </p>
              <p class="text-xs text-muted-foreground">
                © {currentYear}{' '}
                <a href="https://www.bygga.app" class="hover:text-foreground">
                  bygga.app
                </a>
                . All rights reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});
