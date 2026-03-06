import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Copy, 
  RefreshCcw,
  Fingerprint,
  AlertTriangle,
  Sparkles,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Monitor,
  ChevronRight,
  Info
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Security() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  const [security, setSecurity] = useState({
    two_fa_enabled: false,
    two_fa_method: null as string | null,
    passkey_enabled: false,
    recovery_codes: [] as string[],
    security_score: 50,
    last_password_change: null as string | null,
  });

  const [activeSessions, setActiveSessions] = useState(0);
  const [profileComplete, setProfileComplete] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const passwordChecks = {
    length: passwordForm.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordForm.newPassword),
    lowercase: /[a-z]/.test(passwordForm.newPassword),
    number: /[0-9]/.test(passwordForm.newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return { label: "Very Weak", color: "text-destructive" };
    if (passwordStrength <= 2) return { label: "Weak", color: "text-destructive" };
    if (passwordStrength <= 3) return { label: "Fair", color: "text-yellow-500" };
    if (passwordStrength <= 4) return { label: "Strong", color: "text-green-500" };
    return { label: "Very Strong", color: "text-green-600" };
  };

  const getScoreColor = () => {
    if (security.security_score >= 80) return "text-green-500";
    if (security.security_score >= 50) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreIcon = () => {
    if (security.security_score >= 80) return <ShieldCheck className="h-6 w-6 text-green-500" />;
    if (security.security_score >= 50) return <Shield className="h-6 w-6 text-yellow-500" />;
    return <ShieldAlert className="h-6 w-6 text-destructive" />;
  };

  const getScoreLabel = () => {
    if (security.security_score >= 80) return "Excellent";
    if (security.security_score >= 60) return "Good";
    if (security.security_score >= 40) return "Fair";
    return "Needs Improvement";
  };

  useEffect(() => {
    if (!user) return;

    fetchAllData();

    // Realtime subscription for user_security
    const securityChannel = supabase
      .channel('security-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_security',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'user_id' in payload.new) {
          const data = payload.new as any;
          setSecurity({
            two_fa_enabled: data.two_fa_enabled || false,
            two_fa_method: data.two_fa_method,
            passkey_enabled: data.passkey_enabled || false,
            recovery_codes: data.recovery_codes || [],
            security_score: data.security_score || 50,
            last_password_change: data.last_password_change,
          });
        }
      })
      .subscribe();

    // Realtime for sessions count
    const sessionsChannel = supabase
      .channel('security-sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_sessions',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchSessionCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(securityChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, [user]);

  const fetchAllData = async () => {
    await Promise.all([fetchSecurity(), fetchSessionCount(), fetchProfileStatus()]);
    setLoading(false);
  };

  const fetchSecurity = async () => {
    try {
      const { data, error } = await supabase
        .from("user_security")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSecurity({
          two_fa_enabled: data.two_fa_enabled || false,
          two_fa_method: data.two_fa_method,
          passkey_enabled: data.passkey_enabled || false,
          recovery_codes: data.recovery_codes || [],
          security_score: data.security_score || 50,
          last_password_change: data.last_password_change,
        });
      }
    } catch (error) {
      console.error("Error fetching security:", error);
    }
  };

  const fetchSessionCount = async () => {
    try {
      const { count } = await supabase
        .from("user_sessions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user?.id);
      setActiveSessions(count || 0);
    } catch {}
  };

  const fetchProfileStatus = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, phone, date_of_birth, country, identity_verified")
        .eq("user_id", user?.id)
        .maybeSingle();
      if (data) {
        setProfileComplete(!!(data.first_name && data.phone && data.date_of_birth));
      }
    } catch {}
  };

  const recalculateScore = () => {
    let score = 20; // Base score for having an account
    if (security.two_fa_enabled) score += 25;
    if (security.passkey_enabled) score += 20;
    if (security.recovery_codes.length > 0) score += 10;
    if (security.last_password_change) {
      const daysSince = Math.floor((Date.now() - new Date(security.last_password_change).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 90) score += 15;
      else if (daysSince < 180) score += 10;
      else score += 5;
    }
    if (profileComplete) score += 10;
    return Math.min(score, 100);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordStrength < 4) {
      toast.error("Please create a stronger password");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;

      const newScore = recalculateScore();
      await supabase
        .from("user_security")
        .update({ 
          last_password_change: new Date().toISOString(),
          security_score: Math.max(newScore, security.security_score)
        })
        .eq("user_id", user?.id);

      toast.success("Password updated successfully");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const toggle2FA = async (enabled: boolean) => {
    try {
      const newScore = enabled 
        ? Math.min(security.security_score + 25, 100)
        : Math.max(security.security_score - 25, 0);

      const { error } = await supabase
        .from("user_security")
        .update({ 
          two_fa_enabled: enabled,
          two_fa_method: enabled ? "authenticator" : null,
          security_score: newScore
        })
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success(enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
    } catch (error) {
      toast.error("Failed to update 2FA settings");
    }
  };

  const togglePasskey = async (enabled: boolean) => {
    try {
      const newScore = enabled
        ? Math.min(security.security_score + 20, 100)
        : Math.max(security.security_score - 20, 0);

      const { error } = await supabase
        .from("user_security")
        .update({ 
          passkey_enabled: enabled,
          security_score: newScore
        })
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success(enabled ? "Passkey authentication enabled" : "Passkey authentication disabled");
    } catch (error) {
      toast.error("Failed to update passkey settings");
    }
  };

  const generateRecoveryCodes = async () => {
    setGeneratingCodes(true);
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 6).toUpperCase() + "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );

    try {
      const { error } = await supabase
        .from("user_security")
        .update({ recovery_codes: codes })
        .eq("user_id", user?.id);

      if (error) throw error;
      setShowRecoveryCodes(true);
      toast.success("New recovery codes generated");
    } catch (error) {
      toast.error("Failed to generate recovery codes");
    } finally {
      setGeneratingCodes(false);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(security.recovery_codes.join("\n"));
    toast.success("Recovery codes copied to clipboard");
  };

  const getTimeSince = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  // Security recommendations
  const recommendations = [
    { 
      id: "2fa", 
      label: "Enable two-factor authentication", 
      done: security.two_fa_enabled,
      icon: Smartphone,
      impact: "High"
    },
    { 
      id: "passkey", 
      label: "Set up passkey authentication", 
      done: security.passkey_enabled,
      icon: Fingerprint,
      impact: "High"
    },
    { 
      id: "recovery", 
      label: "Generate recovery codes", 
      done: security.recovery_codes.length > 0,
      icon: Key,
      impact: "Medium"
    },
    { 
      id: "password", 
      label: "Update password recently", 
      done: security.last_password_change ? (Date.now() - new Date(security.last_password_change).getTime()) < 90 * 24 * 60 * 60 * 1000 : false,
      icon: Lock,
      impact: "Medium"
    },
  ];

  const completedRecommendations = recommendations.filter(r => r.done).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-1">Security</h1>
          <p className="text-muted-foreground">
            Settings and recommendations to help you keep your account secure
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up">
          {/* Security Score Card */}
          <div className="glass-card p-5 flex flex-col items-center text-center">
            <div className="mb-3">{getScoreIcon()}</div>
            <div className={`text-3xl font-bold ${getScoreColor()}`}>
              {security.security_score}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Security Score</p>
            <span className={`text-xs font-medium mt-2 px-2.5 py-0.5 rounded-full ${
              security.security_score >= 80 ? "bg-green-500/10 text-green-600" :
              security.security_score >= 50 ? "bg-yellow-500/10 text-yellow-600" :
              "bg-destructive/10 text-destructive"
            }`}>
              {getScoreLabel()}
            </span>
          </div>

          {/* Active Sessions */}
          <div className="glass-card p-5 flex flex-col items-center text-center">
            <div className="mb-3">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Sessions</p>
            <span className="text-xs font-medium mt-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {activeSessions <= 1 ? "Secure" : `${activeSessions} devices`}
            </span>
          </div>

          {/* Recommendations */}
          <div className="glass-card p-5 flex flex-col items-center text-center">
            <div className="mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {completedRecommendations}/{recommendations.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
            <Progress value={(completedRecommendations / recommendations.length) * 100} className="h-1.5 mt-3 w-full" />
          </div>
        </div>

        {/* Security Recommendations */}
        {completedRecommendations < recommendations.length && (
          <div className="glass-card p-6 animate-fade-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Security Recommendations</h2>
                <p className="text-sm text-muted-foreground">
                  {recommendations.length - completedRecommendations} action{recommendations.length - completedRecommendations > 1 ? "s" : ""} to improve your security
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {recommendations.filter(r => !r.done).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <rec.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{rec.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rec.impact === "High" ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-600"
                    }`}>
                      {rec.impact}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change Password */}
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Password</h2>
                <p className="text-sm text-muted-foreground">
                  {security.last_password_change 
                    ? `Last changed ${getTimeSince(security.last_password_change)}`
                    : "Set a strong password for your account"
                  }
                </p>
              </div>
            </div>
            {!showPasswordSection && (
              <Button variant="outline" size="sm" onClick={() => setShowPasswordSection(true)}>
                Change
              </Button>
            )}
          </div>

          {showPasswordSection && (
            <div className="mt-6 space-y-4 max-w-md border-t border-border pt-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {passwordForm.newPassword && (
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-1 mr-3">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength >= level
                                ? passwordStrength <= 2 ? "bg-destructive"
                                : passwordStrength <= 3 ? "bg-yellow-500"
                                : "bg-green-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${getStrengthLabel().color}`}>
                        {getStrengthLabel().label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {Object.entries(passwordChecks).map(([key, valid]) => (
                        <div
                          key={key}
                          className={`flex items-center gap-1.5 transition-colors ${valid ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {valid ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
                          <span>{key === "length" ? "8+ characters" : key === "special" ? "Special char" : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" /> Passwords do not match
                  </p>
                )}
                {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword.length > 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={changingPassword || passwordStrength < 4 || passwordForm.newPassword !== passwordForm.confirmPassword}
                >
                  {changingPassword ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating...</>
                  ) : "Update Password"}
                </Button>
                <Button variant="ghost" onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordForm({ newPassword: "", confirmPassword: "" });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Switch
              checked={security.two_fa_enabled}
              onCheckedChange={toggle2FA}
            />
          </div>

          {security.two_fa_enabled && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm text-green-700 font-medium">2FA is active</p>
                  <p className="text-xs text-green-600/80">Using {security.two_fa_method || "authenticator app"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  You'll be asked for a verification code each time you sign in on a new device.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Passkey */}
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Fingerprint className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Passkey</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in with fingerprint, face recognition, or device PIN
                </p>
              </div>
            </div>
            <Switch
              checked={security.passkey_enabled}
              onCheckedChange={togglePasskey}
            />
          </div>

          {security.passkey_enabled && (
            <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
              <div>
                <p className="text-sm text-green-700 font-medium">Passkey is active</p>
                <p className="text-xs text-green-600/80">Biometric authentication enabled</p>
              </div>
            </div>
          )}
        </div>

        {/* Recovery Codes */}
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Recovery Codes</h2>
              <p className="text-sm text-muted-foreground">
                {security.recovery_codes.length > 0 
                  ? `${security.recovery_codes.length} codes available`
                  : "Generate backup codes for account recovery"
                }
              </p>
            </div>
          </div>

          {security.recovery_codes.length > 0 && showRecoveryCodes ? (
            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-muted font-mono text-sm grid grid-cols-2 gap-2">
                {security.recovery_codes.map((code, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-background text-center text-foreground tracking-wider text-xs">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={copyRecoveryCodes}>
                  <Copy className="h-4 w-4 mr-2" /> Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowRecoveryCodes(false)}>
                  <EyeOff className="h-4 w-4 mr-2" /> Hide
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <RefreshCcw className="h-4 w-4 mr-2" /> Regenerate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Regenerate Recovery Codes?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will invalidate all existing recovery codes. Make sure to save the new ones.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={generateRecoveryCodes}>
                        Regenerate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-700">
                  Store these codes in a secure location. Each code can only be used once. If you lose access to your authenticator, you can use these codes to sign in.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              {security.recovery_codes.length > 0 ? (
                <Button variant="outline" onClick={() => setShowRecoveryCodes(true)}>
                  <Eye className="h-4 w-4 mr-2" /> Show Recovery Codes
                </Button>
              ) : (
                <Button variant="outline" onClick={generateRecoveryCodes} disabled={generatingCodes}>
                  {generatingCodes ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
                  ) : (
                    <><Key className="h-4 w-4 mr-2" /> Generate Recovery Codes</>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Recent Security Activity */}
        <div className="glass-card p-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Security Activity</h2>
              <p className="text-sm text-muted-foreground">Recent changes to your security settings</p>
            </div>
          </div>
          <div className="space-y-3">
            {security.last_password_change && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">Password changed</p>
                  <p className="text-xs text-muted-foreground">{getTimeSince(security.last_password_change)}</p>
                </div>
              </div>
            )}
            {security.two_fa_enabled && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Smartphone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">Two-factor authentication enabled</p>
                  <p className="text-xs text-muted-foreground">Via {security.two_fa_method || "authenticator"}</p>
                </div>
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              </div>
            )}
            {security.passkey_enabled && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Fingerprint className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">Passkey authentication enabled</p>
                  <p className="text-xs text-muted-foreground">Biometric sign-in active</p>
                </div>
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              </div>
            )}
            {security.recovery_codes.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">Recovery codes generated</p>
                  <p className="text-xs text-muted-foreground">{security.recovery_codes.length} codes available</p>
                </div>
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              </div>
            )}
            {!security.last_password_change && !security.two_fa_enabled && !security.passkey_enabled && security.recovery_codes.length === 0 && (
              <div className="text-center py-6">
                <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No recent security activity</p>
                <p className="text-xs text-muted-foreground mt-1">Enable security features above to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
