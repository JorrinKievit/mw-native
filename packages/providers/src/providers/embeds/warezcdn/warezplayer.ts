import { makeEmbed } from '@/providers/base';
import { warezcdnApiBase, warezcdnPlayerBase } from '@/providers/sources/warezcdn/common';

export const warezPlayerScraper = makeEmbed({
  id: 'warezplayer',
  name: 'warezPLAYER',
  rank: 85,
  async scrape(ctx) {
    const page = await ctx.proxiedFetcher.full<string>(`/player.php`, {
      baseUrl: warezcdnPlayerBase,
      headers: {
        Referer: `${warezcdnApiBase}/getEmbed.php?${new URLSearchParams({
          id: ctx.url,
          sv: 'warezcdn',
        })}`,
      },
      query: {
        id: ctx.url,
      },
    });
    // ex url: https://basseqwevewcewcewecwcw.xyz/video/0e4a2c65bdaddd66a53422d93daebe68
    const playerPageUrl = new URL(page.finalUrl);

    const hash = playerPageUrl.pathname.split('/')[2];
    const playerApiRes = await ctx.proxiedFetcher('/player/index.php', {
      baseUrl: playerPageUrl.origin,
      query: {
        data: hash,
        do: 'getVideo',
      },
      method: 'POST',
      body: new URLSearchParams({
        hash,
      }),
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    const sources = JSON.parse(playerApiRes); // json isn't parsed by fetcher due to content-type being text/html.
    if (!sources.videoSource) throw new Error('Playlist not found');

    return {
      stream: [
        {
          id: 'primary',
          type: 'hls',
          flags: [],
          captions: [],
          playlist: sources.videoSource,
          headers: {
            // without this it returns "security error"
            Accept: '*/*',
          },
        },
      ],
    };
  },
});
