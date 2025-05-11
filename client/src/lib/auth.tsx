import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User, authMethods } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phoneNumber: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [_, setLocation] = useLocation();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsDemo(parsedUser.id === "demo-user");
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await authMethods.loginWithEmailAndPassword(email, password);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      setLocation("/home");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, phoneNumber: string) => {
    setLoading(true);
    try {
      const user = await authMethods.register(email, password, phoneNumber);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      setLocation("/home");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const user = await authMethods.loginWithGoogle();
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      setLocation("/home");
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemo = async () => {
    setLoading(true);
    try {
      const user = await authMethods.loginWithDemo();
      setUser(user);
      setIsDemo(true);
      localStorage.setItem("user", JSON.stringify(user));
      setLocation("/home");
    } catch (error) {
      console.error("Demo login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authMethods.logout();
      setUser(null);
      setIsDemo(false);
      localStorage.removeItem("user");
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemo,
        login,
        register,
        loginWithGoogle,
        loginWithDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
