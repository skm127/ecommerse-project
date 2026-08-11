import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shophub_user'));
      return saved && typeof saved === 'object' ? saved : null;
    } catch (error) {
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

  const login = async (username, password) => {
    try {
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          expiresInMins: 60,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store the essential user info and token
      setUser({
        id: data.id,
        username: data.username,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        image: data.image,
        accessToken: data.accessToken,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
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
