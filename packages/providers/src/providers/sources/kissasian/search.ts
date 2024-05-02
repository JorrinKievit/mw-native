import { load } from 'cheerio';
import FormData from 'form-data';

import type { ScrapeContext } from '@/utils/context';

import { kissasianBase } from './common';

export async function search(ctx: ScrapeContext, title: string, seasonNumber?: number) {
  const searchForm = new FormData();
  searchForm.append('keyword', `${title} ${seasonNumber ?? ''}`.trim());
  searchForm.append('type', 'Drama');

  const searchResults = await ctx.proxiedFetcher<string>('/Search/SearchSuggest', {
    baseUrl: kissasianBase,
    method: 'POST',
    body: searchForm,
  });

  const searchPage = load(searchResults);

  return Array.from(searchPage('a')).map((drama) => ({
      name: searchPage(drama).text(),
      url: drama.attribs.href,
    }));
}
