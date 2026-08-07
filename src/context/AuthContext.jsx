import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Lazily initialize from localStorage with safe parsing
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shophub_user'));
      return saved && typeof saved === 'object' ? saved : null;
    } catch (error) {
      // Corrupted or unreadable user data — reset to null
      console.error('Failed to load user from localStorage:', error);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('shophub_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('shophub_user');
      }
    } catch (error) {
      console.error('Failed to persist auth state:', error);
    }
  }, [user]);

  const login = (email, name) => {
    setUser({ email, name });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

