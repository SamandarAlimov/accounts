import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight, Fingerprint, Sparkles, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setStep("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signIn(email, password);

    if (error) {
      setIsLoading(false);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Welcome back to Alsamos!");
    navigate("/dashboard");
  };

  return (
    <AuthLayout 
      title="Sign in to Alsamos Account"
      subtitle="One account for the entire Alsamos ecosystem"
    >
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          {/* AI Assistant hint */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-accent text-sm">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-accent-foreground">
              AI Assistant ready to help with login
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email or Phone
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="username@alsamos.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="text-sm">
            <Link 
              to="/register" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Create an Alsamos Account
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>

          {/* Alternative login methods */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="h-12">
              <Fingerprint className="h-5 w-5 mr-2" />
              Passkey
            </Button>
            <Button type="button" variant="outline" className="h-12">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
                <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.6"/>
                <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.6"/>
                <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.4"/>
              </svg>
              QR Code
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-6">
          {/* User email display */}
          <button
            type="button"
            onClick={() => setStep("email")}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-foreground">{email}</p>
              <p className="text-xs text-muted-foreground">Click to change account</p>
            </div>
          </button>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Keep me signed in
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Security notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Shield className="h-3 w-3" />
            <span>Protected by Alsamos Security</span>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
