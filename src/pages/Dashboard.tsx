import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Smartphone,
  ChevronRight,
  Check,
  AlertTriangle,
  Sparkles,
  Lock,
  Key,
  Monitor,
  RefreshCcw,
  ArrowUpRight,
  Loader2,
  Bell,
  Globe,
  Clock,
  Users,
  Activity,
  Eye,
  Baby,
  Building2,
  Laptop,
  Tablet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [connectedApps, setConnectedApps] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [kidsAccounts, setKidsAccounts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchAllData();

    // Realtime subscriptions
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.new) setProfile(payload.new);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "user_security", filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.new) setSecurity(payload.new);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "user_sessions", filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchSessions();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchNotifications();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "kids_accounts", filter: `parent_id=eq.${user.id}` }, (payload) => {
        fetchKidsAccounts();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "oauth_access_tokens", filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchConnectedApps();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchProfile(),
        fetchSecurity(),
        fetchSessions(),
        fetchConnectedApps(),
        fetchNotifications(),
        fetchKidsAccounts(),
        fetchRecentActivity(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
    if (data) setProfile(data);
  };

  const fetchSecurity = async () => {
    const { data } = await supabase.from("user_security").select("*").eq("user_id", user!.id).maybeSingle();
    if (data) setSecurity(data);
  };

  const fetchSessions = async () => {
    const { data } = await supabase.from("user_sessions").select("*").eq("user_id", user!.id).order("last_active", { ascending: false }).limit(5);
    if (data) setSessions(data);
  };

  const fetchConnectedApps = async () => {
    const { data } = await supabase
      .from("oauth_access_tokens")
      .select("*, oauth_clients(name, logo_url, description)")
      .eq("user_id", user!.id)
      .eq("revoked", false)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setConnectedApps(data);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user!.id).eq("is_read", false).order("created_at", { ascending: false }).limit(5);
    if (data) setNotifications(data);
  };

  const fetchKidsAccounts = async () => {
    const { data } = await supabase.from("kids_accounts").select("*").eq("parent_id", user!.id);
    if (data) setKidsAccounts(data);
  };

  const fetchRecentActivity = async () => {
    const { data } = await supabase.from("api_usage_logs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5);
    if (data) setRecentActivity(data);
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return (profile.first_name.charAt(0) + profile.last_name.charAt(0)).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getName = () => {
    if (profile?.first_name) return profile.first_name;
    return user?.email?.split("@")[0] || "User";
  };

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
    if (profile?.first_name) return profile.first_name;
    return user?.email?.split("@")[0] || "User";
  };

  const securityScore = security?.security_score || 50;

  const getScoreColor = () => {
    if (securityScore >= 80) return "text-green-500";
    if (securityScore >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "mobile": case "phone": return Smartphone;
      case "tablet": return Tablet;
      case "laptop": return Laptop;
      default: return Monitor;
    }
  };

  const profileCompleteness = (() => {
    if (!profile) return 0;
    const fields = ["first_name", "last_name", "email", "phone", "country", "date_of_birth", "avatar_url", "recovery_email"];
    const filled = fields.filter(f => profile[f]).length;
    return Math.round((filled / fields.length) * 100);
  })();

  const securityChecks = [
    { label: "Two-Factor Authentication", done: security?.two_fa_enabled, icon: Shield },
    { label: "Recovery email", done: !!profile?.recovery_email, icon: Key },
    { label: "Passkey", done: security?.passkey_enabled, icon: Lock },
    { label: "Identity verified", done: profile?.identity_verified, icon: Check },
  ];

  const completedChecks = securityChecks.filter(c => c.done).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome & Profile Summary */}
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-semibold">
                  {getInitials()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-[3px] border-card" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{getFullName()}</h1>
                {profile?.identity_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className="text-xs font-mono">
                  AL-{user?.id?.slice(0, 8).toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Member since {user?.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : "recently"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/personal">
                  Edit Profile
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Profile Completeness */}
          {profileCompleteness < 100 && (
            <div className="mt-5 pt-5 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Profile completeness</span>
                <span className="text-sm font-semibold text-primary">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1.5">
                Complete your profile to unlock all features
              </p>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
          <div className="glass-card p-4 text-center">
            <div className={`text-2xl font-bold ${getScoreColor()}`}>{securityScore}</div>
            <p className="text-xs text-muted-foreground mt-1">Security Score</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Sessions</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{connectedApps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Connected Apps</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{notifications.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unread Alerts</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Security Overview */}
          <div className="glass-card p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Security</h3>
                  <p className="text-xs text-muted-foreground">{completedChecks}/{securityChecks.length} checks passed</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor()}`}>{securityScore}</div>
            </div>

            <Progress value={securityScore} className="h-2 mb-4" />

            <div className="space-y-2.5">
              {securityChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {check.done ? (
                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    </div>
                  )}
                  <span className={check.done ? "text-muted-foreground" : "text-foreground font-medium"}>
                    {check.label}
                  </span>
                  {!check.done && (
                    <Button variant="link" size="sm" className="ml-auto h-auto p-0 text-xs text-primary" asChild>
                      <Link to="/dashboard/security">Fix</Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button variant="ghost" className="w-full mt-4 text-primary" size="sm" asChild>
              <Link to="/dashboard/security">
                Security settings
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 animate-fade-up">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: "/dashboard/security", icon: Lock, label: "Change Password" },
                { to: "/dashboard/security", icon: Key, label: "Manage 2FA" },
                { to: "/dashboard/personal", icon: RefreshCcw, label: "Update Profile" },
                { to: "/dashboard/security", icon: Sparkles, label: "Security Scan" },
                { to: "/dashboard/devices", icon: Smartphone, label: "My Devices" },
                { to: "/dashboard/apps", icon: Globe, label: "Connected Apps" },
                { to: "/dashboard/people-sharing", icon: Users, label: "Family" },
                { to: "/dashboard/privacy", icon: Eye, label: "Privacy" },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <action.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Active Sessions</h3>
                <p className="text-xs text-muted-foreground">{sessions.length} device{sessions.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/devices">
                Manage <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {sessions.length === 0 ? (
            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
              <div className="p-2 rounded-lg bg-background"><Monitor className="h-5 w-5 text-foreground" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">This Device</span>
                  <Badge variant="secondary" className="text-[10px] h-5">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Current session</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.device_type);
                return (
                  <div key={session.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-background"><DeviceIcon className="h-5 w-5 text-foreground" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm truncate">{session.device_name}</span>
                        {session.is_current && <Badge variant="secondary" className="text-[10px] h-5">Current</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {[session.browser, session.os, session.location].filter(Boolean).join(" · ") || "Unknown device"}
                        {" · "}
                        {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Connected Apps & Notifications Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Connected Apps */}
          <div className="glass-card p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Connected Apps</h3>
                  <p className="text-xs text-muted-foreground">{connectedApps.length} active</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/apps">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {connectedApps.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No apps connected</p>
                <p className="text-xs text-muted-foreground mt-1">Authorize third-party apps to access your account</p>
              </div>
            ) : (
              <div className="space-y-2">
                {connectedApps.map((app) => (
                  <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      {app.oauth_clients?.logo_url ? (
                        <img src={app.oauth_clients.logo_url} alt="" className="h-5 w-5 rounded" />
                      ) : (
                        <Globe className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{app.oauth_clients?.name || "Unknown App"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{app.scope?.split(" ").length || 0} scopes</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="glass-card p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 relative">
                  <Bell className="h-5 w-5 text-primary" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{notifications.length} unread</p>
                </div>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                      notif.type === "error" ? "bg-destructive" :
                      notif.type === "warning" ? "bg-yellow-500" : "bg-primary"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kids Accounts */}
        {kidsAccounts.length > 0 && (
          <div className="glass-card p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10">
                  <Baby className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Kids Accounts</h3>
                  <p className="text-xs text-muted-foreground">{kidsAccounts.length} managed account{kidsAccounts.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/people-sharing">
                  Manage <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {kidsAccounts.map((kid) => (
                <div key={kid.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 font-semibold">
                    {kid.child_first_name?.charAt(0)}{kid.child_last_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{kid.child_first_name} {kid.child_last_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{kid.child_age} yrs</span>
                      <span>·</span>
                      <span>{kid.screen_time_limit} min/day</span>
                      <span>·</span>
                      <span className="capitalize">{kid.content_filter_level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent API Activity */}
        {recentActivity.length > 0 && (
          <div className="glass-card p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Recent API Activity</h3>
                  <p className="text-xs text-muted-foreground">Latest requests</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/developer">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-2">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm">
                  <Badge variant={log.status_code < 400 ? "secondary" : "destructive"} className="text-[10px] font-mono shrink-0">
                    {log.status_code}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">{log.method}</span>
                  <span className="text-foreground truncate flex-1 font-mono text-xs">{log.endpoint}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
