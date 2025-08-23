import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { AIProvider } from './contexts/AIContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DocumentUploadPage from './pages/documents/DocumentUploadPage';
import DocumentViewPage from './pages/documents/DocumentViewPage';
import DocumentListPage from './pages/documents/DocumentListPage';
import SigningPage from './pages/signing/SigningPage';
import WorkflowsPage from './pages/workflows/WorkflowsPage';
import SettingsPage from './pages/settings/SettingsPage';
import AIAssistantPage from './pages/ai/AIAssistantPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';

// Styles
import './styles/globals.css';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <AIProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/sign/:token" element={<SigningPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/app" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<DashboardPage />} />
                    <Route path="documents" element={<DocumentListPage />} />
                    <Route path="documents/upload" element={<DocumentUploadPage />} />
                    <Route path="documents/:id" element={<DocumentViewPage />} />
                    <Route path="workflows" element={<WorkflowsPage />} />
                    <Route path="ai-assistant" element={<AIAssistantPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>

                {/* Global Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#22c55e',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </AIProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;