import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlsamosLogo } from "@/components/AlsamosLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  Shield, 
  User, 
  Mail, 
  Key, 
  Eye, 
  Calendar, 
  Building2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScopeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
}

interface OAuthClient {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  redirect_uris: string[];
  allowed_scopes: string[];
  is_verified: boolean | null;
  is_active: boolean | null;
}

export default function OAuthConsent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [showAllScopes, setShowAllScopes] = useState(false);
  const [selectedOptionalScopes, setSelectedOptionalScopes] = useState<string[]>([]);
  const [clientInfo, setClientInfo] = useState<OAuthClient | null>(null);
  const [clientLoading, setClientLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // OAuth parameters
  const clientId = searchParams.get("client_id") || "";
  const redirectUri = searchParams.get("redirect_uri") || "";
  const scope = searchParams.get("scope") || "openid profile email";
  const state = searchParams.get("state") || "";
  const responseType = searchParams.get("response_type") || "code";
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  // Fetch client info from database
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (!clientId) {
        setError("Missing client_id parameter");
        setClientLoading(false);
        return;
      }

      try {
        // Use the service role through an edge function to get client info publicly
        const response = await supabase.functions.invoke('oauth-clients', {
          body: { action: 'get', client_id: clientId }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const client = response.data;
        
        if (!client) {
          setError("Application not found");
          setClientLoading(false);
          return;
        }

        if (!client.is_active) {
          setError("This application has been deactivated");
          setClientLoading(false);
          return;
        }

        // Validate redirect URI
        if (redirectUri && !client.redirect_uris.includes(redirectUri)) {
          setError("Invalid redirect URI for this application");
          setClientLoading(false);
          return;
        }

        setClientInfo(client);
      } catch (err) {
        console.error("Error fetching client info:", err);
        setError("Failed to load application information");
      } finally {
        setClientLoading(false);
      }
    };

    fetchClientInfo();
  }, [clientId, redirectUri]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !clientLoading) {
      const currentUrl = window.location.href;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, clientLoading, navigate]);

  // Parse scopes
  const requestedScopes = scope.split(/[+\s]+/);
  
  const allScopes: ScopeInfo[] = [
    { id: "openid", name: "OpenID", description: "Authenticate with your Alsamos ID", icon: Key, required: true },
    { id: "profile", name: "Basic Profile", description: "Your name and profile picture", icon: User, required: true },
    { id: "email", name: "Email Address", description: "Your primary email address", icon: Mail, required: true },
    { id: "phone", name: "Phone Number", description: "Your verified phone number", icon: Globe, required: false },
    { id: "address", name: "Address", description: "Your physical address", icon: Building2, required: false },
    { id: "calendar", name: "Calendar Access", description: "View and manage your calendar", icon: Calendar, required: false },
    { id: "offline_access", name: "Offline Access", description: "Access your data when you're not using the app", icon: Eye, required: false },
  ];

  const activeScopes = allScopes.filter(s => requestedScopes.includes(s.id));
  const requiredScopes = activeScopes.filter(s => s.required);
  const optionalScopes = activeScopes.filter(s => !s.required);

  // Current user info
  const currentUser = {
    name: user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : user?.email?.split('@')[0] || "User",
    email: user?.email || "",
    avatar: user?.user_metadata?.avatar_url
  };

  const handleAllow = async () => {
    if (!user || !clientInfo) return;
    
    setIsLoading(true);
    
    try {
      // Combine required scopes with selected optional scopes
      const finalScopes = [
        ...requiredScopes.map(s => s.id),
        ...selectedOptionalScopes
      ].join(' ');

      // Call the oauth-authorize edge function
      const response = await supabase.functions.invoke('oauth-authorize', {
        body: {
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: finalScopes,
          state,
          response_type: responseType,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          user_id: user.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { code, redirect_uri: callbackUri } = response.data;

      if (!code) {
        throw new Error("Failed to generate authorization code");
      }

      // Build the callback URL with the authorization code
      const callbackUrl = new URL(callbackUri || redirectUri);
      callbackUrl.searchParams.set("code", code);
      if (state) {
        callbackUrl.searchParams.set("state", state);
      }

      toast.success("Authorization granted");

      // Redirect to the application's callback URL
      window.location.href = callbackUrl.toString();
      
    } catch (err) {
      console.error("Authorization error:", err);
      toast.error("Failed to authorize application");
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    setIsDenying(true);
    
    try {
      // Build the callback URL with error
      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set("error", "access_denied");
      callbackUrl.searchParams.set("error_description", "User denied the request");
      if (state) {
        callbackUrl.searchParams.set("state", state);
      }

      // Redirect back with error
      window.location.href = callbackUrl.toString();
    } catch (err) {
      // If redirect URI is invalid, just go back to dashboard
      toast.error("Access denied");
      navigate("/dashboard");
    }
  };

  const toggleOptionalScope = (scopeId: string) => {
    setSelectedOptionalScopes(prev => 
      prev.includes(scopeId) 
        ? prev.filter(id => id !== scopeId)
        : [...prev, scopeId]
    );
  };

  // Loading state
  if (clientLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between p-4 md:p-6">
          <AlsamosLogo />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading application details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !clientInfo) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between p-4 md:p-6">
          <AlsamosLogo />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Authorization Error</h2>
              <p className="text-muted-foreground">{error || "Unknown error occurred"}</p>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // App info from database
  const appInfo = {
    name: clientInfo.name,
    icon: clientInfo.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientInfo.name)}&background=random`,
    description: clientInfo.description,
    verified: clientInfo.is_verified,
    domain: redirectUri ? new URL(redirectUri).hostname : "",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <AlsamosLogo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6 animate-fade-up">
          {/* App Info */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="h-20 w-20 border-4 border-border shadow-lg">
                <AvatarImage src={appInfo.icon} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {appInfo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {appInfo.verified && (
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 border-3 border-card flex items-center justify-center shadow-md">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">{appInfo.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                wants to access your Alsamos Account
              </p>
              {appInfo.domain && (
                <p className="text-xs text-muted-foreground mt-2">
                  <Globe className="h-3 w-3 inline mr-1" />
                  {appInfo.domain}
                </p>
              )}
            </div>
          </div>

          {/* Current Account */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/accountchooser?${searchParams.toString()}`)}>
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                This will allow {appInfo.name} to:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Required Scopes */}
              <div className="space-y-3">
                {requiredScopes.map((scopeInfo) => (
                  <div key={scopeInfo.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <scopeInfo.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{scopeInfo.name}</p>
                      <p className="text-xs text-muted-foreground">{scopeInfo.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">Required</Badge>
                  </div>
                ))}
              </div>

              {/* Optional Scopes */}
              {optionalScopes.length > 0 && (
                <>
                  <button 
                    onClick={() => setShowAllScopes(!showAllScopes)}
                    className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>Additional permissions ({optionalScopes.length})</span>
                    {showAllScopes ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {showAllScopes && (
                    <div className="space-y-3 animate-fade-in">
                      {optionalScopes.map((scopeInfo) => (
                        <div 
                          key={scopeInfo.id} 
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleOptionalScope(scopeInfo.id)}
                        >
                          <Checkbox 
                            checked={selectedOptionalScopes.includes(scopeInfo.id)}
                            className="mt-1"
                          />
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <scopeInfo.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{scopeInfo.name}</p>
                            <p className="text-xs text-muted-foreground">{scopeInfo.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Verification Notice */}
          {appInfo.verified ? (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Verified by Alsamos Integrity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This app has been reviewed and approved for use with Alsamos accounts.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Unverified Application</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This app hasn't been verified by Alsamos. Only continue if you trust this developer.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12"
              onClick={handleDeny}
              disabled={isLoading || isDenying}
            >
              {isDenying ? (
                <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              ) : (
                "Deny"
              )}
            </Button>
            <Button 
              className="flex-1 h-12"
              onClick={handleAllow}
              disabled={isLoading || isDenying}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Allow"
              )}
            </Button>
          </div>

          {/* Fine Print */}
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              By clicking Allow, you authorize {appInfo.name} to access the permissions listed above.
            </p>
            <a 
              href="/dashboard/apps" 
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Manage your app permissions
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-4 text-sm pt-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Help
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
