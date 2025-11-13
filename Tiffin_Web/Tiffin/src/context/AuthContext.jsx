// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (token && userData && role && userId) {
      const parsedUser = JSON.parse(userData);
      setUser({
        id: userId,
        name: parsedUser.name,
        email: parsedUser.email,
        role: role,
        token: token,
        status: parsedUser.status
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify({
      name: userData.name,
      email: userData.email,
      status: userData.status
    }));
    localStorage.setItem('role', userData.role);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('customerId', userData.id); // For cart functionality
    
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      token: userData.token,
      status: userData.status
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('customerId');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};