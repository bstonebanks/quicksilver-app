import React from 'react';

// Polyfill for AWS SDK - must run before any AWS imports
if (typeof window !== 'undefined') {
  window.global = window;
  window.process = window.process || { env: {} };
  window.Buffer = window.Buffer || { isBuffer: () => false };
}
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CognitoAuthProvider, useCognitoAuth } from '../components/auth/CognitoAuthContext';
import { Toaster } from 'sonner';
import Layout from '../Layout';
import CognitoAwareLayout from '../components/utils/CognitoAwareLayout';
import ErrorBoundary from '../components/ErrorBoundary';

// Pages
import Home from './Home';
import Auth from './Auth';
import Map from './Map';
import AutoDetect from './AutoDetect';
import Vehicles from './Vehicles';
import TollPasses from './TollPasses';
import Payments from './Payments';
import History from './History';
import Notifications from './Notifications';
import Architecture from './Architecture';
import Geofences from './Geofences';
import MigrateToDynamoDB from './MigrateToDynamoDB';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useCognitoAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      <Route path="/*" element={
        <ProtectedRoute>
          <CognitoAwareLayout>
            <Layout>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/map" element={<Map />} />
              <Route path="/autodetect" element={<AutoDetect />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/tollpasses" element={<TollPasses />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/history" element={<History />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/geofences" element={<Geofences />} />
              <Route path="/migratetodynamodb" element={<MigrateToDynamoDB />} />
              </Routes>
            </Layout>
          </CognitoAwareLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CognitoAuthProvider>
          <Router>
            <AppRoutes />
            <Toaster position="top-right" />
          </Router>
        </CognitoAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}