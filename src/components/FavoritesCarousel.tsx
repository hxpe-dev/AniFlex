import React, { useEffect } from 'react';
import './FavoritesCarousel.css';

type FavoriteItem = {
  title: {
    english: string | null;
  };
  coverImage: {
    extraLarge: string;
  };
};

type Props = {
  title: string;
  items: FavoriteItem[];
  uniqueClass: string;
};

const FavoritesCarousel: React.FC<Props> = ({ title, items, uniqueClass }) => {
  useEffect(() => {
    const carousel = document.querySelector<HTMLElement>(`.${uniqueClass}`);
    if (!carousel) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let lastX = 0;
    let velocity = 0;
    let momentumID: number | null = null;

    const getX = (e: MouseEvent | TouchEvent) => {
      return 'touches' in e ? e.touches[0].pageX : (e as MouseEvent).pageX;
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      carousel.classList.add('dragging');
      startX = getX(e) - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      lastX = getX(e);
      if (momentumID !== null) cancelAnimationFrame(momentumID);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      const x = getX(e) - carousel.offsetLeft;
      const walk = x - startX;
      carousel.scrollLeft = scrollLeft - walk;
      velocity = getX(e) - lastX;
      lastX = getX(e);
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      carousel.classList.remove('dragging');
      startMomentum();
    };

    const startMomentum = () => {
      const decay = 0.993;
      const step = () => {
        if (Math.abs(velocity) > 0.0001) {
          carousel.scrollLeft -= velocity;
          velocity *= decay;
          momentumID = requestAnimationFrame(step);
        }
      };
      momentumID = requestAnimationFrame(step);
    };

    // Mouse events
    carousel.addEventListener('mousedown', onDown);
    carousel.addEventListener('mousemove', onMove);
    carousel.addEventListener('mouseup', onUp);
    carousel.addEventListener('mouseleave', onUp);

    // Touch events
    carousel.addEventListener('touchstart', onDown, { passive: true });
    carousel.addEventListener('touchmove', onMove, { passive: true });
    carousel.addEventListener('touchend', onUp);

    return () => {
      carousel.removeEventListener('mousedown', onDown);
      carousel.removeEventListener('mousemove', onMove);
      carousel.removeEventListener('mouseup', onUp);
      carousel.removeEventListener('mouseleave', onUp);

      carousel.removeEventListener('touchstart', onDown);
      carousel.removeEventListener('touchmove', onMove);
      carousel.removeEventListener('touchend', onUp);

      if (momentumID !== null) cancelAnimationFrame(momentumID);
    };
  }, [items, uniqueClass]);

  return (
    <section className="favorites-carousel">
      <h2>{title}</h2>
      <div className={`carousel-container ${uniqueClass}`}>
        {items.map((item, i) => (
          <div
            key={i}
            className="carousel-card"
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left - rect.width / 2;
              const y = e.clientY - rect.top - rect.height / 2;
              const tiltX = (y / rect.height) * 19;
              const tiltY = (-x / rect.width) * 19;
              card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
            }}
          >
            <img
              src={item.coverImage.extraLarge}
              alt={item.title.english || 'Untitled'}
              className="anime-img"
            />
            <div className="title-wrapper">
              <div
                className="scrolling-title"
                data-text={item.title.english || 'Untitled'}
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
                {item.title.english || 'Untitled'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FavoritesCarousel;
