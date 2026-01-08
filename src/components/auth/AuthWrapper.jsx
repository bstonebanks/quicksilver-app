import React, { useEffect } from 'react';
import { useCognitoAuth } from './CognitoAuthContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AuthWrapper({ children, requireAuth = true }) {
  const { user, loading } = useCognitoAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate(createPageUrl('CognitoLogin'));
    }
  }, [user, loading, requireAuth, navigate]);

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

  if (requireAuth && !user) {
    return null;
  }

  return children;
}