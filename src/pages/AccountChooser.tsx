import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlsamosLogo } from "@/components/AlsamosLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  UserPlus, 
  ChevronRight, 
  Building2, 
  Baby, 
  User,
  Check,
  Shield,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AccountData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  type: "personal" | "kids" | "business";
  isActive: boolean;
  lastActive?: string;
}

export default function AccountChooser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);

  // OAuth parameters
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const continueUrl = searchParams.get("continue");

  // Fetch real accounts from profiles table
  useEffect(() => {
    if (!user) {
      setFetchingAccounts(false);
      return;
    }

    const fetchAccounts = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        const firstName = profile.first_name || "";
        const lastName = profile.last_name || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.email || "User";
        const email = profile.email || user.email || "";

        // Determine account type based on email domain
        let type: AccountData["type"] = "personal";
        if (email.includes("@kids.alsamos.com")) type = "kids";
        else if (email.includes("company") || email.includes("business")) type = "business";

        const account: AccountData = {
          id: profile.user_id,
          email,
          name: fullName,
          avatar: profile.avatar_url || undefined,
          type,
          isActive: true,
        };
        setAccounts([account]);
      } else {
        // Fallback: use auth user data
        setAccounts([{
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.first_name
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`.trim()
            : user.email || "User",
          type: "personal",
          isActive: true,
        }]);
      }
      setFetchingAccounts(false);
    };

    fetchAccounts();

    // Realtime subscription for profile changes
    const channel = supabase
      .channel("account-chooser-profiles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const p = payload.new as any;
            const firstName = p.first_name || "";
            const lastName = p.last_name || "";
            const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.email || "User";
            const email = p.email || user.email || "";

            let type: AccountData["type"] = "personal";
            if (email.includes("@kids.alsamos.com")) type = "kids";
            else if (email.includes("company") || email.includes("business")) type = "business";

            setAccounts((prev) => {
              const existing = prev.find((a) => a.id === p.user_id);
              const updated: AccountData = {
                id: p.user_id,
                email,
                name: fullName,
                avatar: p.avatar_url || undefined,
                type,
                isActive: true,
              };
              if (existing) {
                return prev.map((a) => (a.id === p.user_id ? updated : a));
              }
              return [...prev, updated];
            });
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as any;
            setAccounts((prev) => prev.filter((a) => a.id !== old.user_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getAccountTypeIcon = (type: AccountData["type"]) => {
    const icons = { personal: User, business: Building2, kids: Baby };
    return icons[type];
  };

  const getAccountTypeBadge = (type: AccountData["type"]) => {
    const config = {
      personal: { label: "Personal", class: "bg-primary/10 text-primary border-primary/20" },
      business: { label: "Business", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      kids: { label: "Kids", class: "bg-green-500/10 text-green-500 border-green-500/20" },
    };
    return config[type];
  };

  const handleAccountSelect = async (account: AccountData) => {
    setSelectedAccount(account.id);
    setIsLoading(true);

    // If OAuth flow, redirect to consent screen
    if (clientId && redirectUri) {
      navigate(`/oauth/consent?${searchParams.toString()}&account_id=${account.id}`);
    } else if (continueUrl) {
      // Simple cross-site redirect (e.g., from social.alsamos.com)
      try {
        const url = new URL(continueUrl);
        // Set session token as hash param for the target site to pick up
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          url.searchParams.set("access_token", session.access_token);
          url.searchParams.set("refresh_token", session.refresh_token || "");
        }
        window.location.href = url.toString();
      } catch {
        // Invalid URL, fallback to dashboard
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  const handleUseAnotherAccount = () => {
    navigate(`/login?${searchParams.toString()}`);
  };

  // If not logged in and no accounts, redirect to login
  useEffect(() => {
    if (!fetchingAccounts && accounts.length === 0 && !user) {
      navigate(`/login?${searchParams.toString()}`);
    }
  }, [fetchingAccounts, accounts, user]);

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
        <div className="w-full max-w-md space-y-6 animate-fade-up">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Choose an account</h1>
            {(clientId || continueUrl) && (
              <p className="text-muted-foreground text-sm">
                to continue to <span className="font-medium text-foreground">
                  {clientId || (() => { try { return new URL(continueUrl!).hostname; } catch { return continueUrl; } })()}
                </span>
              </p>
            )}
          </div>

          {/* Account List */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              {fetchingAccounts ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {accounts.map((account, index) => {
                    const TypeIcon = getAccountTypeIcon(account.type);
                    const typeBadge = getAccountTypeBadge(account.type);
                    const isSelected = selectedAccount === account.id;

                    return (
                      <button
                        key={account.id}
                        onClick={() => handleAccountSelect(account)}
                        disabled={isLoading}
                        className={`w-full flex items-center gap-4 p-4 text-left transition-all hover:bg-muted/50 relative ${
                          isSelected ? "bg-primary/5" : ""
                        } ${isLoading && !isSelected ? "opacity-50" : ""}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Avatar */}
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-border">
                            <AvatarImage src={account.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {account.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {account.isActive && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Account Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">{account.name}</p>
                            <Badge variant="outline" className={`${typeBadge.class} text-xs shrink-0`}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{account.email}</p>
                          {account.isActive && (
                            <p className="text-xs text-green-500 mt-0.5">Signed in</p>
                          )}
                        </div>

                        {/* Arrow / Loading */}
                        <div className="shrink-0">
                          {isSelected && isLoading ? (
                            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Use Another Account */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              <button
                onClick={handleUseAnotherAccount}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 text-left transition-all hover:bg-muted/50"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Use another account</p>
                  <p className="text-sm text-muted-foreground">Sign in with a different Alsamos account</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                To continue, Alsamos will share your name, email address, and profile picture with{" "}
                {clientId || "the application"}.
              </p>
              <a href="#" className="text-sm text-primary hover:underline mt-1 inline-block">
                Learn more about this app
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-4 text-sm">
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
