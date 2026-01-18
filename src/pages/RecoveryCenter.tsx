import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  KeyRound, 
  Shield, 
  Smartphone, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Download,
  Phone,
  Fingerprint,
  ShieldCheck,
  MonitorSmartphone,
  HelpCircle,
  ArrowRight,
  Clock,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

const backupCodes = [
  "AXKM-9NWP-2RQT",
  "BYCL-7KHJ-4SDF",
  "CZDN-5MWE-8GHI",
  "DXEO-3LRF-6JKL",
  "EYFP-1NSG-9MNO",
  "FZGQ-8OTH-2PQR",
  "GAHR-6PUI-5STU",
  "HBIS-4QVJ-7VWX",
];

const trustedDevices = [
  {
    id: "1",
    name: "MacBook Pro",
    type: "laptop",
    lastUsed: "Currently active",
    location: "New York, USA",
    trusted: true,
    addedDate: "Nov 15, 2024"
  },
  {
    id: "2",
    name: "iPhone 15 Pro",
    type: "phone",
    lastUsed: "2 hours ago",
    location: "New York, USA",
    trusted: true,
    addedDate: "Oct 20, 2024"
  },
  {
    id: "3",
    name: "Windows Desktop",
    type: "desktop",
    lastUsed: "3 days ago",
    location: "Boston, USA",
    trusted: true,
    addedDate: "Sep 5, 2024"
  }
];

