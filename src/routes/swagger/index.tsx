import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div class="rapidoc-page">
      <rapi-doc
        spec-url="/swagger.json"
        render-style="focused"
        layout="row"
        show-header="false"
        nav-item-spacing="compact"
        schema-style="column"
        schema-expand-level="1"
        default-schema-tab="example"
        response-area-height="400px"
        show-method-in-nav-bar="as-colored-text"
        allow-server-selection="true"
        allow-authentication="true"
        show-info="true"
        show-components="true"
        show-sidebar="false"
        regular-font="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        mono-font="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        font-size="14px"
      ></rapi-doc>
      <script
        dangerouslySetInnerHTML={`
          // 动态加载 RapiDoc
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/rapidoc/dist/rapidoc-min.js';
          script.type = 'module';
          document.head.appendChild(script);
        `}
      />
      <style
        dangerouslySetInnerHTML={`
        .rapidoc-page {
          padding: 0;
          margin: 0;
          height: 100vh;
          overflow: hidden;
        }
        rapi-doc {
          height: 100vh;
        }
      `}
      />
    </div>
  );
});
