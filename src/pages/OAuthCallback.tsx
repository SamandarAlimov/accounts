import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, Shield, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlsamosLogo } from "@/components/AlsamosLogo";
import { useOAuth } from "@/contexts/OAuthContext";

/**
 * OAuth Callback Page for Third-Party Applications
 * 
 * Bu sahifa OAuth authorization code flow'ning callback qismini amalga oshiradi.
 * Social.alsamos.com yoki boshqa third-party app'lar uchun misol.
 * 
 * Features:
 * - PKCE (Proof Key for Code Exchange) support
 * - Automatic token refresh
 * - CSRF protection via state parameter
 * 
 * Flow:
 * 1. User Alsamos ID orqali login qiladi
 * 2. User consent beradi
 * 3. Alsamos authorization code bilan bu sahifaga redirect qiladi
 * 4. Bu sahifa code'ni token'ga almashtiradi (PKCE bilan)
 * 5. Token'lar saqlanib, auto-refresh schedule qilinadi
 * 6. App'ga redirect qilinadi
 */

interface TokenResponse {
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

type CallbackStatus = "loading" | "exchanging" | "fetching_user" | "success" | "error";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [localUserInfo, setLocalUserInfo] = useState<UserInfo | null>(null);

  // OAuth Context hook (global)
  const { 
    handleCallback: processCallback, 
    userInfo: hookUserInfo,
    isLoading 
  } = useOAuth();

  // OAuth parametrlari URL'dan olinadi
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    // 1. Error tekshirish
    if (errorParam) {
      setStatus("error");
      setError(errorDescription || errorParam);
      return;
    }

    // 2. Authorization code borligini tekshirish
    if (!code) {
      setStatus("error");
      setError("Authorization code topilmadi");
      return;
    }

    try {
      // 3. Token almashish (PKCE bilan)
      setStatus("exchanging");
      const result = await processCallback(code, state);

      if (!result.success) {
        throw result.error || new Error("Token almashishda xatolik");
      }

      // 4. User info hookdan olinadi
      setStatus("fetching_user");
      
      // Hook user info'ni avtomatik oladi
      if (hookUserInfo) {
        setLocalUserInfo(hookUserInfo);
      }

      setStatus("success");

      // 5. App'ga redirect (3 soniyadan keyin)
      setTimeout(() => {
        navigate(result.returnUrl || "/dashboard");
      }, 3000);

    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Token almashishda xatolik");
    }
  };

  // Display user info (from hook or local state)
  const displayUserInfo = hookUserInfo || localUserInfo;

  const getStatusMessage = () => {
    switch (status) {
      case "loading":
        return "Parametrlar tekshirilmoqda...";
      case "exchanging":
        return "Token almashtirilmoqda...";
      case "fetching_user":
        return "Foydalanuvchi ma'lumotlari olinmoqda...";
      case "success":
        return "Muvaffaqiyatli ulandi!";
      case "error":
        return "Xatolik yuz berdi";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlsamosLogo size="md" />
          </div>
          <CardTitle className="text-xl">
            {status === "error" ? "Ulanishda xatolik" : "Alsamos ID bilan ulanish"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Indicator */}
          <div className="flex flex-col items-center gap-4">
            {status === "error" ? (
              <XCircle className="h-12 w-12 text-destructive" />
            ) : status === "success" ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            <p className="text-muted-foreground text-center">
              {getStatusMessage()}
            </p>
          </div>

          {/* Error Details */}
          {status === "error" && error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success Details */}
          {status === "success" && displayUserInfo && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                {displayUserInfo.picture ? (
                  <img 
                    src={displayUserInfo.picture} 
                    alt={displayUserInfo.name || "User"} 
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{displayUserInfo.name || "Foydalanuvchi"}</p>
                  <p className="text-sm text-muted-foreground">{displayUserInfo.email}</p>
                </div>
              </div>
              <p className="text-sm text-green-600">
                3 soniyadan keyin yo'naltirilasiz...
              </p>
            </div>
          )}

          {/* Token Details (Debug - production'da ko'rsatilmaydi) */}
          {status === "success" && tokens && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                Token ma'lumotlari (debug)
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                {JSON.stringify({
                  token_type: tokens.token_type,
                  expires_in: tokens.expires_in,
                  scope: tokens.scope,
                  has_refresh_token: !!tokens.refresh_token,
                  has_id_token: !!tokens.id_token,
                }, null, 2)}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          {status === "error" && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Bosh sahifa
              </Button>
              <Button 
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                Qayta urinish
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ===== HELPER: OAuth Flow Boshlash =====
/**
 * Bu funksiya Social.alsamos.com kabi app'larda OAuth flow'ni boshlash uchun ishlatiladi
 * 
 * Misol:
 * ```tsx
 * import { startOAuthFlow } from "./OAuthCallback";
 * 
 * const handleLogin = () => {
 *   startOAuthFlow({
 *     clientId: "your_client_id",
 *     redirectUri: "https://social.alsamos.com/oauth/callback",
 *     scope: "openid email profile",
 *   });
 * };
 * ```
 */
export const startOAuthFlow = (options: {
  clientId: string;
  redirectUri: string;
  scope?: string;
  returnUrl?: string;
}) => {
  // Random state yaratish (CSRF himoya)
  const state = crypto.randomUUID();
  sessionStorage.setItem("oauth_state", state);
  
  if (options.returnUrl) {
    sessionStorage.setItem("oauth_return_url", options.returnUrl);
  }

  // PKCE uchun (ixtiyoriy, lekin tavsiya etiladi)
  // const codeVerifier = generateCodeVerifier();
  // const codeChallenge = await generateCodeChallenge(codeVerifier);
  // sessionStorage.setItem("oauth_code_verifier", codeVerifier);

  const authUrl = new URL("https://accounts.alsamos.com/oauth/authorize");
  authUrl.searchParams.set("client_id", options.clientId);
  authUrl.searchParams.set("redirect_uri", options.redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", options.scope || "openid email profile");
  authUrl.searchParams.set("state", state);
  // authUrl.searchParams.set("code_challenge", codeChallenge);
  // authUrl.searchParams.set("code_challenge_method", "S256");

  window.location.href = authUrl.toString();
};
