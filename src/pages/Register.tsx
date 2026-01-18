import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowRight, Sparkles, Check, X, Shield, Zap, Database, Cloud, GraduationCap, Heart, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { countries } from "@/data/countries";

const ecosystemServices = [
  { icon: GraduationCap, name: "Education", color: "text-blue-500" },
  { icon: Heart, name: "Health", color: "text-red-500" },
  { icon: Wallet, name: "Finance", color: "text-green-500" },
  { icon: Zap, name: "AI", color: "text-primary" },
  { icon: Cloud, name: "Cloud", color: "text-cyan-500" },
  { icon: Database, name: "Data", color: "text-purple-500" },
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"info" | "security">("info");

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Password strength checker
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setStep("security");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please create a password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength < 4) {
      toast.error("Please create a stronger password");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, {
      first_name: formData.firstName,
      last_name: formData.lastName,
    });

    if (error) {
      setIsLoading(false);
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Welcome to the Alsamos ecosystem!");
    navigate("/dashboard");
  };

  return (
    <AuthLayout 
      title="Create your Alsamos Account"
      subtitle="One account for the entire Alsamos ecosystem"
    >
      {step === "info" ? (
        <form onSubmit={handleInfoSubmit} className="space-y-6">
          {/* Ecosystem preview */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/30 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Get access to all Alsamos services
            </p>
            <div className="flex justify-center gap-4">
              {ecosystemServices.map((service) => (
                <div 
                  key={service.name}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`p-2 rounded-lg bg-background ${service.color}`}>
                    <service.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{service.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="username@alsamos.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-medium">
              Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-foreground font-medium">
              Country
            </Label>
            <Select value={formData.country} onValueChange={(value) => updateField("country", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign in
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-6">
          {/* AI Security hint */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-accent text-sm">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-accent-foreground">
              AI is analyzing password strength
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Create Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
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

            {/* Password strength indicator */}
            {formData.password && (
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
                      className={`flex items-center gap-1 ${
                        valid ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      {valid ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span className="capitalize">
                        {key === "length" ? "8+ characters" : key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className="h-12"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="h-3 w-3" />
                Passwords do not match
              </p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => updateField("agreeTerms", checked as boolean)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </Label>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep("info")}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Shield className="h-3 w-3" />
            <span>Your data is encrypted and secure</span>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
