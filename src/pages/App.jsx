import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CognitoAuthProvider, useCognitoAuth } from './components/auth/CognitoAuthContext';
import { Toaster } from 'sonner';
import Layout from './Layout';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Map from './pages/Map';
import AutoDetect from './pages/AutoDetect';
import Vehicles from './pages/Vehicles';
import TollPasses from './pages/TollPasses';
import Payments from './pages/Payments';
import History from './pages/History';
import Notifications from './pages/Notifications';
import Architecture from './pages/Architecture';
import Geofences from './pages/Geofences';
import MigrateToDynamoDB from './pages/MigrateToDynamoDB';

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
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CognitoAuthProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" />
        </Router>
      </CognitoAuthProvider>
    </QueryClientProvider>
  );
}