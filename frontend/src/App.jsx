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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B0A] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-2 border-[#20D69A] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-[#929F98]">Verifying authenticated session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

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

            {/* Protected Workspace Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UploadPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DocumentListPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/extraction"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExtractionPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/extraction/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExtractionPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/validation"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ValidationPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/validation/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ValidationPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ReviewPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/duplicates"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DuplicatePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/export"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExportPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
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
