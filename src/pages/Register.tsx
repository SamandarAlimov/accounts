import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Check, X, Shield, Loader2,
  Mail, Phone, User, Calendar, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Step = "name" | "username" | "basicInfo" | "phone" | "password" | "review";

const STEPS: Step[] = ["name", "username", "basicInfo", "phone", "password", "review"];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function generateUsernameSuggestions(firstName: string, lastName: string): string[] {
  const f = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const l = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!f) return [];

  const suggestions: string[] = [];
  if (l) {
    suggestions.push(`${f}.${l}`);
    suggestions.push(`${f}${l}`);
    suggestions.push(`${f}.${l.charAt(0)}`);
  } else {
    suggestions.push(f);
    suggestions.push(`${f}${Math.floor(Math.random() * 99) + 1}`);
    suggestions.push(`${f}.user`);
  }
  return suggestions;
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const continueUrl = searchParams.get("continue");
  const { signUp } = useAuth();

  const [step, setStep] = useState<Step>("name");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameMode, setUsernameMode] = useState<"suggested" | "custom">("suggested");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    customUsername: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    gender: "",
    phone: "",
    phoneCode: "+1",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const usernameSuggestions = useMemo(
    () => generateUsernameSuggestions(formData.firstName, formData.lastName),
    [formData.firstName, formData.lastName]
  );

  // Auto-select first suggestion
  useEffect(() => {
    if (usernameSuggestions.length > 0 && usernameMode === "suggested" && !formData.username) {
      updateField("username", usernameSuggestions[0]);
    }
  }, [usernameSuggestions]);

  const finalUsername = usernameMode === "custom" ? formData.customUsername : formData.username;
  const alsamosEmail = finalUsername ? `${finalUsername}@alsamos.com` : "";
  const alsamosMail = finalUsername ? `${finalUsername}@mail.alsamos.com` : "";

  const currentStepIndex = STEPS.indexOf(step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Password strength
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  // Step validations
  const handleNameNext = () => {
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    goNext();
  };

  const handleUsernameNext = () => {
    const uname = usernameMode === "custom" ? formData.customUsername : formData.username;
    if (!uname || uname.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-z0-9._]+$/.test(uname)) {
      toast.error("Username can only contain lowercase letters, numbers, dots and underscores");
      return;
    }
    goNext();
  };

  const handleBasicInfoNext = () => {
    if (!formData.birthMonth || !formData.birthDay || !formData.birthYear) {
      toast.error("Please enter your birthday");
      return;
    }
    if (!formData.gender) {
      toast.error("Please select your gender");
      return;
    }
    goNext();
  };

  const handlePhoneNext = () => {
    // Phone is optional — can skip
    goNext();
  };

  const handlePasswordNext = () => {
    if (!formData.password) {
      toast.error("Please create a password");
      return;
    }
    if (passwordStrength < 4) {
      toast.error("Please create a stronger password");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    goNext();
  };

  const handleCreateAccount = async () => {
    if (!formData.agreeTerms) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    setIsLoading(true);

    const birthday = `${formData.birthYear}-${String(months.indexOf(formData.birthMonth) + 1).padStart(2, "0")}-${String(Number(formData.birthDay)).padStart(2, "0")}`;

    const { error } = await signUp(alsamosEmail, formData.password, {
      first_name: formData.firstName,
      last_name: formData.lastName || undefined,
    });

    if (error) {
      setIsLoading(false);
      if (error.message.includes("already registered")) {
        toast.error("This username is already taken. Please go back and choose another.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Update profile with additional info after signup
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("profiles").update({
        date_of_birth: birthday,
        gender: formData.gender,
        phone: formData.phone ? `${formData.phoneCode}${formData.phone}` : null,
      }).eq("user_id", session.user.id);
    }

    toast.success(
      "Your Alsamos Account has been created! Your Alsamos Mail is ready.",
      { duration: 5000 }
    );

    if (continueUrl) {
      try {
        const url = new URL(continueUrl);
        if (session?.access_token) {
          url.searchParams.set("access_token", session.access_token);
          url.searchParams.set("refresh_token", session.refresh_token || "");
        }
        window.location.href = url.toString();
        return;
      } catch { /* fallback */ }
    }
    navigate("/dashboard");
  };

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => String(currentYear - i));

  const stepTitle: Record<Step, string> = {
    name: "Create your Alsamos Account",
    username: "Choose your username",
    basicInfo: "Basic information",
    phone: "Add phone number",
    password: "Create a secure password",
    review: "Review and create",
  };

  const stepSubtitle: Record<Step, string> = {
    name: "Enter your name to get started",
    username: "This will be your Alsamos ID and email address",
    basicInfo: "Enter your birthday and gender",
    phone: "For account recovery and security (optional)",
    password: "Use 8+ characters with a mix of letters, numbers & symbols",
    review: "Almost done! Review your information",
  };

  return (
    <AuthLayout title={stepTitle[step]} subtitle={stepSubtitle[step]}>
      {/* Progress bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-1" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Step {currentStepIndex + 1} of {STEPS.length}
        </p>
      </div>

      {/* STEP 1: Name */}
      {step === "name" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground font-medium">
              First name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground font-medium">
              Last name <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              to={`/login${continueUrl ? `?continue=${encodeURIComponent(continueUrl)}` : ""}`}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in instead
            </Link>
            <Button onClick={handleNameNext} size="lg">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Username */}
      {step === "username" && (
        <div className="space-y-5 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Your username creates your Alsamos email address
          </p>

          {/* Suggested usernames */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Choose a username</Label>
            <RadioGroup
              value={usernameMode === "suggested" ? formData.username : "__custom__"}
              onValueChange={(val) => {
                if (val === "__custom__") {
                  setUsernameMode("custom");
                } else {
                  setUsernameMode("suggested");
                  updateField("username", val);
                }
              }}
              className="space-y-2"
            >
              {usernameSuggestions.map((suggestion) => (
                <label
                  key={suggestion}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    usernameMode === "suggested" && formData.username === suggestion
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/40"
                  }`}
                >
                  <RadioGroupItem value={suggestion} />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{suggestion}</span>
                    <span className="text-muted-foreground">@alsamos.com</span>
                  </div>
                </label>
              ))}

              {/* Custom option */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  usernameMode === "custom"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/40"
                }`}
              >
                <RadioGroupItem value="__custom__" />
                <span className="font-medium text-foreground">Create your own</span>
              </label>
            </RadioGroup>

            {usernameMode === "custom" && (
              <div className="flex items-center gap-0 mt-2">
                <Input
                  placeholder="username"
                  value={formData.customUsername}
                  onChange={(e) => updateField("customUsername", e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                  className="rounded-r-none border-r-0"
                  autoFocus
                />
                <div className="h-12 px-3 flex items-center bg-muted border border-input rounded-r-xl text-sm text-muted-foreground whitespace-nowrap">
                  @alsamos.com
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {finalUsername && (
            <div className="p-3 rounded-xl bg-accent/50 border border-accent space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">{alsamosEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Alsamos Mail: <span className="text-foreground font-medium">{alsamosMail}</span>
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleUsernameNext} size="lg">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Basic Info */}
      {step === "basicInfo" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Birthday
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={formData.birthMonth} onValueChange={(v) => updateField("birthMonth", v)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formData.birthDay} onValueChange={(v) => updateField("birthDay", v)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formData.birthYear} onValueChange={(v) => updateField("birthYear", v)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Gender
            </Label>
            <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Rather not say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 flex justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleBasicInfoNext} size="lg">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Phone */}
      {step === "phone" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone number
            </Label>
            <div className="flex gap-2">
              <Select value={formData.phoneCode} onValueChange={(v) => updateField("phoneCode", v)}>
                <SelectTrigger className="h-12 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+44">+44</SelectItem>
                  <SelectItem value="+998">+998</SelectItem>
                  <SelectItem value="+7">+7</SelectItem>
                  <SelectItem value="+82">+82</SelectItem>
                  <SelectItem value="+86">+86</SelectItem>
                  <SelectItem value="+91">+91</SelectItem>
                  <SelectItem value="+90">+90</SelectItem>
                  <SelectItem value="+49">+49</SelectItem>
                  <SelectItem value="+33">+33</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Phone number"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value.replace(/[^0-9]/g, ""))}
                className="flex-1"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Adding a phone number helps with account recovery and security verification.
            You can skip this step and add it later. Up to 10 accounts can be linked to one phone number.
          </p>

          <div className="pt-2 flex justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePhoneNext}>
                Skip
              </Button>
              <Button onClick={handlePhoneNext} size="lg">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Password */}
      {step === "password" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {formData.password && (
              <div className="space-y-2 mt-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? passwordStrength <= 2 ? "bg-destructive"
                          : passwordStrength <= 3 ? "bg-yellow-500"
                          : "bg-green-500"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {Object.entries(passwordChecks).map(([key, valid]) => (
                    <div key={key} className={`flex items-center gap-1 ${valid ? "text-green-600" : "text-muted-foreground"}`}>
                      {valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>{key === "length" ? "8+ characters" : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="h-3 w-3" />
                Passwords do not match
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handlePasswordNext} size="lg">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 6: Review */}
      {step === "review" && (
        <div className="space-y-5 animate-fade-in">
          {/* Review card */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-input bg-muted/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-foreground">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="border-t border-input" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alsamos ID</span>
                <span className="text-sm font-medium text-foreground">{alsamosEmail}</span>
              </div>
              <div className="border-t border-input" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alsamos Mail</span>
                <span className="text-sm font-medium text-primary">{alsamosMail}</span>
              </div>
              <div className="border-t border-input" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Birthday</span>
                <span className="text-sm font-medium text-foreground">
                  {formData.birthMonth} {formData.birthDay}, {formData.birthYear}
                </span>
              </div>
              <div className="border-t border-input" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gender</span>
                <span className="text-sm font-medium text-foreground capitalize">{formData.gender}</span>
              </div>
              {formData.phone && (
                <>
                  <div className="border-t border-input" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm font-medium text-foreground">
                      {formData.phoneCode} {formData.phone}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mail creation notice */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Alsamos Mail will be created</p>
              <p className="text-muted-foreground mt-0.5">
                Your inbox at <span className="font-medium text-primary">{alsamosMail}</span> will be
                ready when your account is created.
              </p>
            </div>
          </div>

          {/* Terms */}
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

          <div className="flex justify-between">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleCreateAccount}
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
                  <Shield className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Shield className="h-3 w-3" />
            <span>Your data is encrypted and secure</span>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
