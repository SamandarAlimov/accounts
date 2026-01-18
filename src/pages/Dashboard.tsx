import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Smartphone,
  CreditCard,
  ChevronRight,
  Check,
  AlertTriangle,
  Sparkles,
  Lock,
  Key,
  Monitor,
  Tablet,
  RefreshCcw,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [profileRes, securityRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user?.id).maybeSingle(),
        supabase.from("user_security").select("*").eq("user_id", user?.id).maybeSingle(),
      ]);

      setProfile(profileRes.data);
      setSecurity(securityRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return (profile.first_name.charAt(0) + profile.last_name.charAt(0)).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    return user?.email?.split("@")[0] || "User";
  };

  const securityScore = security?.security_score || 50;

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
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Welcome back, {getName()}
          </h1>
          <p className="text-muted-foreground">
            Manage your Alsamos Account settings and connected services.
          </p>
        </div>

        {/* Profile summary card */}
        <div className="glass-card p-6 animate-fade-up delay-100">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Profile photo */}
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-semibold glow-orange-subtle">
                {getInitials()}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-card flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>

            {/* Profile info */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-foreground">
                {profile?.first_name || ""} {profile?.last_name || getName()}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Shield className="h-3 w-3" />
                  {profile?.identity_verified ? "Verified Account" : "Active Account"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                  Alsamos ID: AL-{user?.id?.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Manage button */}
            <Button variant="outline" className="shrink-0" asChild>
              <Link to="/dashboard/personal">
                Manage Account
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Security & Quick actions grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Security score */}
          <div className="glass-card-hover p-6 animate-fade-up delay-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Account Security</h3>
                  <p className="text-sm text-muted-foreground">AI-calculated score</p>
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-foreground">{securityScore}</span>
                <span className="text-sm text-muted-foreground mb-1">/ 100</span>
              </div>
              <Progress value={securityScore} className="h-2" />
              
              {/* Recommendations */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  {security?.two_fa_enabled ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-muted-foreground">
                    {security?.two_fa_enabled ? "2FA enabled" : "Enable 2FA"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {profile?.recovery_email ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-muted-foreground">
                    {profile?.recovery_email ? "Recovery email set" : "Add recovery email"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {security?.passkey_enabled ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-muted-foreground">
                    {security?.passkey_enabled ? "Passkey enabled" : "Set up passkey"}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full mt-4 text-primary" asChild>
              <Link to="/dashboard/security">
                View all recommendations
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Quick actions */}
          <div className="glass-card p-6 animate-fade-up delay-300">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/dashboard/security"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center"
              >
                <Lock className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Change Password</span>
              </Link>
              <Link
                to="/dashboard/security"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center"
              >
                <Key className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Manage 2FA</span>
              </Link>
              <Link
                to="/dashboard/personal"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center"
              >
                <RefreshCcw className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Update Profile</span>
              </Link>
              <Link
                to="/dashboard/security"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center"
              >
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Security Scan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Devices overview */}
        <div className="glass-card p-6 animate-fade-up delay-400">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Active Sessions</h3>
                <p className="text-sm text-muted-foreground">Manage your devices</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/devices">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {[
              { icon: Monitor, name: "This Device", location: "Current Session", current: true },
            ].map((device, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-background">
                  <device.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{device.name}</span>
                    {device.current && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                        Active now
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{device.location}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                  <Link to="/dashboard/devices">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Apps overview */}
        <div className="glass-card p-6 animate-fade-up delay-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Connected Apps</h3>
                <p className="text-sm text-muted-foreground">Third-party integrations</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/apps">
                Manage
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="text-center py-6 text-muted-foreground">
            <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No apps connected yet</p>
            <p className="text-xs mt-1">Authorize third-party apps to access your account</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
