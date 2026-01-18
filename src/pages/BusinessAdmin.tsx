import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Shield, 
  Settings, 
  Activity, 
  Key, 
  Globe, 
  Building2,
  UserPlus,
  Search,
  MoreHorizontal,
  Lock,
  Trash2,
  Edit,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Filter
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
  department: string;
  status: "active" | "suspended" | "pending";
  lastActive: string;
  avatar?: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

export default function BusinessAdmin() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("employees");

  const employees: Employee[] = [
    { id: "1", name: "John Smith", email: "john@company.alsamos.com", role: "admin", department: "Engineering", status: "active", lastActive: "2 minutes ago" },
    { id: "2", name: "Sarah Johnson", email: "sarah@company.alsamos.com", role: "manager", department: "Product", status: "active", lastActive: "1 hour ago" },
    { id: "3", name: "Mike Chen", email: "mike@company.alsamos.com", role: "member", department: "Design", status: "active", lastActive: "3 hours ago" },
    { id: "4", name: "Emily Davis", email: "emily@company.alsamos.com", role: "member", department: "Marketing", status: "pending", lastActive: "Never" },
    { id: "5", name: "Alex Wilson", email: "alex@company.alsamos.com", role: "member", department: "Sales", status: "suspended", lastActive: "1 week ago" },
  ];

  const auditLogs: AuditLog[] = [
    { id: "1", action: "User role changed", user: "John Smith", target: "Sarah Johnson promoted to Manager", timestamp: "2 minutes ago", severity: "info" },
    { id: "2", action: "Security policy updated", user: "John Smith", target: "2FA requirement enabled", timestamp: "1 hour ago", severity: "warning" },
    { id: "3", action: "User suspended", user: "John Smith", target: "Alex Wilson account suspended", timestamp: "2 days ago", severity: "critical" },
    { id: "4", action: "SSO configuration updated", user: "Sarah Johnson", target: "SAML settings modified", timestamp: "3 days ago", severity: "warning" },
    { id: "5", action: "New user invited", user: "John Smith", target: "Emily Davis invited", timestamp: "1 week ago", severity: "info" },
  ];

  const getRoleBadge = (role: Employee["role"]) => {
    const styles = {
      admin: "bg-primary/10 text-primary border-primary/20",
      manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      member: "bg-muted text-muted-foreground border-border"
    };
    return styles[role];
  };

  const getStatusBadge = (status: Employee["status"]) => {
    const config = {
      active: { icon: CheckCircle, class: "bg-green-500/10 text-green-500 border-green-500/20" },
      suspended: { icon: XCircle, class: "bg-destructive/10 text-destructive border-destructive/20" },
      pending: { icon: Clock, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" }
    };
    const Icon = config[status].icon;
    return (
      <Badge variant="outline" className={`${config[status].class} gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSeverityStyle = (severity: AuditLog["severity"]) => {
    const styles = {
      info: "border-l-blue-500 bg-blue-500/5",
      warning: "border-l-yellow-500 bg-yellow-500/5",
      critical: "border-l-destructive bg-destructive/5"
    };
    return styles[severity];
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Admin Console</h1>
            <p className="text-muted-foreground mt-1">Manage your organization, employees, and security policies</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
              <Building2 className="h-3 w-3" />
              Alsamos Corporation
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Enterprise Plan
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Employees", value: "124", icon: Users, change: "+8 this month" },
            { label: "Active Sessions", value: "47", icon: Activity, change: "89 devices" },
            { label: "Security Score", value: "92%", icon: Shield, change: "Excellent" },
            { label: "Connected Apps", value: "12", icon: Globe, change: "3 pending review" },
          ].map((stat, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="glass-card p-1 h-auto flex-wrap">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security Policies
            </TabsTrigger>
            <TabsTrigger value="sso" className="gap-2">
              <Key className="h-4 w-4" />
              SSO & Identity
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Employee Management
                    </CardTitle>
                    <CardDescription>Add, edit, and manage team member access</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search employees..." 
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite Employee
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {employees.filter(e => 
                    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.email.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-6 px-6 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-border">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{employee.name}</p>
                            <Badge variant="outline" className={getRoleBadge(employee.role)}>
                              {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-muted-foreground">{employee.department}</p>
                          <p className="text-xs text-muted-foreground">{employee.lastActive}</p>
                        </div>
                        {getStatusBadge(employee.status)}
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Roles */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Team Roles & Permissions</CardTitle>
                <CardDescription>Configure what each role can access and manage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { role: "Admin", description: "Full access to all settings, users, and billing", permissions: ["Manage users", "Security settings", "Billing", "Audit logs"] },
                  { role: "Manager", description: "Can manage team members and view reports", permissions: ["View users", "Team settings", "View reports"] },
                  { role: "Member", description: "Standard access to workspace resources", permissions: ["View resources", "Edit own profile"] },
                ].map((roleConfig, index) => (
                  <div key={index} className="p-4 rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{roleConfig.role}</h4>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{roleConfig.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {roleConfig.permissions.map((perm, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Policies Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Policies
                </CardTitle>
                <CardDescription>Configure organization-wide security requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: "Require Two-Factor Authentication", description: "All employees must enable 2FA to access the workspace", enabled: true },
                  { title: "Password Complexity Requirements", description: "Enforce strong passwords with minimum 12 characters", enabled: true },
                  { title: "Session Timeout", description: "Automatically sign out inactive users after 30 minutes", enabled: true },
                  { title: "IP Allowlist", description: "Restrict access to specific IP addresses or ranges", enabled: false },
                  { title: "Device Trust", description: "Only allow access from approved devices", enabled: false },
                  { title: "Login Alerts", description: "Send notifications for suspicious login attempts", enabled: true },
                ].map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${policy.enabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                        {policy.enabled ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{policy.title}</p>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
                    </div>
                    <Switch checked={policy.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Password Policy */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>Configure password requirements for all employees</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Minimum Length</Label>
                  <Select defaultValue="12">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="10">10 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                      <SelectItem value="16">16 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Password Expiry</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Every 30 days</SelectItem>
                      <SelectItem value="60">Every 60 days</SelectItem>
                      <SelectItem value="90">Every 90 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SSO Tab */}
          <TabsContent value="sso" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Single Sign-On (SSO)
                </CardTitle>
                <CardDescription>Configure enterprise SSO for seamless authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">SAML 2.0</p>
                        <p className="text-sm text-muted-foreground">Enterprise identity provider integration</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Enabled</Badge>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Identity Provider</Label>
                    <Select defaultValue="okta">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="okta">Okta</SelectItem>
                        <SelectItem value="azure">Azure AD</SelectItem>
                        <SelectItem value="onelogin">OneLogin</SelectItem>
                        <SelectItem value="custom">Custom SAML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>SSO URL</Label>
                    <Input value="https://company.okta.com/app/alsamos/sso/saml" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Entity ID</Label>
                    <Input value="https://accounts.alsamos.com/saml/company" readOnly />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button>Update Configuration</Button>
                  <Button variant="outline">Download Metadata</Button>
                </div>
              </CardContent>
            </Card>

            {/* Domain Verification */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Domain Verification</CardTitle>
                <CardDescription>Verify your domain to enable SSO and auto-join</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-green-500/30 bg-green-500/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">company.alsamos.com</p>
                      <p className="text-sm text-muted-foreground">Verified on Dec 10, 2024</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  <Globe className="h-4 w-4 mr-2" />
                  Add Another Domain
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Audit Logs
                    </CardTitle>
                    <CardDescription>Track all administrative actions and security events</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">Export CSV</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className={`p-4 rounded-xl border-l-4 ${getSeverityStyle(log.severity)} border border-border`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{log.action}</p>
                            {log.severity === "critical" && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{log.target}</p>
                          <p className="text-xs text-muted-foreground mt-2">By {log.user}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  Load More Logs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}