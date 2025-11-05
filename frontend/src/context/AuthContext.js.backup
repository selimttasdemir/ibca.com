import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const { authAPI } = await import('../services/api');
      const data = await authAPI.login(username, password);
      
      const token = data.access_token;
      
      // Save token first so subsequent API calls can use it
      localStorage.setItem('authToken', token);
      
      // Get user info
      const userInfo = await authAPI.getCurrentUser();
      const userData = { 
        username: userInfo.username, 
        role: userInfo.is_admin ? 'admin' : 'user',
        email: userInfo.email,
        full_name: userInfo.full_name
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Clean up on error
      localStorage.removeItem('authToken');
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Giriş başarısız. Lütfen tekrar deneyin.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};