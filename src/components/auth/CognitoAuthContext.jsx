import React, { createContext, useContext, useState, useEffect } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-2_zXbSb43aF',
  ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || '11q1cvvdbo1o36g70r1srk9mtn'
};

const userPool = new CognitoUserPool(poolData);

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
  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setUser(null);
          setIdToken(null);
          setLoading(false);
          return;
        }
        
        setIdToken(session.getIdToken().getJwtToken());
        
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            setUser(null);
            setLoading(false);
            return;
          }
          
          const userData = attributes.reduce((acc, attr) => {
            acc[attr.Name] = attr.Value;
            return acc;
          }, {});
          
          setUser({
            username: cognitoUser.getUsername(),
            email: userData.email,
            full_name: userData.name || userData.email,
            ...userData
          });
          setLoading(false);
        });
      });
    } else {
      setUser(null);
      setIdToken(null);
      setLoading(false);
    }
  };

  const signUp = (email, password, name) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name }
      ];
      
      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  };

  const confirmSignUp = (username, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });
      
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  };

  const signIn = (email, password) => {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });
      
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });
      
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          setIdToken(session.getIdToken().getJwtToken());
          checkAuth();
          resolve(session);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  };

  const signOut = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setUser(null);
    setIdToken(null);
  };

  const value = {
    user,
    idToken,
    loading,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <CognitoAuthContext.Provider value={value}>
      {children}
    </CognitoAuthContext.Provider>
  );
};