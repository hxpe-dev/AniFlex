import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const defaultFacts = [
  "Did you know? One Piece has over 1000 episodes — and Luffy still can't swim.",
  "In Naruto, Kakashi read 27 volumes of 'Make-Out Paradise' and still remained single.",
  "Death Note was once banned in China — too many people writing classmates' names.",
  "Dragon Ball's Goku once fought... Hitler. Yes, really (in a fan film).",
  "Sailor Moon was originally going to be a space opera — with guns."
];

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const [dotCount, setDotCount] = useState(1);
  const [fact, setFact] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!message) {
      const randomIndex = Math.floor(Math.random() * defaultFacts.length);
      setFact(defaultFacts[randomIndex]);
    }
  }, [message]);

  return (
    <div className="loading-screen">
      <div className="loading-text">
        {message ? "Error :(" : `Loading${".".repeat(dotCount)}`}
      </div>
      <div className="loading-fact">{message || fact}</div>
    </div>
  );
};

export default LoadingScreen;
