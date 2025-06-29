import ReactDOM from 'react-dom';
import React, { useState, useEffect, useRef } from 'react';
import type { FavoriteItem } from '../utils/types';
import './FavoriteModal.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FavoriteModalProps {
  item: FavoriteItem | null;
  onClose: () => void;
}

const FavoriteModal: React.FC<FavoriteModalProps> = ({ item, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState('0px');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setMaxHeight(isExpanded ? `${scrollHeight}px` : '4.5em');
    }
  }, [isExpanded, item?.description]); // recalculate on expand/collapse or content change

  if (!item) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="modal-image-wrapper">
          <img
            src={item.bannerImage ? item.bannerImage : item.coverImage.extraLarge}
            alt={item.title.english || item.title.romaji || 'Untitled'}
            className="modal-img"
          />
          <h2 className="modal-title-overlay">
            {item.title.english || item.title.romaji || 'Untitled'}
          </h2>
        </div>
        <div className="modal-genres">
          {item.genres.map((genre, i) => (
            <span key={i} className="genre-chip">{genre}</span>
          ))}
        </div>
        <div 
          className={`modal-description ${isExpanded ? 'expanded' : 'collapsed'}`}
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? 'Click to collapse' : 'Click to expand'}
          style={{ maxHeight }}
        >
          <div
            className="description-content"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        </div>
        {item.description.length > 0 && (
          <button
            className={`expand-chevron ${isExpanded ? 'with-margin' : ''}`}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
        <a href={item.siteUrl} target="_blank" rel="noopener noreferrer" className="modal-link">
          View on AniList
        </a>
      </div>
    </div>,
    document.body // This renders the modal outside layout containers
  );
};

export default FavoriteModal;
