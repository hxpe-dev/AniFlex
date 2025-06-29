import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAniListUser, fetchAniListUserAnimeActivities, fetchAniListUserMangaActivities, withTimeout } from '../utils/anilist';
import './UserStats.css';
import { getAnimeWatchPercentile, getMangaReadPercentile } from '../utils/badges';
import FavoritesCarousel from '../components/FavoritesCarousel';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import type { AniListUser, ListActivity } from '../utils/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingScreen from '../components/LoadingScreen';


const UserStats: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<AniListUser | null>(null);
  const [activities, setActivities] = useState<ListActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'anime' | 'manga' | 'stats'>('anime');

  const handleTabChange = (tab: 'anime' | 'manga' | 'stats') => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;

      try {
        const user = await withTimeout(fetchAniListUser(username), 5000);
        if (!user) {
          setError('Failed to fetch user data. Ensure that the profile exists and is public.');
          setLoading(false);
          return;
        }
        setUserData(user);
        await wait(1000);

        const animeActivities = await withTimeout(fetchAniListUserAnimeActivities(user.id), 5000);
        if (!animeActivities) {
          setError('Failed to fetch anime activities.');
          setLoading(false);
          return;
        }
        await wait(1000);

        const mangaActivities = await withTimeout(fetchAniListUserMangaActivities(user.id), 5000);
        if (!mangaActivities) {
          setError('Failed to fetch manga activities.');
          setLoading(false);
          return;
        }
        await wait(1000);

        // Combine both activity arrays
        const combinedActivities = [...animeActivities, ...mangaActivities];
        setActivities(combinedActivities);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchData();
  }, [username]);

  if (loading || error || !userData) return <LoadingScreen message={error || undefined} />;
  // if (error || !userData) return <div className="error">Error: {error || 'User not found'}</div>;

  const stats = userData.statistics;

  const favoritesAnime = userData.favourites.anime.nodes?.filter(
    a => a.title.english || a.title.romaji
  ) ?? [];

  const favoritesManga = userData.favourites.manga.nodes?.filter(
    m => m.title.english || m.title.romaji
  ) ?? [];
  const topAnimeGenres = [...userData.statistics.anime.genres]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topMangaGenres = [...userData.statistics.manga.genres]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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

  const getActivityStats = (days: number) => {
    const cutoff = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const filtered = activities.filter(a => a.createdAt >= cutoff && a.status !== 'PLANNING');

    let animeEpisodes = 0;
    let mangaChapters = 0;
    const animeIds = new Set<number>();
    const mangaIds = new Set<number>();

    filtered.forEach(activity => {
      const progressCount = parseProgress(activity.progress);

      if (activity.media.type === 'ANIME') {
        if (activity.status == "completed") {
          animeEpisodes += 1;
        } else {
          animeEpisodes += progressCount;
        }
        animeIds.add(activity.media.id); // track unique anime series
      } else if (activity.media.type === 'MANGA') {
        if (activity.status == "completed") {
          mangaChapters += 1;
        } else {
          mangaChapters += progressCount;
        }
        mangaIds.add(activity.media.id); // track unique manga series
      }
    });

    return { 
      animeEpisodes, 
      mangaChapters,
      animeCount: animeIds.size,
      mangaCount: mangaIds.size
    };
  };

  const parseProgress = (progress: string | number): number => {
    if (typeof progress === 'number') {
      return 1; // Single numeric progress = 1 episode/chapter watched
    }

    if (typeof progress === 'string') {
      const trimmed = progress.trim();

      if (trimmed.includes('-')) {
        const parts = trimmed.split('-').map(part => parseInt(part.trim(), 10));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return Math.abs(parts[1] - parts[0]) + 1; // e.g. '30 - 40' => 11
        }
      }

      const single = parseInt(trimmed, 10);
      return isNaN(single) ? 0 : 1; // Single number means 1 episode/chapter
    }

    return 0;
  };

  const weeklyStats = getActivityStats(7);
  const monthlyStats = getActivityStats(30);
  const allTimeStats = {
    animeCount: stats.anime.count,
    mangaCount: stats.manga.count
  };

  const getWeeklyStats = (weekOffset: number) => {
    const now = Math.floor(Date.now() / 1000);
    const weekInSeconds = 7 * 24 * 60 * 60;
    const start = now - weekInSeconds * (weekOffset + 1);
    const end = now - weekInSeconds * weekOffset;

    const filtered = activities.filter(a => a.createdAt >= start && a.createdAt < end && a.status !== 'PLANNING');

    let animeEpisodes = 0;
    let mangaChapters = 0;

    filtered.forEach(activity => {
      const progressCount = parseProgress(activity.progress);

      if (activity.media.type === 'ANIME') {
        if (activity.status == "completed") {
          animeEpisodes += 1;
        } else {
          animeEpisodes += progressCount;
        }
      } else if (activity.media.type === 'MANGA') {
        if (activity.status == "completed") {
          mangaChapters += 1;
        } else {
          mangaChapters += progressCount;
        }
      }
    });

    return { animeEpisodes, mangaChapters };
  };

  const weekData = [
    { name: '5 Weeks Ago', ...getWeeklyStats(5) },
    { name: '4 Weeks Ago', ...getWeeklyStats(4) },
    { name: '3 Weeks Ago', ...getWeeklyStats(3) },
    { name: '2 Weeks Ago', ...getWeeklyStats(2) },
    { name: 'Last Week', ...getWeeklyStats(1) },
    { name: 'This Week', ...getWeeklyStats(0) },
  ];

  return (
    <div className="user-stats-page">
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

        <div className="tab-content-wrapper">
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
                    <p>Days Watched</p>
                    <strong>{stats?.anime.minutesWatched ? (stats?.anime.minutesWatched / 1440).toFixed(2) : 0}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Mean Score</p>
                    <strong>{stats?.anime.meanScore ?? 0}</strong>
                  </div>
                </section>

                <section className="genre-section">
                  {topAnimeGenres.map((g, i) => (
                    <div key={i} className='genre-card'>
                      {g.genre} ({g.count})
                    </div>
                  ))}
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

                <section className="genre-section">
                  {topMangaGenres.map((g, i) => (
                    <div key={i} className='genre-card'>
                      {g.genre} ({g.count})
                    </div>
                  ))}
                </section>

                <FavoritesCarousel
                  title="Favorite Manga"
                  items={favoritesManga}
                  uniqueClass="manga-carousel"
                />
              </>
            )}
          </div>

          <div className={`tab-content ${activeTab === 'stats' ? 'show' : 'hide'}`} key="stats">
            {activeTab === 'stats' && (
              <>
                <a className="stats-title">
                  Anime Stats
                </a>
                <section className="stats-cards">
                  <div className="stat-card">
                    <p>Weekly Episodes Watched</p>
                    <strong>{weeklyStats.animeEpisodes}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Weekly Anime Watched</p>
                    <strong>{weeklyStats.animeCount}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Monthly Episodes Watched</p>
                    <strong>{monthlyStats.animeEpisodes}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Monthly Anime Watched</p>
                    <strong>{monthlyStats.animeCount}</strong>
                  </div>
                  <div className="stat-card">
                    <p>All Time Anime Watched</p>
                    <strong>{allTimeStats.animeCount}</strong>
                  </div>
                </section>
                <a className="stats-title">
                  Manga Stats
                </a>
                <section className="stats-cards">
                  <div className="stat-card">
                    <p>Weekly Chapters Read</p>
                    <strong>{weeklyStats.mangaChapters}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Weekly Manga Read</p>
                    <strong>{weeklyStats.mangaCount}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Monthly Chapters Read</p>
                    <strong>{monthlyStats.mangaChapters}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Monthly Manga Read</p>
                    <strong>{monthlyStats.mangaCount}</strong>
                  </div>
                  <div className="stat-card">
                    <p>All Time Manga Read</p>
                    <strong>{allTimeStats.mangaCount}</strong>
                  </div>
                </section>
                <a className="stats-title">Activity Graph</a>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <LineChart data={weekData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="animeEpisodes" stroke="#8884d8" name="Anime Episodes" strokeWidth={2} />
                      <Line type="monotone" dataKey="mangaChapters" stroke="#82ca9d" name="Manga Chapters" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="generate-button-wrapper">
        <button className="generate-button" onClick={handleGenerateImage}>
          Generate PNG
        </button>
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
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => handleTabChange('stats')}
          >
            Stats
          </button>
        </div>
        <div
          className="tab-indicator"
          style={{ 
            transform: `translateX(${
              activeTab === 'anime' ? '0%' : 
              activeTab === 'manga' ? '100%' : '200%'
            })`,
          }}
        />
      </div>
    </div>
  );
};

export default UserStats;
