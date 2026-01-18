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
  Shield
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface StoredAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  type: "personal" | "kids" | "business";
  lastUsed: string;
  isActive: boolean;
}

export default function AccountChooser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OAuth parameters
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope") || "openid profile email";
  const state = searchParams.get("state");
  const responseType = searchParams.get("response_type") || "code";

  // Mock stored accounts - in real app, this would come from local storage or API
  const storedAccounts: StoredAccount[] = [
    {
      id: "1",
      email: "john.doe@alsamos.com",
      name: "John Doe",
      type: "personal",
      lastUsed: "2 hours ago",
      isActive: true
    },
    {
      id: "2",
      email: "j.doe@company.alsamos.com",
      name: "John Doe (Work)",
      type: "business",
      lastUsed: "Yesterday",
      isActive: false
    },
    {
      id: "3",
      email: "timmy@kids.alsamos.com",
      name: "Timmy Doe",
      type: "kids",
      lastUsed: "1 week ago",
      isActive: false
    }
  ];

  const getAccountTypeIcon = (type: StoredAccount["type"]) => {
    const icons = {
      personal: User,
      business: Building2,
      kids: Baby
    };
    return icons[type];
  };

  const getAccountTypeBadge = (type: StoredAccount["type"]) => {
    const config = {
      personal: { label: "Personal", class: "bg-primary/10 text-primary border-primary/20" },
      business: { label: "Business", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      kids: { label: "Kids", class: "bg-green-500/10 text-green-500 border-green-500/20" }
    };
    return config[type];
  };

  const handleAccountSelect = async (account: StoredAccount) => {
    setSelectedAccount(account.id);
    setIsLoading(true);
    
    // Simulate authentication check
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // If OAuth flow, redirect to consent screen
    if (clientId && redirectUri) {
      navigate(`/oauth/consent?${searchParams.toString()}&account_id=${account.id}`);
    } else {
      // Direct login, go to dashboard
      navigate("/dashboard");
    }
  };

  const handleUseAnotherAccount = () => {
    navigate(`/login?${searchParams.toString()}`);
  };

  // If no stored accounts, redirect to login
  useEffect(() => {
    if (storedAccounts.length === 0) {
      navigate(`/login?${searchParams.toString()}`);
    }
  }, []);

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
            {clientId && (
              <p className="text-muted-foreground text-sm">
                to continue to <span className="font-medium text-foreground">{clientId}</span>
              </p>
            )}
          </div>

          {/* Account List */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {storedAccounts.map((account, index) => {
                  const TypeIcon = getAccountTypeIcon(account.type);
                  const typeBadge = getAccountTypeBadge(account.type);
                  const isSelected = selectedAccount === account.id;
                  
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleAccountSelect(account)}
                      disabled={isLoading}
                      className={`w-full flex items-center gap-4 p-4 text-left transition-all hover:bg-muted/50 relative ${
                        isSelected ? 'bg-primary/5' : ''
                      } ${isLoading && !isSelected ? 'opacity-50' : ''}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-border">
                          <AvatarImage src={account.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {account.name.split(' ').map(n => n[0]).join('')}
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
                To continue, Alsamos will share your name, email address, and profile picture with {clientId || "the application"}.
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