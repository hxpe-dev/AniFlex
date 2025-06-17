export function getAnimeWatchPercentile(count: number) {
  if (count >= 1000) return 'Top 1% Anime Watcher';
  if (count >= 700) return 'Top 5% Anime Watcher';
  if (count >= 500) return 'Top 10% Anime Watcher';
  if (count >= 300) return 'Top 25% Anime Watcher';
  if (count >= 150) return 'Top 50% Anime Watcher';
  return null;
}

export function getMangaReadPercentile(count: number) {
  if (count >= 1000) return 'Top 1% Manga Reader';
  if (count >= 700) return 'Top 5% Manga Reader';
  if (count >= 500) return 'Top 10% Manga Reader';
  if (count >= 300) return 'Top 25% Manga Reader';
  if (count >= 150) return 'Top 50% Manga Reader';
  return null;
}