import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  MapPin, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Database,
  Cloud,
  History,
  Settings,
  Globe,
  Smartphone,
  Monitor,
  HardDrive,
  RefreshCw,
  Search,
  Mic,
  Camera,
  Mail
} from "lucide-react";
import { toast } from "sonner";

interface DataCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const dataCategories: DataCategory[] = [
  {
    id: "profile",
    name: "Profile Information",
    icon: <FileText className="h-5 w-5" />,
    description: "Your name, email, profile photo, and account settings"
  },
  {
    id: "activity",
    name: "Activity & Timeline",
    icon: <Activity className="h-5 w-5" />,
    description: "Your search history, browsing activity, and app usage"
  },
  {
    id: "location",
    name: "Location History",
    icon: <MapPin className="h-5 w-5" />,
    description: "Places you've visited and location timeline"
  },
  {
    id: "cloud",
    name: "Alsamos Cloud Data",
    icon: <Cloud className="h-5 w-5" />,
    description: "Files, documents, and backups stored in the cloud"
  },
  {
    id: "communications",
    name: "Communications",
    icon: <Mail className="h-5 w-5" />,
    description: "Emails, messages, and call history"
  },
  {
    id: "media",
    name: "Photos & Videos",
    icon: <Camera className="h-5 w-5" />,
    description: "Your photos, videos, and media files"
  }
];

export default function DataPrivacy() {
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    toast.success("Your data export has been initiated. You'll receive an email when it's ready.");
    setTimeout(() => setIsExporting(false), 2000);
  };

  const toggleDataSelection = (id: string) => {
    setSelectedData(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const totalStorage = "17.8 GB";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data & Privacy</h1>
          <p className="text-muted-foreground mt-1">
            Manage your data, privacy settings, and account preferences
          </p>
        </div>

        {/* Storage Overview */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/20">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Your Alsamos Data</h3>
                  <p className="text-muted-foreground">Total data stored: {totalStorage}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExport} disabled={isExporting}>
                  <Download className="h-4 w-4" />
                  {isExporting ? "Preparing..." : "Download All Data"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="data" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Your Data
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              Privacy Controls
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <History className="h-4 w-4" />
              Activity Controls
            </TabsTrigger>
            <TabsTrigger value="delete" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </TabsTrigger>
          </TabsList>

          {/* Your Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Download Your Data</CardTitle>
                <CardDescription>
                  Select the data you want to download. We'll prepare a copy and send you a link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataCategories.map((category) => (
                  <div 
                    key={category.id}
                    onClick={() => toggleDataSelection(category.id)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                      selectedData.includes(category.id) 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${selectedData.includes(category.id) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Selected: {selectedData.length} categories</p>
                    <p className="text-sm text-muted-foreground">Export may take up to 24 hours</p>
                  </div>
                  <Button 
                    disabled={selectedData.length === 0 || isExporting}
                    onClick={handleExport}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Selected
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Exports */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Recent Exports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No recent exports</p>
                  <p className="text-xs mt-1">Select categories above to export your data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Controls Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Privacy Preferences</CardTitle>
                <CardDescription>Control how your data is used across Alsamos services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { 
                    icon: <Search className="h-5 w-5" />,
                    label: "Personalized Search Results", 
                    description: "Use your activity to improve search results",
                    enabled: true 
                  },
                  { 
                    icon: <Globe className="h-5 w-5" />,
                    label: "Web & App Activity", 
                    description: "Save your activity on Alsamos sites and apps",
                    enabled: true 
                  },
                  { 
                    icon: <MapPin className="h-5 w-5" />,
                    label: "Location History", 
                    description: "Save where you go with your devices",
                    enabled: false 
                  },
                  { 
                    icon: <Mic className="h-5 w-5" />,
                    label: "Voice & Audio Activity", 
                    description: "Save voice and audio recordings",
                    enabled: false 
                  },
                  { 
                    icon: <Monitor className="h-5 w-5" />,
                    label: "Device Information", 
                    description: "Use device info to improve your experience",
                    enabled: true 
                  },
                  { 
                    icon: <Activity className="h-5 w-5" />,
                    label: "Personalized Ads", 
                    description: "Show ads based on your interests",
                    enabled: false 
                  },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                        {setting.icon}
                      </div>
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={setting.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ad Settings */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Ad Personalization</CardTitle>
                <CardDescription>Manage how ads are personalized for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium">Ad Personalization</p>
                    <p className="text-sm text-muted-foreground">
                      When off, you'll still see ads but they may be less relevant
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline" className="w-full">Manage Ad Topics</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Controls Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>Review and manage your activity across Alsamos services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No activity recorded yet</p>
                  <p className="text-xs mt-1">Your activity history will appear here</p>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Delete */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Auto-Delete
                </CardTitle>
                <CardDescription>Automatically delete old activity data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div>
                    <p className="font-medium">Auto-delete activity older than</p>
                    <p className="text-sm text-muted-foreground">Currently set to 18 months</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["3 months", "18 months", "36 months"].map((period, i) => (
                    <Button 
                      key={period} 
                      variant={i === 1 ? "default" : "outline"} 
                      size="sm"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delete Account Tab */}
          <TabsContent value="delete" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Your Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your Alsamos account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <h4 className="font-semibold text-destructive mb-2">Warning: This action is irreversible</h4>
                  <p className="text-sm text-muted-foreground">
                    Deleting your account will permanently remove all your data, including:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" /> All files in Alsamos Cloud
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> All emails and communications
                    </li>
                    <li className="flex items-center gap-2">
                      <Camera className="h-4 w-4" /> All photos and videos
                    </li>
                    <li className="flex items-center gap-2">
                      <Activity className="h-4 w-4" /> All activity and history
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Access to all connected services
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Download your data first</p>
                      <p className="text-sm text-muted-foreground">
                        Before deleting, we recommend downloading a copy of your data
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 gap-2">
                        <Download className="h-4 w-4" />
                        Download Data
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">30-day recovery period</p>
                      <p className="text-sm text-muted-foreground">
                        After deletion, you have 30 days to recover your account before it's permanently removed
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Recovery */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Account Recovery</CardTitle>
                <CardDescription>Options to recover your account if needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium">Inactive Account Manager</p>
                    <p className="text-sm text-muted-foreground">
                      Choose what happens to your account after inactivity
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium">Account Backup Contact</p>
                    <p className="text-sm text-muted-foreground">
                      Add a trusted contact who can help recover your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Add Contact</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
