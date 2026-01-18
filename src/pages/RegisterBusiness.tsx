import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlsamosLogo } from "@/components/AlsamosLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { countries } from "@/data/countries";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  User,
  Globe,
  Users,
  Copy,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const steps = [
  { id: 1, key: "companyInfo", icon: Building2 },
  { id: 2, key: "adminSetup", icon: User },
  { id: 3, key: "domainVerify", icon: Globe },
  { id: 4, key: "teamSetup", icon: Users },
];

const companyTypes = [
  "Corporation",
  "LLC",
  "Partnership",
  "Sole Proprietorship",
  "Non-profit",
  "Government",
  "Educational",
  "Startup",
];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Media & Entertainment",
  "Transportation",
  "Energy",
  "Agriculture",
  "Other",
];

export default function RegisterBusiness() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Company info
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  // Admin setup
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPhone, setAdminPhone] = useState("");

  // Domain verification
  const [domain, setDomain] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"dns" | "file">("dns");
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verifying" | "verified" | "failed">("pending");
  const [dnsRecord, setDnsRecord] = useState("");

  // Team setup
  const [teamEmails, setTeamEmails] = useState("");
  const [defaultRole, setDefaultRole] = useState("member");

  const generateDnsRecord = () => {
    const record = `alsamos-verification=${Math.random().toString(36).substring(2, 15)}`;
    setDnsRecord(record);
  };

  const handleVerifyDomain = async () => {
    setVerificationStatus("verifying");
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setVerificationStatus("verified");
    toast.success("Domain verified successfully!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!companyName || !companyType || !companySize || !industry || !country) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    if (currentStep === 2) {
      if (!adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    if (currentStep === 3) {
      if (!domain) {
        toast.error("Please enter your company domain");
        return;
      }
      if (!dnsRecord) {
        generateDnsRecord();
      }
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
    toast.success("Business account created successfully!");
    navigate("/dashboard");
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
        <div className="w-full max-w-2xl">
          <div className="glass-card p-8 rounded-3xl">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t("business.title")}</h1>
              <p className="text-muted-foreground mt-2">{t("business.subtitle")}</p>
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
                      className={`w-16 h-1 mx-2 rounded ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("business.companyInfo")}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="companyName">{t("business.companyName")} *</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Alsamos Corporation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("business.companyType")} *</Label>
                    <Select value={companyType} onValueChange={setCompanyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("business.companySize")} *</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("business.industry")} *</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("business.country")} *</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="website">{t("business.website")}</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.example.com"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of your company..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full">
                  {t("common.next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Admin Setup */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("business.adminSetup")}</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>{t("business.adminEmail")} *</Label>
                    <Input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@company.com"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
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

                  <div className="col-span-2 space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Super Admin Rights</p>
                      <p className="text-sm text-muted-foreground">
                        This account will have full administrative access to manage users, settings, billing, and security.
                      </p>
                    </div>
                  </div>
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

            {/* Step 3: Domain Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("business.domainVerify")}</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("business.domain")} *</Label>
                    <Input
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value);
                        setVerificationStatus("pending");
                      }}
                      placeholder="company.com"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Verification Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setVerificationMethod("dns");
                          if (!dnsRecord) generateDnsRecord();
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          verificationMethod === "dns"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Globe className="h-6 w-6 mb-2 text-primary" />
                        <p className="font-medium">{t("business.verifyDns")}</p>
                        <p className="text-xs text-muted-foreground mt-1">Add TXT record</p>
                      </button>
                      <button
                        onClick={() => setVerificationMethod("file")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          verificationMethod === "file"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Shield className="h-6 w-6 mb-2 text-primary" />
                        <p className="font-medium">{t("business.verifyFile")}</p>
                        <p className="text-xs text-muted-foreground mt-1">Upload HTML file</p>
                      </button>
                    </div>
                  </div>

                  {verificationMethod === "dns" && dnsRecord && (
                    <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                      <p className="text-sm font-medium">Add this TXT record to your DNS:</p>
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                        <code className="flex-1 text-sm break-all">{dnsRecord}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(dnsRecord)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Type:</strong> TXT</p>
                        <p><strong>Host:</strong> @ or {domain}</p>
                        <p><strong>Value:</strong> {dnsRecord}</p>
                      </div>
                    </div>
                  )}

                  {verificationMethod === "file" && (
                    <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                      <p className="text-sm font-medium">Download and upload this file to your website:</p>
                      <Button variant="outline" className="w-full">
                        Download alsamos-verify.html
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Upload to: https://{domain || "your-domain.com"}/alsamos-verify.html
                      </p>
                    </div>
                  )}

                  {/* Verification Status */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {verificationStatus === "pending" && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      {verificationStatus === "verifying" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        </div>
                      )}
                      {verificationStatus === "verified" && (
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      {verificationStatus === "failed" && (
                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                          <XCircle className="h-4 w-4 text-destructive" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium capitalize">{verificationStatus}</p>
                        <p className="text-sm text-muted-foreground">
                          {verificationStatus === "verified" 
                            ? "Domain ownership confirmed"
                            : verificationStatus === "verifying"
                            ? "Checking DNS records..."
                            : "Click verify when ready"}
                        </p>
                      </div>
                    </div>
                    {verificationStatus !== "verified" && (
                      <Button 
                        onClick={handleVerifyDomain}
                        disabled={verificationStatus === "verifying" || !domain}
                      >
                        {verificationStatus === "verifying" ? "Verifying..." : "Verify"}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("common.back")}
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    {verificationStatus === "verified" ? t("common.next") : "Skip for now"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Team Setup */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">{t("business.teamSetup")}</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Invite Team Members</Label>
                    <Textarea
                      value={teamEmails}
                      onChange={(e) => setTeamEmails(e.target.value)}
                      placeholder="Enter email addresses, one per line..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter email addresses separated by new lines. You can also invite members later.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Role for New Members</Label>
                    <Select value={defaultRole} onValueChange={setDefaultRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                  <h3 className="font-medium">Organization Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company</span>
                      <span>{companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span>{companyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span>{companySize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Admin</span>
                      <span>{adminEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domain</span>
                      <span className="flex items-center gap-1">
                        {domain || "Not verified"}
                        {verificationStatus === "verified" && (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("common.back")}
                  </Button>
                  <Button onClick={handleCreateAccount} className="flex-1" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Organization"}
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
