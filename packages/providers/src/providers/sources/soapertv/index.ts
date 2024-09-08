import { flags } from "@/entrypoint/utils/targets";
import { Caption, labelToLanguageCode } from "@/providers/captions";
import { Stream } from "@/providers/streams";
import { MovieScrapeContext, ShowScrapeContext } from "@/utils/context";
import { NotFoundError } from "@/utils/errors";
import { load } from "cheerio";

import { makeSourcerer, SourcererOutput } from "../../base";
import { InfoResponse } from "./types";

const baseUrl = "https://soaper.tv";

const universalScraper = async (
  ctx: MovieScrapeContext | ShowScrapeContext,
): Promise<SourcererOutput> => {
  const searchResult = await ctx.proxiedFetcher("/search.html", {
    baseUrl,
    query: {
      keyword: ctx.media.title,
    },
  });
  const searchResult$ = load(searchResult);
  let showLink = searchResult$("a")
    .filter((_, el) => searchResult$(el).text() === ctx.media.title)
    .attr("href");
  if (!showLink) throw new NotFoundError("Content not found");

  if (ctx.media.type === "show") {
    const seasonNumber = ctx.media.season.number;
    const episodeNumber = ctx.media.episode.number;
    const showPage = await ctx.proxiedFetcher(showLink, { baseUrl });
    const showPage$ = load(showPage);
    const seasonBlock = showPage$("h4")
      .filter(
        (_, el) =>
          showPage$(el).text().trim().split(":")[0].trim() ===
          `Season${seasonNumber}`,
      )
      .parent();
    const episodes = seasonBlock.find("a").toArray();
    showLink = showPage$(
      episodes.find(
        (el) =>
          parseInt(showPage$(el).text().split(".")[0], 10) === episodeNumber,
      ),
    ).attr("href");
  }
  if (!showLink) throw new NotFoundError("Content not found");
  const contentPage = await ctx.proxiedFetcher(showLink, { baseUrl });
  const contentPage$ = load(contentPage);

  const pass = contentPage$("#hId").attr("value");

  if (!pass) throw new NotFoundError("Content not found");

  const formData = new URLSearchParams();
  formData.append("pass", pass);
  formData.append("e2", "0");
  formData.append("server", "0");

  const infoEndpoint =
    ctx.media.type === "show"
      ? "/home/index/getEInfoAjax"
      : "/home/index/getMInfoAjax";
  const streamRes = await ctx.proxiedFetcher<string>(infoEndpoint, {
    baseUrl,
    method: "POST",
    body: formData,
    headers: {
      referer: `${baseUrl}${showLink}`,
    },
  });

  const streamResJson: InfoResponse = JSON.parse(streamRes);

  const captions: Caption[] = [];
  for (const sub of streamResJson.subs) {
    // Some subtitles are named <Language>.srt, some are named <LanguageCode>:hi, or just <LanguageCode>
    let language: string | null = "";
    if (sub.name.includes(".srt")) {
      language = labelToLanguageCode(sub.name.split(".srt")[0]);
    } else if (sub.name.includes(":")) {
      language = sub.name.split(":")[0];
    } else {
      language = sub.name;
    }
    if (!language) continue;

    captions.push({
      id: sub.path,
      url: `${streamResJson.vtt}${sub.path}`,
      type: "srt",
      hasCorsRestrictions: false,
      language,
    });
  }

  return {
    embeds: [],
    stream: [
      {
        id: "primary",
        playlist: `${baseUrl}${streamResJson.val}`,
        type: "hls",
        flags: [flags.IP_LOCKED],
        captions,
        headers: {
          Referer: `${baseUrl}${showLink}`,
          Origin: baseUrl,
        },
      },
      ...(streamResJson.val_bak
        ? [
            {
              id: "backup",
              playlist: `${baseUrl}${streamResJson.val_bak}`,
              type: "hls",
              flags: [flags.IP_LOCKED],
              captions,
              headers: {
                Referer: `${baseUrl}${showLink}`,
                Origin: baseUrl,
              },
            } as Stream,
          ]
        : []),
    ],
  };
};

export const soaperTvScraper = makeSourcerer({
  id: "soapertv",
  name: "SoaperTV",
  rank: 126,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: universalScraper,
  scrapeShow: universalScraper,
});
