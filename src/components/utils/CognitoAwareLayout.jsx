import React, { useEffect } from 'react';
import { useCognitoAuth } from '../auth/CognitoAuthContext';
import { setCognitoToken } from './dynamodbClient';

export default function CognitoAwareLayout({ children }) {
  const { idToken } = useCognitoAuth();

  useEffect(() => {
    if (idToken) {
      setCognitoToken(idToken);
    }
  }, [idToken]);

  return <>{children}</>;
}