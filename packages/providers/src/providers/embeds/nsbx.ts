import { EmbedOutput, makeEmbed } from "@/providers/base";
import { NotFoundError } from "@/utils/errors";

const providers = [
  {
    id: "delta",
    rank: 699,
  },
  {
    id: "alpha",
    rank: 695,
  },
];

function embed(provider: { id: string; rank: number }) {
  return makeEmbed({
    id: provider.id,
    name: provider.id.charAt(0).toUpperCase() + provider.id.slice(1),
    rank: provider.rank,
    disabled: false,
    async scrape(ctx) {
      const [query] = ctx.url.split("|");
      const baseUrl = "https://api.nsbx.ru";

      const search = await ctx.fetcher.full("/search", {
        query: {
          query,
          provider: provider.id,
        },
        credentials: "include",
        baseUrl,
        headers: {
          "X-Auth":
            "KPgqlFaKGJTuve4uPEBxu3ssMTcPNL1443zD0T4a7TXQJaxDNt3pJSE4xgdYV8FdQOJ1nbfv6DwcNXltDLW9hmc5QlCEiPxkv5xQXgV69TMWZFvXqz94mwDSbhbr7xa3",
          origin: "https://pseudo-flix.pro/",
        },
      });

      if (search.statusCode === 429) throw new Error("Rate limited");
      if (search.statusCode !== 200)
        throw new NotFoundError("Failed to search");

      ctx.progress(50);

      const result = await ctx.fetcher("/provider", {
        query: {
          resourceId: search.body.url,
          provider: provider.id,
        },
        credentials: "include",
        baseUrl,
        headers: {
          "X-Auth":
            "KPgqlFaKGJTuve4uPEBxu3ssMTcPNL1443zD0T4a7TXQJaxDNt3pJSE4xgdYV8FdQOJ1nbfv6DwcNXltDLW9hmc5QlCEiPxkv5xQXgV69TMWZFvXqz94mwDSbhbr7xa3",
          origin: "https://pseudo-flix.pro/",
        },
      });

      ctx.progress(100);

      return result as EmbedOutput;
    },
  });
}

export const [deltaScraper, alphaScraper] = providers.map(embed);
