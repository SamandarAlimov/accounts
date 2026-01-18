import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlsamosLogo } from "@/components/AlsamosLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Shield,
  User,
  Smartphone,
  Lock,
  Clock,
  Filter,
  Moon,
  Bell,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

const steps = [
  { id: 1, key: "parentVerify", icon: Lock },
  { id: 2, key: "childInfo", icon: User },
  { id: 3, key: "safetySettings", icon: Shield },
  { id: 4, key: "deviceLink", icon: Smartphone },
];

export default function RegisterKids() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Parent verification
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentVerified, setParentVerified] = useState(!!user);

  // Child info
  const [childFirstName, setChildFirstName] = useState("");
  const [childLastName, setChildLastName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childUsername, setChildUsername] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Safety settings
  const [screenTimeLimit, setScreenTimeLimit] = useState([120]);
  const [contentFilterLevel, setContentFilterLevel] = useState("moderate");
  const [appRestrictions, setAppRestrictions] = useState(true);
  const [sleepModeEnabled, setSleepModeEnabled] = useState(true);
  const [sleepModeStart, setSleepModeStart] = useState("21:00");
  const [sleepModeEnd, setSleepModeEnd] = useState("07:00");
  const [parentApprovalRequired, setParentApprovalRequired] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  // Device linking
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("");

  const generateUsernameSuggestions = () => {
    if (childFirstName && childLastName) {
      const suggestions = [
        `${childFirstName.toLowerCase()}.${childLastName.toLowerCase()}`,
        `${childFirstName.toLowerCase()}_${childLastName.toLowerCase()}`,
        `${childFirstName.toLowerCase()}${childLastName.charAt(0).toLowerCase()}`,
        `${childFirstName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
        `${childFirstName.toLowerCase()}.${childLastName.toLowerCase()}${Math.floor(Math.random() * 10)}`,
      ];
      setUsernameSuggestions(suggestions);
    }
  };

  const handleParentVerify = async () => {
    if (user) {
      setParentVerified(true);
      setCurrentStep(2);
      return;
    }

    if (!parentEmail || !parentPassword) {
      toast.error("Please enter your credentials");
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(parentEmail, parentPassword);
    setIsLoading(false);

    if (error) {
      toast.error("Invalid credentials. Please try again.");
      return;
    }

    setParentVerified(true);
    toast.success("Parent verified successfully");
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!childFirstName || !childLastName || !childAge || !childUsername) {
        toast.error("Please fill in all required fields");
        return;
      }
      generateUsernameSuggestions();
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    // Simulate account creation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.success("Kids account created successfully!");
    navigate("/dashboard/people-sharing");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AlsamosLogo className="h-8 w-8" />
            <span className="font-semibold text-lg">Alsamos</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="glass-card p-8 rounded-3xl">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t("kids.title")}</h1>
              <p className="text-muted-foreground mt-2">{t("kids.subtitle")}</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 rounded ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Parent Verification */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("kids.parentVerify")}</h2>
                {user ? (
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Logged in as parent</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentEmail">Parent Email</Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          placeholder="parent@alsamos.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentPassword">Password</Label>
                        <div className="relative">
                          <Input
                            id="parentPassword"
                            type={showPassword ? "text" : "password"}
                            value={parentPassword}
                            onChange={(e) => setParentPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-primary hover:underline">
                        Create one first
                      </Link>
                    </p>
                  </>
                )}
                <Button
                  onClick={handleParentVerify}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : user ? "Continue" : "Verify & Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Child Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("kids.childInfo")}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childFirstName">{t("kids.firstName")}</Label>
                    <Input
                      id="childFirstName"
                      value={childFirstName}
                      onChange={(e) => {
                        setChildFirstName(e.target.value);
                        generateUsernameSuggestions();
                      }}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childLastName">{t("kids.lastName")}</Label>
                    <Input
                      id="childLastName"
                      value={childLastName}
                      onChange={(e) => {
                        setChildLastName(e.target.value);
                        generateUsernameSuggestions();
                      }}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childAge">{t("kids.age")}</Label>
                  <Select value={childAge} onValueChange={setChildAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(13)].map((_, i) => (
                        <SelectItem key={i + 4} value={String(i + 4)}>
                          {i + 4} years old
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childUsername">{t("kids.username")}</Label>
                  <div className="relative">
                    <Input
                      id="childUsername"
                      value={childUsername}
                      onChange={(e) => setChildUsername(e.target.value)}
                      placeholder="username"
                      className="pr-32"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      @kids.alsamos.com
                    </span>
                  </div>
                </div>

                {usernameSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>AI Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {usernameSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setChildUsername(suggestion)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            childUsername === suggestion
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("common.back")}
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    {t("common.next")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Safety Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("kids.safetySettings")}</h2>

                {/* Screen Time */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <Label>{t("kids.screenTime")}</Label>
                    </div>
                    <span className="text-sm font-medium">{screenTimeLimit[0]} min/day</span>
                  </div>
                  <Slider
                    value={screenTimeLimit}
                    onValueChange={setScreenTimeLimit}
                    max={480}
                    min={30}
                    step={15}
                    className="w-full"
                  />
                </div>

                {/* Content Filter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <Label>{t("kids.contentFilter")}</Label>
                  </div>
                  <Select value={contentFilterLevel} onValueChange={setContentFilterLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict (Ages 4-7)</SelectItem>
                      <SelectItem value="moderate">Moderate (Ages 8-12)</SelectItem>
                      <SelectItem value="light">Light (Ages 13+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* App Restrictions */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{t("kids.appRestrictions")}</p>
                      <p className="text-sm text-muted-foreground">Require approval for new apps</p>
                    </div>
                  </div>
                  <Switch checked={appRestrictions} onCheckedChange={setAppRestrictions} />
                </div>

                {/* Sleep Mode */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Moon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{t("kids.sleepMode")}</p>
                        <p className="text-sm text-muted-foreground">Limit usage during bedtime</p>
                      </div>
                    </div>
                    <Switch checked={sleepModeEnabled} onCheckedChange={setSleepModeEnabled} />
                  </div>
                  {sleepModeEnabled && (
                    <div className="flex gap-4 mt-3">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Start</Label>
                        <Input
                          type="time"
                          value={sleepModeStart}
                          onChange={(e) => setSleepModeStart(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">End</Label>
                        <Input
                          type="time"
                          value={sleepModeEnd}
                          onChange={(e) => setSleepModeEnd(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Parent Approval */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{t("kids.parentApproval")}</p>
                      <p className="text-sm text-muted-foreground">Get notified of activities</p>
                    </div>
                  </div>
                  <Switch checked={parentApprovalRequired} onCheckedChange={setParentApprovalRequired} />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("common.back")}
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    {t("common.next")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Device Linking */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("kids.deviceLink")}</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Device Name</Label>
                    <Input
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      placeholder="e.g., Kid's iPad"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Device Type</Label>
                    <Select value={deviceType} onValueChange={setDeviceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="computer">Computer</SelectItem>
                        <SelectItem value="tv">Smart TV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                  <h3 className="font-medium">Account Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Child's Name</span>
                      <span>{childFirstName} {childLastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username</span>
                      <span>{childUsername}@kids.alsamos.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age</span>
                      <span>{childAge} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Screen Time</span>
                      <span>{screenTimeLimit[0]} min/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Content Filter</span>
                      <span className="capitalize">{contentFilterLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("common.back")}
                  </Button>
                  <Button onClick={handleCreateAccount} className="flex-1" disabled={isLoading}>
                    {isLoading ? "Creating..." : t("auth.createAccount")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