export default function RecoveryCenter() {
  const [showCodes, setShowCodes] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationStep, setVerificationStep] = useState(0);
  const [recoveryMethod, setRecoveryMethod] = useState<"email" | "phone" | "backup" | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("All codes copied to clipboard");
  };

  const downloadCodes = () => {
    const content = `Alsamos Account Recovery Codes\n${"=".repeat(40)}\n\nKeep these codes safe. Each code can only be used once.\n\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}\n\nGenerated: ${new Date().toLocaleDateString()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alsamos-recovery-codes.txt";
    a.click();
    toast.success("Recovery codes downloaded");
  };

  const regenerateCodes = () => {
    toast.success("New backup codes generated");
  };

  const handlePasswordReset = () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    toast.success("Password reset link sent to your email");
  };

  const removeTrustedDevice = (id: string) => {
    toast.success("Device removed from trusted devices");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recovery Center</h1>
          <p className="text-muted-foreground mt-1">
            Secure your account and prepare for recovery scenarios
          </p>
        </div>

        {/* Quick Recovery Options */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/20">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Reset Password</h3>
                  <p className="text-sm text-muted-foreground">Forgot your password?</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Verify Identity</h3>
                  <p className="text-sm text-muted-foreground">Confirm it's you</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/10">
                  <Lock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Account Locked</h3>
                  <p className="text-sm text-muted-foreground">Unlock your account</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="password" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="password" className="gap-2">
              <KeyRound className="h-4 w-4" />
              Password Recovery
            </TabsTrigger>
            <TabsTrigger value="identity" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Identity Verification
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-2">
              <Shield className="h-4 w-4" />
              Backup Codes
            </TabsTrigger>
            <TabsTrigger value="devices" className="gap-2">
              <MonitorSmartphone className="h-4 w-4" />
              Trusted Devices
            </TabsTrigger>
          </TabsList>

          {/* Password Recovery Tab */}
          <TabsContent value="password" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>
                  Choose a recovery method to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recovery Methods */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div 
                    onClick={() => setRecoveryMethod("email")}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      recoveryMethod === "email" 
                        ? "bg-primary/10 border-2 border-primary" 
                        : "bg-muted/30 border-2 border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className={`h-5 w-5 ${recoveryMethod === "email" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Send reset link to your email</p>
                  </div>

                  <div 
                    onClick={() => setRecoveryMethod("phone")}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      recoveryMethod === "phone" 
                        ? "bg-primary/10 border-2 border-primary" 
                        : "bg-muted/30 border-2 border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className={`h-5 w-5 ${recoveryMethod === "phone" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">Phone</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Receive SMS verification code</p>
                  </div>

                  <div 
                    onClick={() => setRecoveryMethod("backup")}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      recoveryMethod === "backup" 
                        ? "bg-primary/10 border-2 border-primary" 
                        : "bg-muted/30 border-2 border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className={`h-5 w-5 ${recoveryMethod === "backup" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">Backup Code</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Use a saved backup code</p>
                  </div>
                </div>

                <Separator />

                {/* Email Recovery Form */}
                {recoveryMethod === "email" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input 
                        type="email" 
                        placeholder="username@alsamos.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button onClick={handlePasswordReset} className="w-full gap-2">
                      <Mail className="h-4 w-4" />
                      Send Reset Link
                    </Button>
                  </div>
                )}

                {/* Phone Recovery Form */}
                {recoveryMethod === "phone" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input type="tel" placeholder="+1 (555) 000-0000" />
                    </div>
                    <Button className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      Send Verification Code
                    </Button>
                  </div>
                )}

                {/* Backup Code Form */}
                {recoveryMethod === "backup" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Enter Backup Code</Label>
                      <Input placeholder="XXXX-XXXX-XXXX" className="font-mono text-center text-lg tracking-wider" />
                    </div>
                    <Button className="w-full gap-2">
                      <Shield className="h-4 w-4" />
                      Verify Code
                    </Button>
                  </div>
                )}

                {!recoveryMethod && (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a recovery method above to continue
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Need More Help?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      If you can't access any of your recovery methods, our support team can help verify your identity.
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      Contact Support
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Identity Verification Tab */}
          <TabsContent value="identity" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>
                  Complete these steps to verify your identity and secure your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Verification Steps */}
                <div className="space-y-4">
                  {[
                    { 
                      step: 1, 
                      title: "Email Verification", 
                      description: "Confirm your primary email address",
                      icon: Mail,
                      status: "completed" 
                    },
                    { 
                      step: 2, 
                      title: "Phone Verification", 
                      description: "Add and verify your phone number",
                      icon: Phone,
                      status: "completed" 
                    },
                    { 
                      step: 3, 
                      title: "Recovery Email", 
                      description: "Set up a backup email for recovery",
                      icon: Mail,
                      status: "current" 
                    },
                    { 
                      step: 4, 
                      title: "Security Questions", 
                      description: "Answer security questions for verification",
                      icon: ShieldCheck,
                      status: "pending" 
                    },
                    { 
                      step: 5, 
                      title: "ID Verification", 
                      description: "Upload a government-issued ID",
                      icon: UserCheck,
                      status: "pending" 
                    },
                  ].map((item) => (
                    <div 
                      key={item.step}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                        item.status === "current" 
                          ? "bg-primary/10 border border-primary/30" 
                          : "bg-muted/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        item.status === "completed" 
                          ? "bg-green-500 text-white" 
                          : item.status === "current"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {item.status === "completed" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          item.step
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {item.status === "current" && (
                        <Button size="sm">Continue</Button>
                      )}
                      {item.status === "completed" && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {item.status === "pending" && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Identity Score */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div>
                    <h3 className="font-semibold">Identity Verification Score</h3>
                    <p className="text-sm text-muted-foreground">Complete all steps to maximize your score</p>
                  </div>
                  <div className="text-3xl font-bold text-green-500">40%</div>
                </div>
              </CardContent>
            </Card>

            {/* Security Questions */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Security Questions</CardTitle>
                <CardDescription>Set up security questions for account recovery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { question: "What was your first pet's name?", answered: true },
                  { question: "In what city were you born?", answered: true },
                  { question: "What is your mother's maiden name?", answered: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      {item.answered ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                      <span>{item.question}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      {item.answered ? "Edit" : "Answer"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Codes Tab */}
          <TabsContent value="backup" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Backup Codes</CardTitle>
                    <CardDescription>
                      Use these codes to access your account if you lose your phone
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    8 codes remaining
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Warning */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-600 dark:text-amber-400">Keep these codes safe</p>
                      <p className="text-sm text-muted-foreground">
                        Store these backup codes in a secure location. Each code can only be used once.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Codes Grid */}
                <div className="relative">
                  <div className={`grid grid-cols-2 gap-3 ${!showCodes && "blur-sm select-none"}`}>
                    {backupCodes.map((code, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 font-mono"
                      >
                        <span>{code}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => copyCode(code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {!showCodes && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button onClick={() => setShowCodes(true)} className="gap-2">
                        <Eye className="h-4 w-4" />
                        Show Codes
                      </Button>
                    </div>
                  )}
                </div>

                {showCodes && (
                  <Button 
                    variant="ghost" 
                    className="w-full gap-2"
                    onClick={() => setShowCodes(false)}
                  >
                    <EyeOff className="h-4 w-4" />
                    Hide Codes
                  </Button>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={copyAllCodes} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy All
                  </Button>
                  <Button variant="outline" onClick={downloadCodes} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={regenerateCodes} className="gap-2 ml-auto">
                    <RefreshCw className="h-4 w-4" />
                    Generate New Codes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage History */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Code Usage History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No backup codes have been used yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trusted Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Trusted Devices</CardTitle>
                <CardDescription>
                  Devices that can access your account without additional verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trustedDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <MonitorSmartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{device.name}</h3>
                          {device.lastUsed === "Currently active" && (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {device.location} • {device.lastUsed}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Trusted since {device.addedDate}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeTrustedDevice(device.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trust Settings */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Trust Settings</CardTitle>
                <CardDescription>Configure how trusted devices work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium">Auto-expire trusted devices</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically remove trust after 90 days of inactivity
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium">New device alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a new device accesses your account
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                </div>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  Remove All Trusted Devices
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
