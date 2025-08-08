import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import MeetingDetail from './components/MeetingDetail';

function App() {
  const [currentPage, setCurrentPage] = useState<'auth' | 'dashboard' | 'meeting-detail'>('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'meeting-detail'>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('auth');
    setCurrentView('dashboard');
  };

  const handleViewMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setCurrentPage('meeting-detail');
    setCurrentView('meeting-detail');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setCurrentView('dashboard');
    setSelectedMeetingId('');
  };

  if (currentPage === 'auth') {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentPage === 'meeting-detail') {
    return (
      <MeetingDetail 
        meetingId={selectedMeetingId} 
        onBack={handleBackToDashboard}
      />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;