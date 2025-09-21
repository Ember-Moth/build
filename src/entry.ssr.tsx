/**
 * WHAT IS THIS FILE?
 *
 * SSR entry point, in all cases the application is rendered outside the browser, this
 * entry point will be the common one.
 *
 * - Server (express, cloudflare...)
 * - npm run start
 * - npm run preview
 * - npm run build
 *
 */
import { renderToStream, type RenderToStreamOptions } from '@builder.io/qwik/server';
import { manifest } from '@qwik-client-manifest';
import Root from './root';
import { ThemeManager } from './utils/theme';

export default function (opts: RenderToStreamOptions) {
  const themeManager = new ThemeManager(opts.serverData?.requestHeaders.cookie);
  const theme = themeManager.getRealTheme();

  return renderToStream(<Root />, {
    manifest,
    ...opts,
    // Use container attributes to set attributes on the html tag.
    containerAttributes: {
      lang: 'zh-CN',
      class: theme,
      style: 'color-scheme: ' + theme,
      ...opts.containerAttributes,
    },
    serverData: {
      ...opts.serverData,
    },
  });
}
