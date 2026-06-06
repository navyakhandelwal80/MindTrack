import React from 'react';
import { Sun, Moon } from 'lucide-react';
import type { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  theme,
  onToggleTheme,
  onOpenProfile,
}) => {
  // Extract initials for the avatar button
  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="app-header">
      <div className="app-logo">
        <svg viewBox="0 0 100 100">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#logoGrad)" />
          <path d="M50 78 C50 78 20 52 20 36 C20 24 30 16 40 16 C45 16 48 19 50 21 C52 19 55 16 60 16 C70 16 80 24 80 36 C80 52 50 78 50 78 Z" fill="white" opacity="0.2" />
          <path d="M30 50 H42 L45 35 L49 65 L53 43 L56 55 L58 48 H70" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>MindTrack</span>
      </div>

      <div className="header-actions">
        <button 
          className="theme-toggle-btn" 
          onClick={onToggleTheme} 
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button 
          className="profile-settings-btn" 
          onClick={onOpenProfile}
          title="Open Settings"
          aria-label="Profile Settings"
        >
          {getInitials(profile.name)}
        </button>
      </div>
    </header>
  );
};

export default Header;
