"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'citaFacilUsers';
const LOGGED_IN_USER_KEY = 'citaFacilLoggedInUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(LOGGED_IN_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsers = (): User[] => {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Failed to save users to localStorage", error);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.password === password); // In a real app, hash passwords!
    if (foundUser) {
      setUser(foundUser);
      try {
        localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(foundUser));
      } catch (error) {
        console.error("Failed to save logged in user to localStorage", error);
      }
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = { id: crypto.randomUUID(), email, password }; // In a real app, hash passwords!
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(LOGGED_IN_USER_KEY);
    } catch (error) {
      console.error("Failed to remove logged in user from localStorage", error);
    }
    toast({ title: 'Cierre de sesión exitoso' });
    router.push('/login');
  }, [router, toast]);


  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
