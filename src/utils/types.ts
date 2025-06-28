export type ListActivity = {
  status: string;
  progress: string;
  media: { 
    type: 'ANIME' | 'MANGA';
    id: number;
  };
  createdAt: number; // Unix timestamp (seconds)
};

export type GenreStat = {
  genre: string;
  count: number;
};

export type FavoriteAnime = {
  title: {
    english: string | null;
    romaji: string | null;
  };
  description: string;
  genres: string[];
  coverImage: {
    extraLarge: string;
  };
  bannerImage: string | null;
  siteUrl: string;
};

export type FavoriteManga = {
  title: {
    english: string | null;
    romaji: string | null;
  };
  description: string;
  genres: string[];
  coverImage: {
    extraLarge: string;
  };
  bannerImage: string | null;
  siteUrl: string;
};

export type FavoriteItem = {
  title: {
    english: string | null;
    romaji: string | null;
  };
  description: string;
  genres: string[];
  coverImage: {
    extraLarge: string;
  };
  bannerImage: string | null;
  siteUrl: string;
};

export type CarouselProps = {
  title: string;
  items: FavoriteItem[];
  uniqueClass: string;
};

export type AniListUser = {
  id: number;
  name: string;
  avatar: {
    large: string;
  };
  statistics: {
    anime: {
      count: number;
      minutesWatched: number;
      meanScore: number;
      episodesWatched: number;
      genres: GenreStat[];
    };
    manga: {
      count: number;
      meanScore: number;
      chaptersRead: number;
      volumesRead: number;
      genres: GenreStat[];
    };
  };
  favourites: {
    anime: {
      nodes: FavoriteAnime[];
    };
    manga: {
      nodes: FavoriteManga[];
    };
  };
};