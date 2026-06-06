import React from 'react';
import { LayoutDashboard, CheckSquare, BarChart3, BookOpen, Sparkles } from 'lucide-react';
import type { TabName } from '../types';

interface NavigationProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  // Normalize wellness tabs under 'insights' and 'exercises'
  const isWellnessActive = activeTab === 'insights' || activeTab === 'exercises';

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onTabChange('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'checkin' ? 'active' : ''}`}
        onClick={() => onTabChange('checkin')}
      >
        <CheckSquare size={20} />
        <span>Check-In</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onTabChange('analytics')}
      >
        <BarChart3 size={20} />
        <span>Trends</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'journal' ? 'active' : ''}`}
        onClick={() => onTabChange('journal')}
      >
        <BookOpen size={20} />
        <span>Journal</span>
      </button>

      <button
        className={`nav-item ${isWellnessActive ? 'active' : ''}`}
        onClick={() => onTabChange('insights')}
      >
        <Sparkles size={20} />
        <span>Wellness</span>
      </button>
    </nav>
  );
};

export default Navigation;
