export const mapSecondsToTime = (seconds: number): string => {
  const hours = Math.floor(seconds / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const components: string[] = [];

  if (hours > 0) {
    components.push(hours.toString().padStart(2, "0"));
  }

  components.push(minutes.toString().padStart(2, "0"));
  components.push(remainingSeconds.toString().padStart(2, "0"));

  const formattedTime = components.join(":");

  return formattedTime;
};

export const mapSeasonAndEpisodeNumberToText = (
  season: number,
  episode: number,
) => {
  return `S${season.toString().padStart(2, "0")}E${episode.toString().padStart(2, "0")}`;
};
