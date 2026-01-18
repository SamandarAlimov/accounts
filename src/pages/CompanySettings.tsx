import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  Palette, 
  Globe, 
  Shield, 
  Users, 
  Settings,
  Upload,
  ExternalLink,
  CheckCircle,
  Lock,
  Mail,
  Link2,
  Smartphone,
  Monitor,
  Save,
  Eye,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export default function CompanySettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: "Acme Corporation",
    domain: "acme.com",
    logo: "",
    primaryColor: "#F97316",
    website: "https://www.acme.com",
    supportEmail: "support@acme.com",
    privacyUrl: "https://www.acme.com/privacy",
    termsUrl: "https://www.acme.com/terms"
  });

  const [loginSettings, setLoginSettings] = useState({
    customLoginPage: true,
    showCompanyLogo: true,
    showCompanyName: true,
    customBackground: false,
    backgroundUrl: "",
    allowPersonalAccounts: false,
    enforceSSO: true,
    showSocialLogins: false
  });

  const [workspaceSettings, setWorkspaceSettings] = useState({
    autoProvision: true,
    defaultRole: "member",
    requireEmailVerification: true,
    allowExternalGuests: false,
    sessionTimeout: 24,
    ipRestrictions: false,
    allowedIPs: ""
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your organization's branding and workspace settings
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Organization Branding */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Organization Branding
            </CardTitle>
            <CardDescription>
              Customize how your organization appears to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="flex items-start gap-6">
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 rounded-xl border-2 border-border">
                    <AvatarImage src={companyInfo.logo} />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-2xl font-bold">
                      {companyInfo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or SVG. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input 
                  id="domain"
                  value={companyInfo.domain}
                  onChange={(e) => setCompanyInfo({...companyInfo, domain: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input 
                  id="supportEmail"
                  type="email"
                  value={companyInfo.supportEmail}
                  onChange={(e) => setCompanyInfo({...companyInfo, supportEmail: e.target.value})}
                />
              </div>
            </div>

            <Separator />

            {/* Brand Colors */}
            <div className="space-y-4">
              <Label>Brand Color</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="h-12 w-12 rounded-xl border-2 border-border shadow-sm cursor-pointer"
                  style={{ backgroundColor: companyInfo.primaryColor }}
                />
                <Input 
                  type="text"
                  value={companyInfo.primaryColor}
                  onChange={(e) => setCompanyInfo({...companyInfo, primaryColor: e.target.value})}
                  className="w-32 font-mono"
                />
                <div className="flex gap-2">
                  {["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"].map((color) => (
                    <button
                      key={color}
                      className="h-8 w-8 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setCompanyInfo({...companyInfo, primaryColor: color})}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Login Page */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Custom Login Page
            </CardTitle>
            <CardDescription>
              Personalize the login experience for your users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Enable Custom Login Page</p>
                <p className="text-sm text-muted-foreground">
                  Use your branding on the login page
                </p>
              </div>
              <Switch 
                checked={loginSettings.customLoginPage}
                onCheckedChange={(checked) => setLoginSettings({...loginSettings, customLoginPage: checked})}
              />
            </div>

            {loginSettings.customLoginPage && (
              <>
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span>Show Company Logo</span>
                    </div>
                    <Switch 
                      checked={loginSettings.showCompanyLogo}
                      onCheckedChange={(checked) => setLoginSettings({...loginSettings, showCompanyLogo: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <span>Show Company Name</span>
                    </div>
                    <Switch 
                      checked={loginSettings.showCompanyName}
                      onCheckedChange={(checked) => setLoginSettings({...loginSettings, showCompanyName: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <span>Enforce SSO</span>
                    </div>
                    <Switch 
                      checked={loginSettings.enforceSSO}
                      onCheckedChange={(checked) => setLoginSettings({...loginSettings, enforceSSO: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span>Show Social Logins</span>
                    </div>
                    <Switch 
                      checked={loginSettings.showSocialLogins}
                      onCheckedChange={(checked) => setLoginSettings({...loginSettings, showSocialLogins: checked})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Custom Background</Label>
                    <Switch 
                      checked={loginSettings.customBackground}
                      onCheckedChange={(checked) => setLoginSettings({...loginSettings, customBackground: checked})}
                    />
                  </div>
                  {loginSettings.customBackground && (
                    <Input 
                      placeholder="https://example.com/background.jpg"
                      value={loginSettings.backgroundUrl}
                      onChange={(e) => setLoginSettings({...loginSettings, backgroundUrl: e.target.value})}
                    />
                  )}
                </div>

                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Login Page
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Workspace Configuration */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Workspace Configuration
            </CardTitle>
            <CardDescription>
              Configure how users access and interact with your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="space-y-1">
                  <p className="font-medium">Auto-Provision Users</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically create accounts for SSO users
                  </p>
                </div>
                <Switch 
                  checked={workspaceSettings.autoProvision}
                  onCheckedChange={(checked) => setWorkspaceSettings({...workspaceSettings, autoProvision: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="space-y-1">
                  <p className="font-medium">Require Email Verification</p>
                  <p className="text-xs text-muted-foreground">
                    Users must verify their email
                  </p>
                </div>
                <Switch 
                  checked={workspaceSettings.requireEmailVerification}
                  onCheckedChange={(checked) => setWorkspaceSettings({...workspaceSettings, requireEmailVerification: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="space-y-1">
                  <p className="font-medium">Allow External Guests</p>
                  <p className="text-xs text-muted-foreground">
                    Allow users outside your domain
                  </p>
                </div>
                <Switch 
                  checked={workspaceSettings.allowExternalGuests}
                  onCheckedChange={(checked) => setWorkspaceSettings({...workspaceSettings, allowExternalGuests: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="space-y-1">
                  <p className="font-medium">IP Restrictions</p>
                  <p className="text-xs text-muted-foreground">
                    Limit access to specific IPs
                  </p>
                </div>
                <Switch 
                  checked={workspaceSettings.ipRestrictions}
                  onCheckedChange={(checked) => setWorkspaceSettings({...workspaceSettings, ipRestrictions: checked})}
                />
              </div>
            </div>

            {workspaceSettings.ipRestrictions && (
              <div className="space-y-2">
                <Label>Allowed IP Addresses</Label>
                <Textarea 
                  placeholder="Enter IP addresses, one per line"
                  value={workspaceSettings.allowedIPs}
                  onChange={(e) => setWorkspaceSettings({...workspaceSettings, allowedIPs: e.target.value})}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Enter IP addresses or CIDR ranges, one per line
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Session Timeout (hours)</Label>
              <Input 
                type="number"
                value={workspaceSettings.sessionTimeout}
                onChange={(e) => setWorkspaceSettings({...workspaceSettings, sessionTimeout: parseInt(e.target.value)})}
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal & Compliance */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Legal & Compliance
            </CardTitle>
            <CardDescription>
              Configure legal documents and compliance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                <Input 
                  id="privacyUrl"
                  value={companyInfo.privacyUrl}
                  onChange={(e) => setCompanyInfo({...companyInfo, privacyUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termsUrl">Terms of Service URL</Label>
                <Input 
                  id="termsUrl"
                  value={companyInfo.termsUrl}
                  onChange={(e) => setCompanyInfo({...companyInfo, termsUrl: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Legal Documents Required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ensure your privacy policy and terms of service are up to date and compliant with applicable regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
