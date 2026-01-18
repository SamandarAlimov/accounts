import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
  Loader2
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
  
  const [security, setSecurity] = useState({
    two_fa_enabled: false,
    two_fa_method: null as string | null,
    passkey_enabled: false,
    recovery_codes: [] as string[],
    security_score: 50,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password strength checks
  const passwordChecks = {
    length: passwordForm.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordForm.newPassword),
    lowercase: /[a-z]/.test(passwordForm.newPassword),
    number: /[0-9]/.test(passwordForm.newPassword),
    special: /[!@#$%^&*]/.test(passwordForm.newPassword),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  useEffect(() => {
    if (user) fetchSecurity();
  }, [user]);

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
        });
      }
    } catch (error) {
      console.error("Error fetching security:", error);
    } finally {
      setLoading(false);
    }
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

      // Update security score
      await supabase
        .from("user_security")
        .update({ 
          last_password_change: new Date().toISOString(),
          security_score: Math.min(security.security_score + 10, 100)
        })
        .eq("user_id", user?.id);

      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const toggle2FA = async (enabled: boolean) => {
    try {
      await supabase
        .from("user_security")
        .update({ 
          two_fa_enabled: enabled,
          two_fa_method: enabled ? "authenticator" : null,
          security_score: enabled ? Math.min(security.security_score + 20, 100) : Math.max(security.security_score - 20, 0)
        })
        .eq("user_id", user?.id);

      setSecurity(prev => ({ 
        ...prev, 
        two_fa_enabled: enabled,
        two_fa_method: enabled ? "authenticator" : null 
      }));
      toast.success(enabled ? "2FA enabled" : "2FA disabled");
    } catch (error) {
      toast.error("Failed to update 2FA settings");
    }
  };

  const togglePasskey = async (enabled: boolean) => {
    try {
      await supabase
        .from("user_security")
        .update({ 
          passkey_enabled: enabled,
          security_score: enabled ? Math.min(security.security_score + 15, 100) : Math.max(security.security_score - 15, 0)
        })
        .eq("user_id", user?.id);

      setSecurity(prev => ({ ...prev, passkey_enabled: enabled }));
      toast.success(enabled ? "Passkey enabled" : "Passkey disabled");
    } catch (error) {
      toast.error("Failed to update passkey settings");
    }
  };

  const generateRecoveryCodes = async () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    try {
      await supabase
        .from("user_security")
        .update({ recovery_codes: codes })
        .eq("user_id", user?.id);

      setSecurity(prev => ({ ...prev, recovery_codes: codes }));
      setShowRecoveryCodes(true);
      toast.success("Recovery codes generated");
    } catch (error) {
      toast.error("Failed to generate recovery codes");
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(security.recovery_codes.join("\n"));
    toast.success("Recovery codes copied to clipboard");
  };

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
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Security</h1>
          <p className="text-muted-foreground">
            Manage your security settings and protect your account.
          </p>
        </div>

        {/* Security Score */}
        <div className="glass-card p-6 animate-fade-up delay-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Security Score</h2>
                <p className="text-sm text-muted-foreground">AI-calculated based on your settings</p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-foreground">{security.security_score}</span>
              <span className="text-sm text-muted-foreground mb-1">/ 100</span>
            </div>
            <Progress value={security.security_score} className="h-2" />
          </div>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6 animate-fade-up delay-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Change Password</h2>
              <p className="text-sm text-muted-foreground">Update your password regularly for better security</p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {passwordForm.newPassword && (
                <div className="space-y-2 mt-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength >= level
                            ? passwordStrength <= 2
                              ? "bg-destructive"
                              : passwordStrength <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(passwordChecks).map(([key, valid]) => (
                      <div
                        key={key}
                        className={`flex items-center gap-1 ${valid ? "text-green-600" : "text-muted-foreground"}`}
                      >
                        {valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span className="capitalize">{key === "length" ? "8+ characters" : key}</span>
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
                  <X className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
            </div>

            <Button 
              onClick={handlePasswordChange} 
              disabled={changingPassword || passwordStrength < 4}
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="glass-card p-6 animate-fade-up delay-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Switch
              checked={security.two_fa_enabled}
              onCheckedChange={toggle2FA}
            />
          </div>

          {security.two_fa_enabled && (
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>2FA is enabled via {security.two_fa_method || "authenticator app"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Passkey */}
        <div className="glass-card p-6 animate-fade-up delay-400">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Fingerprint className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Passkey</h2>
                <p className="text-sm text-muted-foreground">Sign in with biometrics or device PIN</p>
              </div>
            </div>
            <Switch
              checked={security.passkey_enabled}
              onCheckedChange={togglePasskey}
            />
          </div>
        </div>

        {/* Recovery Codes */}
        <div className="glass-card p-6 animate-fade-up delay-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Recovery Codes</h2>
              <p className="text-sm text-muted-foreground">Backup codes for account recovery</p>
            </div>
          </div>

          {security.recovery_codes.length > 0 && showRecoveryCodes ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted font-mono text-sm grid grid-cols-2 gap-2">
                {security.recovery_codes.map((code, i) => (
                  <div key={i} className="px-3 py-1.5 rounded bg-background">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={copyRecoveryCodes}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Codes
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowRecoveryCodes(false)}>
                  Hide Codes
                </Button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-600">
                  Store these codes securely. Each code can only be used once.
                </p>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={generateRecoveryCodes}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              {security.recovery_codes.length > 0 ? "Show Recovery Codes" : "Generate Recovery Codes"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
