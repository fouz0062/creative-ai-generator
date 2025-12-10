"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  fetchAuthSession,
  getCurrentUser,
  AuthUser,
} from "aws-amplify/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInUser: (username: string, password: string) => Promise<void>;
  signUpUser: (username: string, password: string) => Promise<void>;
  confirmUser: (username: string, code: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPasswordUser: (username: string) => Promise<void>;
  confirmResetPasswordUser: (
    username: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check the current authentication status
  const checkAuthStatus = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      if (tokens) {
        // User is authenticated, fetch user details
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // --- Auth Functions ---
  const signUpUser = async (username: string, password: string) => {
    await signUp({
      username,
      password,
      options: {
        userAttributes: { email: username },
        autoSignIn: false, // Wait for confirmation
      },
    });
  };

  const confirmUser = async (username: string, code: string) => {
    await confirmSignUp({ username, confirmationCode: code });
    await checkAuthStatus();
  };

  const signInUser = async (username: string, password: string) => {
    const { isSignedIn } = await signIn({ username, password });
    if (isSignedIn) {
      await checkAuthStatus();
    }
  };

  const signOutUser = async () => {
    await signOut();
    setUser(null);
  };

  const resetPasswordUser = async (username: string) => {
    await resetPassword({ username });
  };

  const confirmResetPasswordUser = async (
    username: string,
    code: string,
    newPassword: string
  ) => {
    await confirmResetPassword({
      username,
      confirmationCode: code,
      newPassword,
    });
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signInUser,
    signUpUser,
    confirmUser,
    signOutUser,
    resetPasswordUser,
    confirmResetPasswordUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
