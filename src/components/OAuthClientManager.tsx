import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Settings,
  ExternalLink,
  CheckCircle,
  Globe,
  Key,
  Shield,
  RefreshCw,
  AlertTriangle,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OAuthClient {
  id: string;
  client_id: string;
  client_secret: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  redirect_uris: string[];
  allowed_scopes: string[];
  is_active: boolean | null;
  is_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const AVAILABLE_SCOPES = [
  { id: "openid", name: "OpenID", description: "Basic authentication" },
  { id: "profile", name: "Profile", description: "Name and profile picture" },
  { id: "email", name: "Email", description: "Email address" },
  { id: "phone", name: "Phone", description: "Phone number" },
  { id: "address", name: "Address", description: "Physical address" },
  { id: "offline_access", name: "Offline Access", description: "Refresh tokens" }
];

export function OAuthClientManager() {
  const { user } = useAuth();
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    description: "",
    redirect_uris: "",
    logo_url: "",
    scopes: ["openid", "profile", "email"]
  });

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("oauth_clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching OAuth clients:", error);
      toast.error("Failed to load OAuth applications");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast.error("Application name is required");
      return;
    }

    if (!newClient.redirect_uris.trim()) {
      toast.error("At least one redirect URI is required");
      return;
    }

    setIsCreating(true);

    try {
      const redirectUris = newClient.redirect_uris
        .split("\n")
        .map(uri => uri.trim())
        .filter(uri => uri.length > 0);

      const { data, error } = await supabase
        .from("oauth_clients")
        .insert({
          owner_id: user!.id,
          name: newClient.name,
          description: newClient.description || null,
          logo_url: newClient.logo_url || null,
          redirect_uris: redirectUris,
          allowed_scopes: newClient.scopes
        })
        .select()
        .single();

      if (error) throw error;

      setClients([data, ...clients]);
      setIsCreateDialogOpen(false);
      setNewClient({
        name: "",
        description: "",
        redirect_uris: "",
        logo_url: "",
        scopes: ["openid", "profile", "email"]
      });
      toast.success("OAuth application created successfully");
    } catch (error) {
      console.error("Error creating OAuth client:", error);
      toast.error("Failed to create OAuth application");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from("oauth_clients")
        .delete()
        .eq("id", clientId);

      if (error) throw error;

      setClients(clients.filter(c => c.id !== clientId));
      toast.success("OAuth application deleted");
    } catch (error) {
      console.error("Error deleting OAuth client:", error);
      toast.error("Failed to delete OAuth application");
    }
  };

  const handleToggleActive = async (clientId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("oauth_clients")
        .update({ is_active: !currentStatus })
        .eq("id", clientId);

      if (error) throw error;

      setClients(clients.map(c => 
        c.id === clientId ? { ...c, is_active: !currentStatus } : c
      ));
      toast.success(`Application ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Error updating OAuth client:", error);
      toast.error("Failed to update application status");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleSecretVisibility = (clientId: string) => {
    setShowSecrets(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const toggleScope = (scopeId: string) => {
    setNewClient(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scopeId)
        ? prev.scopes.filter(s => s !== scopeId)
        : [...prev.scopes, scopeId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">OAuth Applications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Register and manage OAuth 2.0 clients for your applications
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Register OAuth Application</DialogTitle>
              <DialogDescription>
                Create a new OAuth 2.0 client for your application
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name *</Label>
                <Input 
                  id="appName"
                  placeholder="My Application"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Brief description of your application"
                  value={newClient.description}
                  onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input 
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={newClient.logo_url}
                  onChange={(e) => setNewClient({...newClient, logo_url: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="redirectUris">Redirect URIs * (one per line)</Label>
                <Textarea 
                  id="redirectUris"
                  placeholder="https://example.com/callback&#10;https://localhost:3000/callback"
                  value={newClient.redirect_uris}
                  onChange={(e) => setNewClient({...newClient, redirect_uris: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Allowed Scopes</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <div 
                      key={scope.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted"
                      onClick={() => toggleScope(scope.id)}
                    >
                      <Checkbox checked={newClient.scopes.includes(scope.id)} />
                      <div>
                        <p className="text-sm font-medium">{scope.name}</p>
                        <p className="text-xs text-muted-foreground">{scope.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClient} disabled={isCreating}>
                {isCreating ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  "Create Application"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No OAuth Applications</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Register your first OAuth application to enable third-party authentication
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Register Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Client Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        client.is_active ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {client.logo_url ? (
                          <img src={client.logo_url} alt={client.name} className="h-8 w-8 rounded" />
                        ) : (
                          <Globe className={`h-6 w-6 ${client.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{client.name}</h3>
                          <Badge variant={client.is_active ? "default" : "secondary"}>
                            {client.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {client.is_verified && (
                            <Badge variant="outline" className="text-green-500 border-green-500/30 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {client.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={client.is_active ?? false}
                      onCheckedChange={() => handleToggleActive(client.id, client.is_active)}
                    />
                  </div>

                  <Separator />

                  {/* Client Credentials */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Client ID</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm truncate">
                          {client.client_id}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => copyToClipboard(client.client_id, "Client ID")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Client Secret</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm truncate">
                          {showSecrets[client.id] ? client.client_secret : "secret_••••••••••••••••••••"}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleSecretVisibility(client.id)}
                        >
                          {showSecrets[client.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => copyToClipboard(client.client_secret, "Client Secret")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Redirect URIs */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Redirect URIs</Label>
                    <div className="flex flex-wrap gap-2">
                      {client.redirect_uris.map((uri, i) => (
                        <Badge key={i} variant="secondary" className="gap-1 font-mono text-xs">
                          <ExternalLink className="h-3 w-3" />
                          {uri}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Scopes */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Allowed Scopes</Label>
                    <div className="flex flex-wrap gap-2">
                      {client.allowed_scopes.map((scope, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <RefreshCw className="h-4 w-4" />
                      Rotate Secret
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-destructive hover:text-destructive ml-auto"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>

                  {/* Warning */}
                  {!client.is_verified && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        This application is unverified. Users will see a warning when authorizing.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
