import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CognitoAuthProvider, useCognitoAuth } from './components/auth/CognitoAuthContext';
import Layout from './Layout';

// Import all pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Map from './pages/Map';
import AutoDetect from './pages/AutoDetect';
import Vehicles from './pages/Vehicles';
import TollPasses from './pages/TollPasses';
import Payments from './pages/Payments';
import History from './pages/History';
import Notifications from './pages/Notifications';
import Geofences from './pages/Geofences';
import Architecture from './pages/Architecture';
import MigrateToDynamoDB from './pages/MigrateToDynamoDB';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user, loading } = useCognitoAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/map" element={<Map />} />
              <Route path="/auto-detect" element={<AutoDetect />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/toll-passes" element={<TollPasses />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/history" element={<History />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/geofences" element={<Geofences />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/migrate" element={<MigrateToDynamoDB />} />
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
        </Router>
      </CognitoAuthProvider>
    </QueryClientProvider>
  );
}