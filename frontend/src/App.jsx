import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ExtractionPage from './pages/ExtractionPage';
import ValidationPage from './pages/ValidationPage';
import ReviewPage from './pages/ReviewPage';
import DocumentListPage from './pages/DocumentListPage';
import DuplicatePage from './pages/DuplicatePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ExportPage from './pages/ExportPage';
import SettingsPage from './pages/SettingsPage';

import { api } from './api/client';

function AppLayout({ children }) {
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);

  const refreshCounts = () => {
    api.getAnalytics()
      .then((data) => {
        setDuplicateCount(data.duplicate_count || 0);
        setIssuesCount(data.issues_detected || 0);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#080B0A] text-[#F4F7F5]">
      {/* SaaS Sidebar */}
      <Sidebar duplicateCount={duplicateCount} issuesCount={issuesCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          duplicateCount={duplicateCount}
          issuesCount={issuesCount}
          onRefresh={refreshCounts}
        />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/register" element={<AuthPage initialMode="register" />} />

            {/* Dashboard Workspace Routes */}
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              }
            />
            <Route
              path="/upload"
              element={
                <AppLayout>
                  <UploadPage />
                </AppLayout>
              }
            />
            <Route
              path="/documents"
              element={
                <AppLayout>
                  <DocumentListPage />
                </AppLayout>
              }
            />
            <Route
              path="/extraction"
              element={
                <AppLayout>
                  <ExtractionPage />
                </AppLayout>
              }
            />
            <Route
              path="/extraction/:id"
              element={
                <AppLayout>
                  <ExtractionPage />
                </AppLayout>
              }
            />
            <Route
              path="/validation"
              element={
                <AppLayout>
                  <ValidationPage />
                </AppLayout>
              }
            />
            <Route
              path="/validation/:id"
              element={
                <AppLayout>
                  <ValidationPage />
                </AppLayout>
              }
            />
            <Route
              path="/review/:id"
              element={
                <AppLayout>
                  <ReviewPage />
                </AppLayout>
              }
            />
            <Route
              path="/duplicates"
              element={
                <AppLayout>
                  <DuplicatePage />
                </AppLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <AppLayout>
                  <AnalyticsPage />
                </AppLayout>
              }
            />
            <Route
              path="/export"
              element={
                <AppLayout>
                  <ExportPage />
                </AppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
