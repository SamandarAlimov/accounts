import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlsamosLogo } from "./AlsamosLogo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationCenter } from "./NotificationCenter";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
  Home,
  User,
  Shield,
  Smartphone,
  Key,
  CreditCard,
  Database,
  Users,
  AppWindow,
  Code,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: User, label: "Personal Info", path: "/dashboard/personal" },
  { icon: Shield, label: "Security", path: "/dashboard/security" },
  { icon: Smartphone, label: "Devices", path: "/dashboard/devices" },
  { icon: Key, label: "Password Manager", path: "/dashboard/passwords" },
  { icon: CreditCard, label: "Payments", path: "/dashboard/payments" },
  { icon: Database, label: "Data & Privacy", path: "/dashboard/privacy" },
  { icon: Users, label: "People & Sharing", path: "/dashboard/people" },
  { icon: AppWindow, label: "Connected Apps", path: "/dashboard/apps" },
  { icon: Code, label: "Developer Access", path: "/dashboard/developer" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, email')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile?.email || user?.email || "User";
  };

  const currentPage = navItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Enhanced */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <Link to="/dashboard" className="flex items-center gap-3">
              <AlsamosLogo size="sm" />
            </Link>
            
            <div className="hidden md:flex items-center">
              <span className="text-border mx-3">/</span>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span>Account</span>
                {currentPage && currentPage.path !== "/dashboard" && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{currentPage.label}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center - Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                placeholder="Search settings, security, apps..."
                className="pl-10 pr-20 h-10 bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border/50">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">AI</span>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <ThemeToggle />
            
            <NotificationCenter />
            
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <HelpCircle className="h-5 w-5" />
            </Button>
            
            {/* User menu - Enhanced */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10 px-2 ml-1">
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{getDisplayName()}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Quick Access
                </DropdownMenuLabel>
                
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/personal")}>
                  <User className="h-4 w-4 mr-2" />
                  Personal Info
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/security")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="text-muted-foreground">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Alsamos Ecosystem
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                className="pl-10 h-10 bg-muted/50 border-0"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border/50 pt-16 transition-transform duration-300 lg:translate-x-0 lg:static lg:pt-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <nav className="p-4 space-y-1 h-[calc(100vh-4rem)] overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container max-w-5xl py-8 px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
