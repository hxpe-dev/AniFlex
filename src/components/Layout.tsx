// src/components/Layout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import './Layout.css'; // for theme-selector styling

const Layout: React.FC = () => {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-neon', 'theme-default');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <>
      <div className="theme-selector">
        <label htmlFor="theme-select">Theme:</label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="dark">Dark</option>
          <option value="neon">Neon</option>
        </select>
      </div>
      <Outlet />
    </>
  );
};

export default Layout;
