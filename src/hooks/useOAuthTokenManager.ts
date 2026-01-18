import { useState, useEffect, useCallback, useRef } from "react";

/**
 * OAuth Token Manager Hook
 * 
 * Features:
 * - PKCE (Proof Key for Code Exchange) support
 * - Automatic token refresh before expiration
 * - Secure token storage
 * - Token revocation
 */

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string;
}

interface UserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  tokenEndpoint: string;
  userinfoEndpoint: string;
  revokeEndpoint?: string;
  authorizationEndpoint: string;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "alsamos_access_token",
  REFRESH_TOKEN: "alsamos_refresh_token",
  ID_TOKEN: "alsamos_id_token",
  EXPIRES_AT: "alsamos_token_expires_at",
  CODE_VERIFIER: "oauth_code_verifier",
  STATE: "oauth_state",
  RETURN_URL: "oauth_return_url",
};

// PKCE Utils
export const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
};

export const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
};

const base64UrlEncode = (buffer: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

// Token Manager Class
class OAuthTokenManager {
  private config: OAuthConfig;
  private refreshTimeoutId: number | null = null;
  private onTokenRefreshed?: (tokens: TokenData) => void;
  private onTokenError?: (error: Error) => void;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  setCallbacks(
    onRefreshed?: (tokens: TokenData) => void,
    onError?: (error: Error) => void
  ) {
    this.onTokenRefreshed = onRefreshed;
    this.onTokenError = onError;
  }

  // Start OAuth flow with PKCE
  async startAuthFlow(options: {
    scope?: string;
    returnUrl?: string;
    usePKCE?: boolean;
  } = {}): Promise<void> {
    const { scope = "openid email profile", returnUrl, usePKCE = true } = options;

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEYS.STATE, state);

    if (returnUrl) {
      sessionStorage.setItem(STORAGE_KEYS.RETURN_URL, returnUrl);
    }

    const authUrl = new URL(this.config.authorizationEndpoint);
    authUrl.searchParams.set("client_id", this.config.clientId);
    authUrl.searchParams.set("redirect_uri", this.config.redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("state", state);

    // PKCE
    if (usePKCE) {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
    }

    window.location.href = authUrl.toString();
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<TokenData> {
    const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
    });

    if (this.config.clientSecret) {
      body.set("client_secret", this.config.clientSecret);
    }

    if (codeVerifier) {
      body.set("code_verifier", codeVerifier);
      sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
    }

    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error_description || errorData.error || "Token exchange failed"
      );
    }

    const tokens = await response.json();
    this.saveTokens(tokens);
    this.scheduleTokenRefresh(tokens.expires_in);
    return tokens;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<TokenData> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    });

    if (this.config.clientSecret) {
      body.set("client_secret", this.config.clientSecret);
    }

    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      this.clearTokens();
      throw new Error(
        errorData.error_description || errorData.error || "Token refresh failed"
      );
    }

    const tokens = await response.json();
    this.saveTokens(tokens);
    this.scheduleTokenRefresh(tokens.expires_in);
    return tokens;
  }

  // Revoke tokens
  async revokeTokens(): Promise<void> {
    if (!this.config.revokeEndpoint) {
      this.clearTokens();
      return;
    }

    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      try {
        await fetch(this.config.revokeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            token: accessToken,
            token_type_hint: "access_token",
            client_id: this.config.clientId,
          }),
        });
      } catch (error) {
        console.error("Error revoking token:", error);
      }
    }

    this.clearTokens();
  }

  // Get current access token (with auto-refresh if needed)
  async getAccessToken(): Promise<string | null> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken) {
      return null;
    }

    // Check if token is expired or about to expire (5 min buffer)
    if (expiresAt) {
      const expirationTime = parseInt(expiresAt, 10);
      const bufferTime = 5 * 60 * 1000; // 5 minutes

      if (Date.now() >= expirationTime - bufferTime) {
        try {
          const newTokens = await this.refreshAccessToken();
          return newTokens.access_token;
        } catch (error) {
          console.error("Failed to refresh token:", error);
          return null;
        }
      }
    }

    return accessToken;
  }

  // Fetch user info
  async getUserInfo(): Promise<UserInfo> {
    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    const response = await fetch(this.config.userinfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json();
  }

  // Save tokens to localStorage
  private saveTokens(tokens: TokenData): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    
    if (tokens.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    }
    
    if (tokens.id_token) {
      localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.id_token);
    }
    
    localStorage.setItem(
      STORAGE_KEYS.EXPIRES_AT,
      String(Date.now() + tokens.expires_in * 1000)
    );
  }

  // Clear all tokens
  clearTokens(): void {
    this.cancelScheduledRefresh();
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(expiresIn: number): void {
    this.cancelScheduledRefresh();

    // Refresh 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000;

    if (refreshTime > 0) {
      this.refreshTimeoutId = window.setTimeout(async () => {
        try {
          const tokens = await this.refreshAccessToken();
          this.onTokenRefreshed?.(tokens);
        } catch (error) {
          this.onTokenError?.(error as Error);
        }
      }, refreshTime);
    }
  }

  // Cancel scheduled refresh
  private cancelScheduledRefresh(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  // Validate stored state
  validateState(state: string | null): boolean {
    const savedState = sessionStorage.getItem(STORAGE_KEYS.STATE);
    if (!state || !savedState) return true; // State is optional
    return state === savedState;
  }

  // Clear state
  clearState(): void {
    sessionStorage.removeItem(STORAGE_KEYS.STATE);
    sessionStorage.removeItem(STORAGE_KEYS.RETURN_URL);
    sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  }

  // Get return URL
  getReturnUrl(): string {
    return sessionStorage.getItem(STORAGE_KEYS.RETURN_URL) || "/dashboard";
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken) return false;

    if (expiresAt) {
      const expirationTime = parseInt(expiresAt, 10);
      if (Date.now() >= expirationTime) {
        // Token expired, but we might have refresh token
        return !!localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }

    return true;
  }
}

// React Hook
export function useOAuthTokenManager(config: OAuthConfig) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const managerRef = useRef<OAuthTokenManager | null>(null);

  // Initialize manager
  if (!managerRef.current) {
    managerRef.current = new OAuthTokenManager(config);
  }

  const manager = managerRef.current;

  // Set up callbacks
  useEffect(() => {
    manager.setCallbacks(
      () => {
        console.log("Token refreshed automatically");
      },
      (err) => {
        setError(err);
        setIsAuthenticated(false);
      }
    );

    // Check initial auth state
    setIsAuthenticated(manager.isAuthenticated());
    setIsLoading(false);
  }, [manager]);

  // Start login flow
  const login = useCallback(
    async (options?: { scope?: string; returnUrl?: string; usePKCE?: boolean }) => {
      await manager.startAuthFlow(options);
    },
    [manager]
  );

  // Handle callback (exchange code for tokens)
  const handleCallback = useCallback(
    async (code: string, state: string | null) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate state
        if (!manager.validateState(state)) {
          throw new Error("State mismatch - possible CSRF attack");
        }

        // Exchange code for tokens
        await manager.exchangeCodeForTokens(code);
        
        // Fetch user info
        const user = await manager.getUserInfo();
        setUserInfo(user);
        
        setIsAuthenticated(true);
        manager.clearState();
        
        return { success: true, returnUrl: manager.getReturnUrl() };
      } catch (err) {
        setError(err as Error);
        setIsAuthenticated(false);
        return { success: false, error: err as Error };
      } finally {
        setIsLoading(false);
      }
    },
    [manager]
  );

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await manager.revokeTokens();
      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  // Refresh token manually
  const refreshToken = useCallback(async () => {
    setIsLoading(true);
    try {
      await manager.refreshAccessToken();
      setIsAuthenticated(true);
    } catch (err) {
      setError(err as Error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  // Get access token (with auto-refresh)
  const getAccessToken = useCallback(async () => {
    return manager.getAccessToken();
  }, [manager]);

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await manager.getUserInfo();
      setUserInfo(user);
      return user;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  return {
    isAuthenticated,
    isLoading,
    userInfo,
    error,
    login,
    logout,
    handleCallback,
    refreshToken,
    getAccessToken,
    fetchUserInfo,
  };
}

// Default config for Alsamos OAuth
export const createAlsamosOAuthConfig = (): OAuthConfig => ({
  clientId: "client_7903e9c6-8903-4d7d-b585-c96c6a9489ad",
  clientSecret: "social_secret_2024_secure_key_abc123", // Production'da backend'da saqlang!
  redirectUri: `${window.location.origin}/oauth/callback`,
  tokenEndpoint: "https://api.alsamos.com/oauth/token",
  userinfoEndpoint: "https://api.alsamos.com/oauth/userinfo",
  revokeEndpoint: "https://api.alsamos.com/oauth/revoke",
  authorizationEndpoint: "https://accounts.alsamos.com/oauth/authorize",
});
