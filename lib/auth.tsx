"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  api,
  setTokens,
  clearTokens,
  getAccessToken,
  isTokenExpired,
  refreshAccessToken,
} from "./api-client";
import type {
  UserResponseDto,
  LoginDto,
  RegisterDto,
  AuthResponse,
} from "./Api";

interface AuthContextType {
  user: UserResponseDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<AuthResponse>;
  register: (data: RegisterDto) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch current user profile
  const fetchUser = useCallback(async () => {
    try {
      const response = await api.api.usersControllerGetMe();
      setUser(response.data);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Check if token is expired and refresh if needed
    if (isTokenExpired(token)) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
    }

    await fetchUser();
    setIsLoading(false);
  }, [fetchUser]);

  // Initialize auth state on mount
  useEffect(() => {
    setTimeout(async () => {
      await refreshUser();
    }, 0);
  }, [refreshUser]);

  // Set up token refresh interval
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    // Refresh token every 4 minutes (assuming 5min expiry)
    const interval = setInterval(async () => {
      const currentToken = getAccessToken();
      if (currentToken && isTokenExpired(currentToken)) {
        await refreshAccessToken();
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Login handler
  const login = useCallback(
    async (data: LoginDto): Promise<AuthResponse> => {
      const response = await api.api.authControllerLogin(data);
      const { accessToken, refreshToken } = response.data;

      await setTokens(accessToken, refreshToken);
      await fetchUser();

      return response.data;
    },
    [fetchUser]
  );

  // Register handler
  const register = useCallback(
    async (data: RegisterDto): Promise<AuthResponse> => {
      const response = await api.api.authControllerRegister(data);
      const { accessToken, refreshToken } = response.data;

      await setTokens(accessToken, refreshToken);
      await fetchUser();

      return response.data;
    },
    [fetchUser]
  );

  // Logout handler
  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
