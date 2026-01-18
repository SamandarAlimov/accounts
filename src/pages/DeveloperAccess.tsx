import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OAuthClientManager } from "@/components/OAuthClientManager";
import { ApiUsageChart } from "@/components/ApiUsageChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Trash2, 
  Globe, 
  Activity,
  Code,
  Terminal,
  Zap,
  Loader2,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ApiKey {
  id: string;
  name: string;
  api_key: string;
  secret_key?: string | null;
  created_at: string;
  last_used_at: string | null;
  requests_today: number;
  requests_limit: number;
  domains: string[] | null;
  is_active: boolean | null;
  key_type: string;
}

interface UsageLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number | null;
  ip_address: string | null;
  user_agent: string | null;
  error_message: string | null;
  created_at: string;
}

export default function DeveloperAccess() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState<"public" | "secret">("public");
  const [creating, setCreating] = useState(false);
  const [domainInputs, setDomainInputs] = useState<Record<string, string>>({});
  const [showDomainInput, setShowDomainInput] = useState<Record<string, boolean>>({});
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedKeyForLogs, setSelectedKeyForLogs] = useState<ApiKey | null>(null);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logStats, setLogStats] = useState({
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    errorCount: 0
  });
  const [rateLimitDialogOpen, setRateLimitDialogOpen] = useState(false);
  const [selectedKeyForRateLimit, setSelectedKeyForRateLimit] = useState<ApiKey | null>(null);
  const [newRateLimit, setNewRateLimit] = useState<string>("");
  const [updatingRateLimit, setUpdatingRateLimit] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user!.id,
          name: newKeyName.trim(),
          key_type: newKeyType,
        })
        .select()
        .single();

      if (error) throw error;

      setApiKeys(prev => [data, ...prev]);
      setCreateDialogOpen(false);
      setNewKeyName("");
      setNewKeyType("public");
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const regenerateKey = async (keyId: string) => {
    try {
      // Generate new keys
      const newApiKey = 'ak_' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      const newSecretKey = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('api_keys')
        .update({ 
          api_key: newApiKey,
          secret_key: newSecretKey 
        })
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, api_key: newApiKey, secret_key: newSecretKey } : key
      ));
      toast.success("API key regenerated successfully");
    } catch (error) {
      console.error('Error regenerating key:', error);
      toast.error('Failed to regenerate API key');
    }
  };

  const toggleKeyStatus = async (keyId: string) => {
    const key = apiKeys.find(k => k.id === keyId);
    if (!key) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !key.is_active })
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.map(k => 
        k.id === keyId ? { ...k, is_active: !k.is_active } : k
      ));
      toast.success("Key status updated");
    } catch (error) {
      console.error('Error updating key status:', error);
      toast.error('Failed to update key status');
    }
  };

  const deleteKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success("API key deleted");
    } catch (error) {
      console.error('Error deleting key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const addDomain = async (keyId: string) => {
    const domain = domainInputs[keyId]?.trim();
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }

    // Basic domain validation
    const domainRegex = /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$|^localhost(:\d+)?$/;
    if (!domainRegex.test(domain)) {
      toast.error('Please enter a valid domain');
      return;
    }

    const key = apiKeys.find(k => k.id === keyId);
    if (!key) return;

    const currentDomains = key.domains || [];
    if (currentDomains.includes(domain)) {
      toast.error('Domain already exists');
      return;
    }

    const newDomains = [...currentDomains, domain];

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ domains: newDomains })
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.map(k => 
        k.id === keyId ? { ...k, domains: newDomains } : k
      ));
      setDomainInputs(prev => ({ ...prev, [keyId]: '' }));
      setShowDomainInput(prev => ({ ...prev, [keyId]: false }));
      toast.success('Domain added');
    } catch (error) {
      console.error('Error adding domain:', error);
      toast.error('Failed to add domain');
    }
  };

  const removeDomain = async (keyId: string, domainToRemove: string) => {
    const key = apiKeys.find(k => k.id === keyId);
    if (!key) return;

    const newDomains = (key.domains || []).filter(d => d !== domainToRemove);

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ domains: newDomains })
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.map(k => 
        k.id === keyId ? { ...k, domains: newDomains } : k
      ));
      toast.success('Domain removed');
    } catch (error) {
      console.error('Error removing domain:', error);
      toast.error('Failed to remove domain');
    }
  };

  const fetchUsageLogs = async (apiKey: ApiKey) => {
    setSelectedKeyForLogs(apiKey);
    setLogsDialogOpen(true);
    setLogsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .eq('api_key_id', apiKey.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setUsageLogs(data || []);
      
      // Calculate stats
      const logs = data || [];
      const successCount = logs.filter(l => l.status_code >= 200 && l.status_code < 300).length;
      const responseTimes = logs.filter(l => l.response_time_ms).map(l => l.response_time_ms as number);
      
      setLogStats({
        totalRequests: logs.length,
        successRate: logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0,
        avgResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
        errorCount: logs.filter(l => l.status_code >= 400).length
      });
    } catch (error) {
      console.error('Error fetching usage logs:', error);
      toast.error('Failed to load usage logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const openRateLimitDialog = (apiKey: ApiKey) => {
    setSelectedKeyForRateLimit(apiKey);
    setNewRateLimit(apiKey.requests_limit.toString());
    setRateLimitDialogOpen(true);
  };

  const updateRateLimit = async () => {
    if (!selectedKeyForRateLimit) return;
    
    const limit = parseInt(newRateLimit, 10);
    if (isNaN(limit) || limit < 100) {
      toast.error('Rate limit must be at least 100 requests');
      return;
    }
    if (limit > 1000000) {
      toast.error('Rate limit cannot exceed 1,000,000 requests');
      return;
    }

    setUpdatingRateLimit(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ requests_limit: limit })
        .eq('id', selectedKeyForRateLimit.id);

      if (error) throw error;

      setApiKeys(prev => prev.map(k => 
        k.id === selectedKeyForRateLimit.id ? { ...k, requests_limit: limit } : k
      ));
      setRateLimitDialogOpen(false);
      toast.success('Rate limit updated');
    } catch (error) {
      console.error('Error updating rate limit:', error);
      toast.error('Failed to update rate limit');
    } finally {
      setUpdatingRateLimit(false);
    }
  };

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests_today, 0);
  const totalLimit = apiKeys.reduce((sum, key) => sum + key.requests_limit, 0);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeVariant = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'default';
    if (statusCode >= 400 && statusCode < 500) return 'secondary';
    return 'destructive';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-green-500';
      case 'POST': return 'text-blue-500';
      case 'PUT': return 'text-amber-500';
      case 'PATCH': return 'text-orange-500';
      case 'DELETE': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const exportLogsToCSV = () => {
    if (usageLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Method', 'Endpoint', 'Status Code', 'Response Time (ms)', 'IP Address', 'User Agent', 'Error Message'];
    
    const csvRows = [
      headers.join(','),
      ...usageLogs.map(log => [
        `"${formatDateTime(log.created_at)}"`,
        log.method,
        `"${log.endpoint}"`,
        log.status_code,
        log.response_time_ms || '',
        log.ip_address || '',
        `"${(log.user_agent || '').replace(/"/g, '""')}"`,
        `"${(log.error_message || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `api-logs-${selectedKeyForLogs?.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Logs exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Access</h1>
          <p className="text-muted-foreground mt-1">
            Manage API keys, OAuth applications, and monitor usage
          </p>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="oauth-apps">OAuth Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="oauth-apps">
            <OAuthClientManager />
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>
                      Create a new API key to access Alsamos services.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="key-name">Key Name</Label>
                      <Input
                        id="key-name"
                        placeholder="e.g., Production API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Key Type</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="key-type"
                            checked={newKeyType === "public"}
                            onChange={() => setNewKeyType("public")}
                            className="h-4 w-4"
                          />
                          <span>Public</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="key-type"
                            checked={newKeyType === "secret"}
                            onChange={() => setNewKeyType("secret")}
                            className="h-4 w-4"
                          />
                          <span>Secret</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createApiKey} disabled={creating}>
                      {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Key
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Usage Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Requests</p>
                      <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-500/10">
                      <Key className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Keys</p>
                      <p className="text-2xl font-bold">{apiKeys.filter(k => k.is_active).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <Globe className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Allowed Domains</p>
                      <p className="text-2xl font-bold">{apiKeys.reduce((sum, k) => sum + (k.domains?.length || 0), 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rate Limit</p>
                      <p className="text-2xl font-bold">{totalLimit > 0 ? Math.round((totalRequests / totalLimit) * 100) : 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Chart */}
            <ApiUsageChart />

            {/* API Keys List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your API Keys</h2>
              
              {loading ? (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-12 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : apiKeys.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-12 text-center">
                    <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No API Keys</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first API key to get started with the Alsamos API.
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                apiKeys.map((apiKey) => (
                  <Card key={apiKey.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Key Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${apiKey.is_active ? 'bg-green-500/10' : 'bg-muted'}`}>
                              <Key className={`h-5 w-5 ${apiKey.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{apiKey.name}</h3>
                                <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                                  {apiKey.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {apiKey.key_type === "public" ? "Public" : "Secret"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Created {formatDate(apiKey.created_at)} • Last used {formatDate(apiKey.last_used_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={apiKey.is_active} 
                              onCheckedChange={() => toggleKeyStatus(apiKey.id)}
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* API Key Display */}
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">API Key</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
                                {apiKey.api_key}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => copyToClipboard(apiKey.api_key, "API Key")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {apiKey.secret_key && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Secret Key</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
                                  {showSecrets[apiKey.id] ? apiKey.secret_key : "sk_••••••••••••••••••••••••••••••••••••••••"}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => toggleSecretVisibility(apiKey.id)}
                                >
                                  {showSecrets[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => copyToClipboard(apiKey.secret_key!, "Secret Key")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Usage Progress & Rate Limit */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Daily Usage</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {apiKey.requests_today.toLocaleString()} / {apiKey.requests_limit.toLocaleString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => openRateLimitDialog(apiKey)}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Configure
                              </Button>
                            </div>
                          </div>
                          <Progress 
                            value={(apiKey.requests_today / apiKey.requests_limit) * 100} 
                            className="h-2"
                          />
                        </div>

                        {/* Allowed Domains */}
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Allowed Domains</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {(apiKey.domains || []).map((domain, i) => (
                              <Badge key={i} variant="secondary" className="gap-1 group">
                                <Globe className="h-3 w-3" />
                                {domain}
                                <button
                                  onClick={() => removeDomain(apiKey.id, domain)}
                                  className="ml-1 opacity-60 hover:opacity-100 hover:text-destructive transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            {(apiKey.domains || []).length === 0 && !showDomainInput[apiKey.id] && (
                              <span className="text-sm text-muted-foreground">No domain restrictions</span>
                            )}
                            {showDomainInput[apiKey.id] ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="e.g., api.example.com"
                                  value={domainInputs[apiKey.id] || ''}
                                  onChange={(e) => setDomainInputs(prev => ({ ...prev, [apiKey.id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && addDomain(apiKey.id)}
                                  className="h-7 w-48 text-sm"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 px-2"
                                  onClick={() => addDomain(apiKey.id)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 px-2"
                                  onClick={() => {
                                    setShowDomainInput(prev => ({ ...prev, [apiKey.id]: false }));
                                    setDomainInputs(prev => ({ ...prev, [apiKey.id]: '' }));
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs"
                                onClick={() => setShowDomainInput(prev => ({ ...prev, [apiKey.id]: true }))}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Domain
                              </Button>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => regenerateKey(apiKey.id)}>
                            <RefreshCw className="h-4 w-4" />
                            Regenerate
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => fetchUsageLogs(apiKey)}
                          >
                            <Terminal className="h-4 w-4" />
                            View Logs
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 text-destructive hover:text-destructive ml-auto"
                            onClick={() => deleteKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Quick Start Guide */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Quick Start
                </CardTitle>
                <CardDescription>Get started with the Alsamos API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-xl p-4">
                    <pre className="text-sm font-mono overflow-x-auto">
{`curl -X GET "https://api.alsamos.com/v1/user" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Documentation</Button>
                    <Button variant="outline" size="sm">API Reference</Button>
                    <Button variant="outline" size="sm">SDKs</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Usage Logs Dialog */}
        <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh]">
            <DialogHeader className="flex flex-row items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  API Usage Logs - {selectedKeyForLogs?.name}
                </DialogTitle>
                <DialogDescription>
                  Detailed request history for this API key
                </DialogDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={exportLogsToCSV}
                disabled={usageLogs.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </DialogHeader>

            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Total Requests</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">{logStats.totalRequests}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">{logStats.successRate}%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Avg Response</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">{logStats.avgResponseTime}ms</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-muted-foreground">Errors</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">{logStats.errorCount}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Logs Table */}
                <ScrollArea className="h-[400px] rounded-lg border">
                  {usageLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No logs yet</h3>
                      <p className="text-muted-foreground text-sm">
                        API requests made with this key will appear here
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">Timestamp</TableHead>
                          <TableHead className="w-[80px]">Method</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead className="w-[80px]">Status</TableHead>
                          <TableHead className="w-[100px]">Response</TableHead>
                          <TableHead className="w-[120px]">IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usageLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDateTime(log.created_at)}
                            </TableCell>
                            <TableCell>
                              <span className={`font-mono text-xs font-semibold ${getMethodColor(log.method)}`}>
                                {log.method}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs max-w-[200px] truncate">
                              {log.endpoint}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(log.status_code)}>
                                {log.status_code}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {log.response_time_ms ? (
                                <span className="flex items-center gap-1">
                                  {log.response_time_ms}ms
                                  {log.response_time_ms < 200 ? (
                                    <ArrowDownRight className="h-3 w-3 text-green-500" />
                                  ) : log.response_time_ms > 1000 ? (
                                    <ArrowUpRight className="h-3 w-3 text-destructive" />
                                  ) : null}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {log.ip_address || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rate Limit Configuration Dialog */}
        <Dialog open={rateLimitDialogOpen} onOpenChange={setRateLimitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Configure Rate Limit
              </DialogTitle>
              <DialogDescription>
                Set the daily request limit for "{selectedKeyForRateLimit?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Daily Request Limit</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  min={100}
                  max={1000000}
                  value={newRateLimit}
                  onChange={(e) => setNewRateLimit(e.target.value)}
                  placeholder="e.g., 10000"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: 100 requests • Maximum: 1,000,000 requests
                </p>
              </div>
              
              {/* Quick Select Options */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Quick Select</Label>
                <div className="flex flex-wrap gap-2">
                  {[1000, 5000, 10000, 50000, 100000].map((limit) => (
                    <Button
                      key={limit}
                      variant={newRateLimit === limit.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewRateLimit(limit.toString())}
                    >
                      {limit.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedKeyForRateLimit && (
                <div className="rounded-lg bg-muted p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Usage</span>
                    <span className="font-medium">{selectedKeyForRateLimit.requests_today.toLocaleString()} requests</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Limit</span>
                    <span className="font-medium">{selectedKeyForRateLimit.requests_limit.toLocaleString()} requests</span>
                  </div>
                  <Progress 
                    value={(selectedKeyForRateLimit.requests_today / selectedKeyForRateLimit.requests_limit) * 100}
                    className="h-2"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRateLimitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateRateLimit} disabled={updatingRateLimit}>
                {updatingRateLimit && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Limit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
