import { Api } from "./Api";

// Token storage keys
const ACCESS_TOKEN_KEY = "betracked_access_token";
const REFRESH_TOKEN_KEY = "betracked_refresh_token";

// Token management functions
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Set tokens in both localStorage and cookies (for middleware)
export async function setTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  if (typeof window === "undefined") return;

  // Store in localStorage for client-side use
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  // Also set in cookies via API route for middleware/SSR
  try {
    await fetch("/api/auth/set-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken }),
    });
  } catch {
    // Cookie sync failed, but localStorage still works
    console.warn("Failed to sync tokens to cookies");
  }
}

// Clear tokens from both localStorage and cookies
export async function clearTokens(): Promise<void> {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  // Also clear cookies
  try {
    await fetch("/api/auth/clear-tokens", { method: "POST" });
  } catch {
    console.warn("Failed to clear cookies");
  }
}

// Check if access token is expired (with 30s buffer)
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to ms
    return Date.now() >= exp - 30000; // 30s buffer
  } catch {
    return true;
  }
}

// API base URL from environment or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create API instance with security worker for auth
export const api = new Api({
  baseUrl: API_BASE_URL,
  securityWorker: async () => {
    const token = getAccessToken();
    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  },
});

// Refresh access token using refresh token
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await api.api.authControllerRefreshToken({
      refreshToken,
    });

    const { accessToken } = response.data;
    // Update tokens (keeps same refresh token)
    await setTokens(accessToken, refreshToken);
    return accessToken;
  } catch {
    // Refresh failed, clear all tokens
    await clearTokens();
    return null;
  }
}
