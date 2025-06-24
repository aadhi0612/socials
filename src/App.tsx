import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import ContentCreation from './pages/ContentCreation';
import MediaLibrary from './pages/MediaLibrary';
import CampaignManager from './pages/CampaignManager';
import AdminDashboard from './pages/AdminDashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-black">EY</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              EY Social Posts
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Building a better working world through social media
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              This is a demo environment. In production, this would integrate with EY's enterprise SSO.
            </p>
            <button 
              onClick={() => login('demo@ey.com', 'demo')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<ContentCreation />} />
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/campaigns" element={<CampaignManager />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/\" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;