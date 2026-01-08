import React, { createContext, useContext, useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { 
  signUp, 
  confirmSignUp, 
  signIn, 
  signOut, 
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes
} from 'aws-amplify/auth';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_zXbSb43aF',
      userPoolClientId: '11q1cvvdbo1o36g70r1srk9mtn'
    }
  }
});

const CognitoAuthContext = createContext(null);

export const useCognitoAuth = () => {
  const context = useContext(CognitoAuthContext);
  if (!context) {
    throw new Error('useCognitoAuth must be used within CognitoAuthProvider');
  }
  return context;
};

export const CognitoAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      setUser({
        email: attributes.email,
        full_name: attributes.name || attributes.email,
        role: attributes['custom:role'] || 'user',
        sub: attributes.sub
      });
    } catch (error) {
      console.log('No authenticated user');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email, password, fullName) => {
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name: fullName
        }
      }
    });
    return result;
  };

  const handleConfirmSignUp = async (email, code) => {
    await confirmSignUp({
      username: email,
      confirmationCode: code
    });
  };

  const handleSignIn = async (email, password) => {
    const result = await signIn({
      username: email,
      password
    });
    
    const attributes = await fetchUserAttributes();
    const userData = {
      email: attributes.email,
      full_name: attributes.name || attributes.email,
      role: attributes['custom:role'] || 'user',
      sub: attributes.sub
    };
    
    setUser(userData);
    return { user: userData };
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const getIdToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (error) {
      return null;
    }
  };

  const getAccessToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch (error) {
      return null;
    }
  };

  const value = {
    user,
    loading,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    getIdToken,
    getAccessToken,
    isAuthenticated: !!user
  };

  return (
    <CognitoAuthContext.Provider value={value}>
      {children}
    </CognitoAuthContext.Provider>
  );
};