import type { Flags } from '@/entrypoint/utils/targets';
import type { Stream } from '@/providers/streams';
import type { EmbedScrapeContext, MovieScrapeContext, ShowScrapeContext } from '@/utils/context';

export type MediaScraperTypes = 'show' | 'movie';

export interface SourcererEmbed {
  embedId: string;
  url: string;
}

export interface SourcererOutput {
  embeds: SourcererEmbed[];
  stream?: Stream[];
}

export interface SourcererOptions {
  id: string;
  name: string; // displayed in the UI
  rank: number; // the higher the number, the earlier it gets put on the queue
  disabled?: boolean;
  flags: Flags[];
  scrapeMovie?: (input: MovieScrapeContext) => Promise<SourcererOutput>;
  scrapeShow?: (input: ShowScrapeContext) => Promise<SourcererOutput>;
}

export type Sourcerer = SourcererOptions & {
  type: 'source';
  disabled: boolean;
  mediaTypes: MediaScraperTypes[];
};

export function makeSourcerer(state: SourcererOptions): Sourcerer {
  const mediaTypes: MediaScraperTypes[] = [];
  if (state.scrapeMovie) mediaTypes.push('movie');
  if (state.scrapeShow) mediaTypes.push('show');
  return {
    ...state,
    type: 'source',
    disabled: state.disabled ?? false,
    mediaTypes,
  };
}

export interface EmbedOutput {
  stream: Stream[];
}

export interface EmbedOptions {
  id: string;
  name: string; // displayed in the UI
  rank: number; // the higher the number, the earlier it gets put on the queue
  disabled?: boolean;
  scrape: (input: EmbedScrapeContext) => Promise<EmbedOutput>;
}

export type Embed = EmbedOptions & {
  type: 'embed';
  disabled: boolean;
  mediaTypes: undefined;
};

export function makeEmbed(state: EmbedOptions): Embed {
  return {
    ...state,
    type: 'embed',
    disabled: state.disabled ?? false,
    mediaTypes: undefined,
  };
}
