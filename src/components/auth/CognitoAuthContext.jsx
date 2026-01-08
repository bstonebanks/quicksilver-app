import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-east-2_zXbSb43aF',
  ClientId: '11q1cvvdbo1o36g70r1srk9mtn'
};

let userPool;
try {
  userPool = new CognitoUserPool(poolData);
} catch (error) {
  console.error('Failed to initialize Cognito User Pool:', error);
}

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
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userPool) {
      setError('Cognito not configured');
      setLoading(false);
      return;
    }
    checkUser();
  }, []);

  const checkUser = () => {
    try {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.error('Cognito session error:', err);
            setLoading(false);
            return;
          }
          if (session.isValid()) {
            cognitoUser.getUserAttributes((err, attributes) => {
              if (!err) {
                const userInfo = attributes.reduce((acc, attr) => {
                  acc[attr.Name] = attr.Value;
                  return acc;
                }, {});
                setUser({
                  email: userInfo.email,
                  full_name: userInfo.name || userInfo.email,
                  role: userInfo['custom:role'] || 'user',
                  sub: userInfo.sub
                });
                setSession(session);
              }
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  const signUp = (email, password, fullName) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name', Value: fullName })
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result.user);
      });
    });
  };

  const confirmSignUp = (email, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
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
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (!err) {
              const userInfo = attributes.reduce((acc, attr) => {
                acc[attr.Name] = attr.Value;
                return acc;
              }, {});
              const userData = {
                email: userInfo.email,
                full_name: userInfo.name || userInfo.email,
                role: userInfo['custom:role'] || 'user',
                sub: userInfo.sub
              };
              setUser(userData);
              setSession(session);
              resolve({ user: userData, session });
            } else {
              reject(err);
            }
          });
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
    setSession(null);
  };

  const getIdToken = () => {
    return session?.getIdToken()?.getJwtToken();
  };

  const getAccessToken = () => {
    return session?.getAccessToken()?.getJwtToken();
  };

  const value = {
    user,
    loading,
    session,
    error,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    getIdToken,
    getAccessToken,
    isAuthenticated: !!user
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <CognitoAuthContext.Provider value={value}>
      {children}
    </CognitoAuthContext.Provider>
  );
};