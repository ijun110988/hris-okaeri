import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

interface User {
  id: number;
  username: string;
  name: string;
  email: string | null;
  department: string | null;
  position: string | null;
  nik: string | null;
  role: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/api/auth/me');

      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
      setError('Failed to fetch user detail');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await fetchUserDetail();
  };

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
