import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAniListUser } from '../utils/anilist';
import './UserStats.css';
import { getAnimeWatchPercentile } from '../utils/watchPercentile';

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
  };
  favourites: {
    anime: {
      nodes: FavoriteAnime[];
    };
  };
};

const UserStats: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<AniListUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const favorites = userData?.favourites?.anime?.nodes?.filter(a => a.title.english) ?? [];

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

  useEffect(() => {
    if (!favorites.length) return;

    const carousel = document.querySelector<HTMLElement>('.carousel-container');
    if (!carousel) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    // Track velocity
    let lastX = 0;
    let velocity = 0;
    let momentumID: number | null = null;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      carousel.classList.add('dragging');
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      lastX = e.pageX;
      velocity = 0;

      if (momentumID !== null) {
        cancelAnimationFrame(momentumID);
        momentumID = null;
      }
    };

    const onMouseLeave = () => {
      if (isDown) {
        isDown = false;
        carousel.classList.remove('dragging');
        startMomentum();
      }
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        carousel.classList.remove('dragging');
        startMomentum();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1; // scroll speed multiplier (1 default)
      carousel.scrollLeft = scrollLeft - walk;

      // Calculate velocity
      velocity = e.pageX - lastX;
      lastX = e.pageX;
    };

    const startMomentum = () => {
      const decay = 0.993; // friction
      const minVelocity = 0.0000001;

      const step = () => {
        if (Math.abs(velocity) > minVelocity) {
          carousel.scrollLeft -= velocity;
          velocity *= decay;
          momentumID = requestAnimationFrame(step);
        } else {
          momentumID = null;
        }
      };
      momentumID = requestAnimationFrame(step);
    };

    carousel.addEventListener('mousedown', onMouseDown);
    carousel.addEventListener('mouseleave', onMouseLeave);
    carousel.addEventListener('mouseup', onMouseUp);
    carousel.addEventListener('mousemove', onMouseMove);

    return () => {
      carousel.removeEventListener('mousedown', onMouseDown);
      carousel.removeEventListener('mouseleave', onMouseLeave);
      carousel.removeEventListener('mouseup', onMouseUp);
      carousel.removeEventListener('mousemove', onMouseMove);

      if (momentumID !== null) cancelAnimationFrame(momentumID);
    };
  }, [favorites]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !userData) return <div className="error">Error: {error || 'User not found'}</div>;

  const stats = userData.statistics?.anime;

  return (
    <div className="user-stats-page">
      <header className="user-header">
        <img src={userData.avatar.large} alt={userData.name} className="avatar" />
        <div className="username-wrapper">
          <h1 className="username">{userData.name}</h1>
          <span className="user-percentile">
            {getAnimeWatchPercentile(stats?.count ?? 0)}
          </span>
        </div>
      </header>

      <section className="stats-cards">
        <div className="stat-card">
          <p>Total Anime Watched</p>
          <strong>{stats?.count ?? 0}</strong>
        </div>
        <div className="stat-card">
          <p>Episodes Watched</p>
          <strong>{stats?.episodesWatched ?? 0}</strong>
        </div>
        <div className="stat-card">
          <p>Minutes Watched</p>
          <strong>{stats?.minutesWatched ?? 0}</strong>
        </div>
        <div className="stat-card">
          <p>Mean Score</p>
          <strong>{stats?.meanScore ?? 0}</strong>
        </div>
      </section>

      <section className="favorites-carousel">
        <h2>Favorite Anime</h2>
        <div className="carousel-container">
          {favorites.map((anime, i) => (
            <div
              key={i}
              className="carousel-card"
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const tiltX = (y / rect.height) * 18;
                const tiltY = (-x / rect.width) * 18;
                card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1)`;
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
              }}
            >
              <img
                src={anime.coverImage.extraLarge}
                alt={anime.title.english || 'Anime'}
                className="anime-img"
              />
              <div className="title-wrapper">
                <div
                  className="scrolling-title"
                  data-text={anime.title.english || 'Untitled'}
                  ref={(el) => {
                    if (!el) return;
                    const wrapper = el.parentElement;
                    if (
                      wrapper &&
                      el.scrollWidth > wrapper.clientWidth &&
                      !el.classList.contains('scrollable')
                    ) {
                      el.classList.add('scrollable');
                    }
                  }}
                >
                  {anime.title.english || 'Untitled'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserStats;
