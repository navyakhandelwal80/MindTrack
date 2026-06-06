import { useState } from 'react';
import { Sparkles, Activity } from 'lucide-react';
import type { TabName } from './types';

// Custom Hooks
import useTheme from './hooks/useTheme';
import useWellnessData from './hooks/useWellnessData';

// Component imports
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CheckInForm from './components/CheckInForm';
import Analytics from './components/Analytics';
import Journal from './components/Journal';
import Insights from './components/Insights';
import Exercises from './components/Exercises';
import ErrorBoundary from './components/ErrorBoundary';
import ProfileModal from './components/ProfileModal';

function App() {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [wellnessSubTab, setWellnessSubTab] = useState<'exercises' | 'insights'>('exercises');

  // Custom Hooks integration
  const { theme, toggleTheme } = useTheme();
  const {
    profile,
    checkins,
    journalEntries,
    saveProfile,
    saveCheckIn,
    saveJournalEntry,
    deleteJournalEntry
  } = useWellnessData();

  // Save profile helper
  const handleSaveProfile = (updatedProfile: any) => {
    saveProfile(updatedProfile);
  };

  // Save Check-in helper
  const handleSaveCheckIn = (newCheckIn: any) => {
    const result = saveCheckIn(newCheckIn);
    if (result.success) {
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 1200);
    } else {
      alert(result.errors?.join('\n') || 'Failed to save daily check-in.');
    }
  };

  // Save Journal entry helper
  const handleSaveJournalEntry = (newEntry: any) => {
    const result = saveJournalEntry(newEntry);
    if (!result.success) {
      alert(result.errors?.join('\n') || 'Failed to save reflection.');
    }
  };

  // Render tab views dynamically
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            profile={profile}
            checkins={checkins}
            onNavigate={(tab) => {
              if (tab === 'insights') {
                setWellnessSubTab('insights');
                setActiveTab('insights');
              } else {
                setActiveTab(tab);
              }
            }}
          />
        );
      case 'checkin':
        return (
          <CheckInForm
            existingCheckIns={checkins}
            onSave={handleSaveCheckIn}
          />
        );
      case 'analytics':
        return <Analytics checkins={checkins} />;
      case 'journal':
        return (
          <Journal
            entries={journalEntries}
            onSaveEntry={handleSaveJournalEntry}
            onDeleteEntry={deleteJournalEntry}
          />
        );
      case 'insights':
      case 'exercises':
        return (
          <div className="animated-fade-in">
            {/* Top Sub Tabs for Wellness */}
            <div 
              style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '0.25rem', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}
              role="tablist"
              aria-label="Wellness Tabs"
            >
              <button
                className="sub-tab-btn"
                role="tab"
                aria-selected={wellnessSubTab === 'exercises'}
                id="tab-exercises"
                aria-controls="panel-exercises"
                style={{
                  flex: 1,
                  padding: '0.6rem 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: wellnessSubTab === 'exercises' ? 'var(--primary)' : 'none',
                  color: wellnessSubTab === 'exercises' ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
                onClick={() => setWellnessSubTab('exercises')}
              >
                <Activity size={14} aria-hidden="true" /> Focus & Relax
              </button>
              <button
                className="sub-tab-btn"
                role="tab"
                aria-selected={wellnessSubTab === 'insights'}
                id="tab-insights"
                aria-controls="panel-insights"
                style={{
                  flex: 1,
                  padding: '0.6rem 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: wellnessSubTab === 'insights' ? 'var(--primary)' : 'none',
                  color: wellnessSubTab === 'insights' ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
                onClick={() => setWellnessSubTab('insights')}
              >
                <Sparkles size={14} aria-hidden="true" /> Wellness Support
              </button>
            </div>
            
            <div id="panel-exercises" role="tabpanel" aria-labelledby="tab-exercises" hidden={wellnessSubTab !== 'exercises'}>
              {wellnessSubTab === 'exercises' && <Exercises />}
            </div>
            <div id="panel-insights" role="tabpanel" aria-labelledby="tab-insights" hidden={wellnessSubTab !== 'insights'}>
              {wellnessSubTab === 'insights' && <Insights checkins={checkins} />}
            </div>
          </div>
        );
      default:
        return <Dashboard profile={profile} checkins={checkins} onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* Main top header */}
        <Header
          profile={profile}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Dynamic Inner Body Area */}
        <main className="main-content" id="main-content">
          {renderTabContent()}
        </main>

        {/* Floating bottom menu */}
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'insights') {
              setWellnessSubTab('exercises');
            }
            setActiveTab(tab);
          }}
        />

        {/* Profile Settings Modal */}
        <ProfileModal
          profile={profile}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
