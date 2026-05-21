import { useRequestEvent } from '#imports';
import { fetchTrpcQuery } from '../server/utils/trpc';
import { buildFaviconLinks, resolveServerFaviconHref } from '../server/utils/favicon';
import type { RouterOutput } from '../types/trpc';

type LogoOutput = RouterOutput['logo']['getActiveLogo'];

export default defineNuxtPlugin(async () => {
  const event = useRequestEvent();
  const defaultFavicon = '/favicon.ico';

  if (!event) {
    useHead({
      link: buildFaviconLinks(defaultFavicon),
    });
    return;
  }

  try {
    const logo = await fetchTrpcQuery<LogoOutput>(event, 'logo.getActiveLogo', { type: 'favicon' });

    useHead({
      link: buildFaviconLinks(resolveServerFaviconHref(logo, defaultFavicon)),
    });
  } catch {
    useHead({
      link: buildFaviconLinks(defaultFavicon),
    });
  }
});
