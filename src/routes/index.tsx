import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';

// 在Qwik中定义元数据
export const head: DocumentHead = {
  title: 'Bygga - 项目打包构建平台',
  meta: [
    {
      name: 'description',
      content: '专业高效的项目打包构建平台',
    },
  ],
};

export default component$(() => {
  return (
    <div class="container max-w-screen-xl mx-auto px-4 py-12">
      <div class="space-y-8 text-center">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          专业高效的<span class="text-primary">项目打包构建</span>平台
        </h1>

        <p class="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Bygga提供一站式的构建服务，让您的项目部署更加轻松
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/admin"
            class="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90"
          >
            管理控制台
          </Link>
          <Link
            href="#features"
            class="px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90"
          >
            了解更多
          </Link>
        </div>
      </div>
    </div>
  );
});
