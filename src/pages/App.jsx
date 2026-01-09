import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from '../Layout';
import ErrorBoundary from '../components/ErrorBoundary';

// Pages
import Home from './Home';
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
import AWSSetupGuide from './AWSSetupGuide';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRoutes() {
  return (
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
        <Route path="/awssetupguide" element={<AWSSetupGuide />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}