import React, { useEffect } from 'react';
import { useCognitoAuth } from '../auth/CognitoAuthContext';
import { setCognitoToken } from './dynamodbClient';

export default function CognitoAwareLayout({ children }) {
  const { getIdToken } = useCognitoAuth();

  useEffect(() => {
    const updateToken = async () => {
      const token = await getIdToken();
      if (token) {
        setCognitoToken(token);
      }
    };
    updateToken();
  }, [getIdToken]);

  return <>{children}</>;
}