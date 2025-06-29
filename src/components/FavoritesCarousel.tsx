import React, { useEffect, useState  } from 'react';
import './FavoritesCarousel.css';
import type { CarouselProps, FavoriteItem } from '../utils/types';
import FavoriteModal from './FavoriteModal';

const FavoritesCarousel: React.FC<CarouselProps> = ({ title, items, uniqueClass }) => {

  const [selectedItem, setSelectedItem] = useState<FavoriteItem | null>(null);

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
      const decay = 0.99;
      const step = () => {
        if (Math.abs(velocity) > 0.0008) {
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

  let wasDragged = false;

  return (
    <section className="favorites-carousel">
      <a className='carousel-title'>
        {title}
      </a>
      <div className={`carousel-container ${uniqueClass}`}>
        {items.map((item, i) => (
          <div
            key={i}
            className="carousel-card"
            onMouseDown={() => wasDragged = false}
            onClick={() => {
              if (!wasDragged) {
                setSelectedItem(item);
              }
            }}
            onMouseMove={(e) => {
              wasDragged = true
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
              alt={item.title.english || item.title.romaji || 'Untitled'}
              className="anime-img"
            />
            <div className="title-wrapper">
              <div
                className="scrolling-title"
                data-text={item.title.english || item.title.romaji || 'Untitled'}
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
                {item.title.english || item.title.romaji || 'Untitled'}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedItem && (
        <FavoriteModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </section>
  );
};

export default FavoritesCarousel;
