import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAniListUser } from '../utils/anilist';
import './UserStats.css';
import { getAnimeWatchPercentile, getMangaReadPercentile } from '../utils/badges';
import FavoritesCarousel from '../components/FavoritesCarousel';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

type GenreStat = {
  genre: string;
  count: number;
};

type FavoriteAnime = {
  title: {
    english: string | null;
  };
  coverImage: {
    extraLarge: string;
  };
};

type FavoriteManga = {
  title: {
    english: string | null;
  };
  coverImage: {
    extraLarge: string;
  };
};

type AniListUser = {
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

const UserStats: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<AniListUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'anime' | 'manga'>('anime');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const handleTabChange = (tab: 'anime' | 'manga') => {
    if (tab === activeTab) return;
    setSlideDirection(tab === 'anime' ? 'left' : 'right');
    setActiveTab(tab);
  };

  useEffect(() => {
    if (!username) return;
    fetchAniListUser(username)
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !userData) return <div className="error">Error: {error || 'User not found'}</div>;

  const stats = userData.statistics;

  const favoritesAnime = userData?.favourites?.anime?.nodes?.filter(a => a.title.english) ?? [];
  const favoritesManga = userData?.favourites?.manga?.nodes?.filter(m => m.title.english) ?? [];

  const percentiles = [
    getAnimeWatchPercentile(stats?.anime.count),
    getMangaReadPercentile(stats?.manga.count),
  ].filter(Boolean);

  const handleGenerateImage = () => {
    if (!statsRef.current) return;

    document.fonts.ready.then(() => {
      toPng(statsRef.current!, { cacheBust: true })
        .then((dataUrl) => {
          saveAs(dataUrl, `${userData?.name}_stats.png`);
        })
        .catch((err) => {
          console.error('Failed to generate image', err);
        });
    });
  };

  return (
    <div className="user-stats-page">
      <div className="generate-button-wrapper">
        <button className="generate-button" onClick={handleGenerateImage}>
          Generate PNG
        </button>
      </div>
      <div className="generated-container" ref={statsRef}>
        <header className="user-header">
          <img src={userData.avatar.large} alt={userData.name} className="avatar" />
          <div className="username-wrapper">
            <h1 className="username">{userData.name}</h1>
            <div className="percentile-wrapper">
              {percentiles.map((percentile, index) => (
                <span key={index} className="user-percentile">
                  {percentile}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className={`tab-content-wrapper ${slideDirection}`}>
          <div className={`tab-content ${activeTab === 'anime' ? 'show' : 'hide'}`} key="anime">
            {activeTab === 'anime' && (
              <>
                <section className="stats-cards">
                  <div className="stat-card">
                    <p>Total Anime Watched</p>
                    <strong>{stats?.anime.count ?? 0}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Episodes Watched</p>
                    <strong>{stats?.anime.episodesWatched ?? 0}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Minutes Watched</p>
                    <strong>{stats?.anime.minutesWatched ?? 0}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Mean Score</p>
                    <strong>{stats?.anime.meanScore ?? 0}</strong>
                  </div>
                </section>

                <FavoritesCarousel
                  title="Favorite Anime"
                  items={favoritesAnime}
                  uniqueClass="anime-carousel"
                />
              </>
            )}
          </div>

          <div className={`tab-content ${activeTab === 'manga' ? 'show' : 'hide'}`} key="manga">
            {activeTab === 'manga' && (
              <>
                <section className="stats-cards">
                  <div className="stat-card">
                    <p>Total Manga Read</p>
                    <strong>{stats?.manga.count ?? 0}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Chapters Read</p>
                    <strong>{stats?.manga.chaptersRead ?? 0}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Volumes Read</p>
                    <strong>{stats?.manga.volumesRead ?? 0}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Mean Score</p>
                    <strong>{stats?.manga.meanScore ?? 0}</strong>
                  </div>
                </section>

                <FavoritesCarousel
                  title="Favorite Manga"
                  items={favoritesManga}
                  uniqueClass="manga-carousel"
                />
              </>
            )}
          </div>
        </div>
        
        <div className="floating-tabs">
          <div className="tab-buttons">
            <button
              className={activeTab === 'anime' ? 'active' : ''}
              onClick={() => handleTabChange('anime')}
            >
              Anime
            </button>
            <button
              className={activeTab === 'manga' ? 'active' : ''}
              onClick={() => handleTabChange('manga')}
            >
              Manga
            </button>
          </div>
          <div
            className="tab-indicator"
            style={{ transform: `translateX(${activeTab === 'anime' ? '0%' : '100%'})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserStats;
