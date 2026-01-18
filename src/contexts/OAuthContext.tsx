import { createContext, useContext, ReactNode } from "react";
import { 
  useOAuthTokenManager, 
  createAlsamosOAuthConfig 
} from "@/hooks/useOAuthTokenManager";

interface UserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

interface OAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
  error: Error | null;
  login: (options?: { scope?: string; returnUrl?: string; usePKCE?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  handleCallback: (code: string, state: string | null) => Promise<{ success: boolean; returnUrl?: string; error?: Error }>;
  refreshToken: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  fetchUserInfo: () => Promise<UserInfo>;
}

const OAuthContext = createContext<OAuthContextType | undefined>(undefined);

interface OAuthProviderProps {
  children: ReactNode;
  config?: ReturnType<typeof createAlsamosOAuthConfig>;
}

export function OAuthProvider({ children, config }: OAuthProviderProps) {
  const oauthConfig = config || createAlsamosOAuthConfig();
  const oauth = useOAuthTokenManager(oauthConfig);

  return (
    <OAuthContext.Provider value={oauth}>
      {children}
    </OAuthContext.Provider>
  );
}

export function useOAuth() {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error("useOAuth must be used within an OAuthProvider");
  }
  return context;
}

// Re-export utilities for convenience
export { createAlsamosOAuthConfig, generateCodeVerifier, generateCodeChallenge } from "@/hooks/useOAuthTokenManager";
