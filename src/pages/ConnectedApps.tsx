import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AppWindow,
  Search,
  Shield,
  ShieldCheck,
  ExternalLink,
  Trash2,
  Calendar,
  Clock,
  Globe,
  Mail,
  User,
  Database,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ConnectedApp {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  scope: string;
  created_at: string;
  expires_at: string;
  is_verified: boolean;
}

const scopeIcons: Record<string, React.ReactNode> = {
  "openid": <User className="h-4 w-4" />,
  "profile": <User className="h-4 w-4" />,
  "email": <Mail className="h-4 w-4" />,
  "offline_access": <Database className="h-4 w-4" />,
};

const scopeLabels: Record<string, string> = {
  "openid": "OpenID Connect",
  "profile": "Profile Information",
  "email": "Email Address",
  "offline_access": "Offline Access",
};

export default function ConnectedApps() {
  const { user } = useAuth();
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<ConnectedApp | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConnectedApps();
    }
  }, [user]);

  const fetchConnectedApps = async () => {
    try {
      // Fetch access tokens with client info
      const { data: tokens, error: tokensError } = await supabase
        .from('oauth_access_tokens')
        .select(`
          id,
          client_id,
          scope,
          created_at,
          expires_at,
          oauth_clients (
            name,
            description,
            logo_url,
            is_verified
          )
        `)
        .eq('user_id', user?.id)
        .eq('revoked', false)
        .order('created_at', { ascending: false });

      if (tokensError) throw tokensError;

      const connectedApps: ConnectedApp[] = (tokens || []).map((token: any) => ({
        id: token.id,
        client_id: token.client_id,
        name: token.oauth_clients?.name || 'Unknown App',
        description: token.oauth_clients?.description,
        logo_url: token.oauth_clients?.logo_url,
        scope: token.scope,
        created_at: token.created_at,
        expires_at: token.expires_at,
        is_verified: token.oauth_clients?.is_verified || false,
      }));

      setApps(connectedApps);
    } catch (error) {
      console.error('Error fetching connected apps:', error);
      toast.error('Failed to load connected apps');
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleRevokeAccess = async () => {
    if (!selectedApp) return;
    setRevoking(true);
    
    try {
      // Revoke the access token
      const { error } = await supabase
        .from('oauth_access_tokens')
        .update({ revoked: true })
        .eq('id', selectedApp.id);

      if (error) throw error;

      // Also revoke any refresh tokens for this client
      await supabase
        .from('oauth_refresh_tokens')
        .update({ revoked: true })
        .eq('client_id', selectedApp.client_id)
        .eq('user_id', user?.id);

      setApps((prev) => prev.filter((app) => app.id !== selectedApp.id));
      toast.success(`Access revoked for ${selectedApp.name}`);
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error('Failed to revoke access');
    } finally {
      setRevoking(false);
      setRevokeDialogOpen(false);
      setSelectedApp(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const parseScopes = (scope: string) => {
    return scope.split(' ').filter(Boolean);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Connected Apps</h1>
          <p className="text-muted-foreground">
            Manage third-party applications that have access to your Alsamos Account.
          </p>
        </div>

        {/* Security Overview */}
        <div className="grid md:grid-cols-3 gap-4 animate-fade-up delay-100">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <AppWindow className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {apps.length}
                </p>
                <p className="text-sm text-muted-foreground">Connected Apps</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {apps.filter((a) => a.is_verified).length}
                </p>
                <p className="text-sm text-muted-foreground">Verified Apps</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {apps.filter((a) => !a.is_verified).length}
                </p>
                <p className="text-sm text-muted-foreground">Third-Party Apps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-fade-up delay-200">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connected apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Apps List */}
        <div className="space-y-4 animate-fade-up delay-300">
          {filteredApps.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <AppWindow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No apps connected</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "You haven't authorized any third-party apps yet"}
              </p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {app.logo_url ? (
                      <img
                        src={app.logo_url}
                        alt={app.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {getInitials(app.name)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{app.name}</h3>
                        {app.is_verified && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {app.description && (
                        <p className="text-sm text-muted-foreground mb-3">{app.description}</p>
                      )}
                      
                      {/* Permissions */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {parseScopes(app.scope).map((scope) => (
                          <div
                            key={scope}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-muted-foreground"
                          >
                            {scopeIcons[scope] || <Shield className="h-3 w-3" />}
                            {scopeLabels[scope] || scope}
                          </div>
                        ))}
                      </div>
                      
                      {/* Access Info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Connected: {formatDate(app.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires: {formatDate(app.expires_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSelectedApp(app);
                        setRevokeDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Revoke Dialog */}
        <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke Access</DialogTitle>
              <DialogDescription>
                Are you sure you want to revoke access for{" "}
                <span className="font-semibold text-foreground">{selectedApp?.name}</span>?
                This app will no longer be able to access your Alsamos Account.
              </DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h4 className="font-medium text-foreground mb-2">
                  Permissions that will be revoked:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parseScopes(selectedApp.scope).map((scope) => (
                    <Badge key={scope} variant="secondary">
                      {scopeLabels[scope] || scope}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRevokeAccess}
                disabled={revoking}
              >
                {revoking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Revoke Access
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
