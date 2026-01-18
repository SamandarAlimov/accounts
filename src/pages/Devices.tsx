import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop,
  MapPin, 
  Clock, 
  Trash2, 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  device_name: string;
  device_type: string;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  location: string | null;
  is_current: boolean;
  last_active: string;
  created_at: string;
}

const getDeviceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    case "laptop":
      return Laptop;
    default:
      return Monitor;
  }
};

export default function Devices() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSessions();
      // Create current session if none exists
      createCurrentSession();
    }
  }, [user]);

  const createCurrentSession = async () => {
    try {
      // Check if current session exists
      const { data: existing } = await supabase
        .from("user_sessions")
        .select("id")
        .eq("user_id", user?.id)
        .eq("is_current", true)
        .maybeSingle();

      if (!existing) {
        // Create a mock current session
        const deviceInfo = getDeviceInfo();
        await supabase.from("user_sessions").insert({
          user_id: user?.id,
          device_name: deviceInfo.name,
          device_type: deviceInfo.type,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          location: "Current Location",
          is_current: true,
        });
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let name = "Unknown Device";
    let type = "desktop";
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    // Detect OS
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS") || ua.includes("iPhone")) os = "iOS";

    // Detect Browser
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    // Detect Device Type
    if (/Mobile|Android|iPhone/.test(ua)) {
      type = "mobile";
      name = ua.includes("iPhone") ? "iPhone" : "Android Phone";
    } else if (/iPad|Tablet/.test(ua)) {
      type = "tablet";
      name = "Tablet";
    } else if (ua.includes("Mac")) {
      type = "laptop";
      name = "MacBook";
    } else {
      name = `${os} Desktop`;
    }

    return { name, type, browser, os };
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user?.id)
        .order("last_active", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeSession = async (sessionId: string) => {
    setRemoving(sessionId);
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Session removed successfully");
    } catch (error) {
      toast.error("Failed to remove session");
    } finally {
      setRemoving(null);
    }
  };

  const removeAllOtherSessions = async () => {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", user?.id)
        .eq("is_current", false);

      if (error) throw error;
      setSessions(prev => prev.filter(s => s.is_current));
      toast.success("All other sessions removed");
    } catch (error) {
      toast.error("Failed to remove sessions");
    }
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

  const currentSession = sessions.find(s => s.is_current);
  const otherSessions = sessions.filter(s => !s.is_current);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Devices</h1>
          <p className="text-muted-foreground">
            Manage your active sessions and signed-in devices.
          </p>
        </div>

        {/* Current Device */}
        {currentSession && (
          <div className="glass-card p-6 animate-fade-up delay-100">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h2 className="font-semibold text-foreground">Current Device</h2>
            </div>
            <DeviceCard session={currentSession} isCurrent />
          </div>
        )}

        {/* Other Sessions */}
        <div className="glass-card p-6 animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Other Active Sessions</h2>
            </div>
            {otherSessions.length > 0 && (
              <Button variant="destructive" size="sm" onClick={removeAllOtherSessions}>
                Sign out all other devices
              </Button>
            )}
          </div>

          {otherSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No other active sessions</p>
              <p className="text-sm mt-1">You're only signed in on this device</p>
            </div>
          ) : (
            <div className="space-y-4">
              {otherSessions.map((session) => (
                <DeviceCard
                  key={session.id}
                  session={session}
                  onRemove={() => removeSession(session.id)}
                  removing={removing === session.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 animate-fade-up delay-300">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Security Tip</p>
            <p className="text-sm text-muted-foreground mt-1">
              If you see any device you don't recognize, remove it immediately and change your password.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DeviceCard({ 
  session, 
  isCurrent = false,
  onRemove,
  removing = false
}: { 
  session: Session; 
  isCurrent?: boolean;
  onRemove?: () => void;
  removing?: boolean;
}) {
  const DeviceIcon = getDeviceIcon(session.device_type);

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl ${isCurrent ? "bg-green-500/5 border border-green-500/20" : "bg-muted/30 hover:bg-muted/50"} transition-colors`}>
      <div className={`p-3 rounded-xl ${isCurrent ? "bg-green-500/10" : "bg-background"}`}>
        <DeviceIcon className={`h-6 w-6 ${isCurrent ? "text-green-500" : "text-foreground"}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{session.device_name}</span>
          {isCurrent && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
              This device
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
          {session.browser && session.os && (
            <span>{session.browser} on {session.os}</span>
          )}
          {session.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {session.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
          </span>
        </div>
      </div>

      {!isCurrent && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          disabled={removing}
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
