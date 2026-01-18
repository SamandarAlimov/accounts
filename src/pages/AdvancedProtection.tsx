import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Fingerprint,
  Eye,
  Mail,
  Globe,
  Laptop,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  UserX,
  FileWarning,
  Ban
} from "lucide-react";
import { toast } from "sonner";

interface SecurityRequirement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "completed" | "pending" | "required";
  action?: string;
}

export default function AdvancedProtection() {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const securityRequirements: SecurityRequirement[] = [
    {
      id: "hardware_key",
      name: "Hardware Security Key",
      description: "Register at least two FIDO2 hardware security keys for account access",
      icon: Key,
      status: "pending",
      action: "Add Security Key"
    },
    {
      id: "strong_password",
      name: "Strong Password",
      description: "Use a password with at least 16 characters including special characters",
      icon: Lock,
      status: "completed"
    },
    {
      id: "recovery_options",
      name: "Recovery Options",
      description: "Set up backup recovery methods in case you lose access to your keys",
      icon: HardDrive,
      status: "pending",
      action: "Configure Recovery"
    },
    {
      id: "app_passwords",
      name: "App-Specific Passwords",
      description: "Generate unique passwords for apps that don't support security keys",
      icon: Smartphone,
      status: "required"
    }
  ];

  const protectionFeatures = [
    {
      id: "phishing_protection",
      name: "Advanced Phishing Protection",
      description: "Extra verification when signing into new apps or browsers",
      enabled: true,
      icon: ShieldCheck
    },
    {
      id: "download_scanning",
      name: "Enhanced Download Scanning",
      description: "Deep scanning of all downloads for potential threats",
      enabled: true,
      icon: FileWarning
    },
    {
      id: "restricted_apps",
      name: "Strict App Access",
      description: "Only allow verified apps to access your account data",
      enabled: true,
      icon: Ban
    },
    {
      id: "login_alerts",
      name: "Immediate Login Alerts",
      description: "Get instant notifications for any login attempt",
      enabled: true,
      icon: Mail
    },
    {
      id: "session_management",
      name: "Automatic Session Timeout",
      description: "Sessions expire after 1 hour of inactivity",
      enabled: true,
      icon: Clock
    },
    {
      id: "identity_verification",
      name: "Enhanced Identity Verification",
      description: "Additional verification for sensitive account changes",
      enabled: true,
      icon: Fingerprint
    }
  ];

  const restrictedApps = [
    { name: "Legacy Email Clients", reason: "Cannot use hardware keys", icon: Mail },
    { name: "Unverified Third-Party Apps", reason: "Not reviewed by Alsamos", icon: Globe },
    { name: "Browser Extensions", reason: "Potential security risk", icon: Laptop }
  ];

  const handleEnroll = async () => {
    setIsEnrolling(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsEnrolled(true);
    setIsEnrolling(false);
    toast.success("Successfully enrolled in Advanced Protection Program");
  };

  const handleUnenroll = async () => {
    setIsEnrolled(false);
    toast.success("Unenrolled from Advanced Protection Program");
  };

  const completedRequirements = securityRequirements.filter(r => r.status === "completed").length;
  const totalRequirements = securityRequirements.length;
  const progressPercentage = (completedRequirements / totalRequirements) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Advanced Protection Program
            </h1>
            <p className="text-muted-foreground mt-1">
              Our strongest security for users at high risk of targeted attacks
            </p>
          </div>
          {isEnrolled ? (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-2 text-sm">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Enrolled
            </Badge>
          ) : (
            <Badge variant="outline" className="px-4 py-2 text-sm">
              Not Enrolled
            </Badge>
          )}
        </div>

        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  Maximum Security for High-Risk Users
                </h2>
                <p className="text-muted-foreground">
                  The Advanced Protection Program provides the strongest security Alsamos offers, 
                  designed for journalists, activists, business leaders, and political campaign teams 
                  who are at elevated risk of targeted online attacks.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Phishing Protection", "Hardware Keys", "Strict App Access"].map((feature) => (
                    <Badge key={feature} variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-40 w-40 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="h-20 w-20 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Key className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Status */}
        {!isEnrolled && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Enrollment Requirements</CardTitle>
              <CardDescription>
                Complete these requirements to enroll in Advanced Protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Setup Progress</span>
                  <span className="font-medium">{completedRequirements} of {totalRequirements} completed</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="space-y-3">
                {securityRequirements.map((requirement) => (
                  <div 
                    key={requirement.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      requirement.status === "completed" 
                        ? "bg-green-500/10" 
                        : requirement.status === "required"
                        ? "bg-amber-500/10"
                        : "bg-muted"
                    }`}>
                      <requirement.icon className={`h-5 w-5 ${
                        requirement.status === "completed" 
                          ? "text-green-500" 
                          : requirement.status === "required"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{requirement.name}</p>
                        {requirement.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {requirement.status === "required" && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
                    </div>
                    {requirement.action && requirement.status !== "completed" && (
                      <Button variant="outline" size="sm">
                        {requirement.action}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button 
                className="w-full h-12 gap-2" 
                onClick={handleEnroll}
                disabled={isEnrolling || completedRequirements < 1}
              >
                {isEnrolling ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Enroll in Advanced Protection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Protection Features */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Protection Features
            </CardTitle>
            <CardDescription>
              Security measures enabled with Advanced Protection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {protectionFeatures.map((feature) => (
                <div 
                  key={feature.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isEnrolled && feature.enabled ? "bg-green-500/10" : "bg-muted"
                  }`}>
                    <feature.icon className={`h-5 w-5 ${
                      isEnrolled && feature.enabled ? "text-green-500" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{feature.name}</p>
                      {isEnrolled && feature.enabled && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Restricted Apps */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Restricted Access
            </CardTitle>
            <CardDescription>
              These types of apps cannot access your account with Advanced Protection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restrictedApps.map((app, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10"
                >
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <app.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{app.name}</p>
                    <p className="text-sm text-muted-foreground">{app.reason}</p>
                  </div>
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Compatibility Notice</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Some older apps and services may not work with Advanced Protection. 
                    You can generate app-specific passwords for essential apps that don't support security keys.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manage Enrollment */}
        {isEnrolled && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Manage Enrollment</CardTitle>
              <CardDescription>
                Control your Advanced Protection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="font-medium">Security Keys</p>
                  <p className="text-sm text-muted-foreground">2 keys registered</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Keys
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="font-medium">Recovery Options</p>
                  <p className="text-sm text-muted-foreground">Phone and backup codes configured</p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>

              <Separator />

              <Button 
                variant="outline" 
                className="text-destructive hover:text-destructive gap-2"
                onClick={handleUnenroll}
              >
                <UserX className="h-4 w-4" />
                Unenroll from Advanced Protection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Learn More */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Learn More About Advanced Protection</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Read our comprehensive guide on protecting high-risk accounts
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Security Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
