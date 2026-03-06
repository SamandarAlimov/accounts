import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Globe,
  LogOut,
  Info,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

const getDeviceColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "mobile":
      return "text-blue-500 bg-blue-500/10";
    case "tablet":
      return "text-purple-500 bg-purple-500/10";
    case "laptop":
      return "text-emerald-500 bg-emerald-500/10";
    default:
      return "text-primary bg-primary/10";
  }
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let name = "Unknown Device";
  let type = "desktop";
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone")) os = "iOS";

  if (ua.includes("Chrome") && !ua.includes("Edge")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

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

export default function Devices() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removingAll, setRemovingAll] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("last_active", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCurrentSession = useCallback(async () => {
    if (!user) return;
    try {
      const { data: existing } = await supabase
        .from("user_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_current", true)
        .maybeSingle();

      if (!existing) {
        const deviceInfo = getDeviceInfo();
        await supabase.from("user_sessions").insert({
          user_id: user.id,
          device_name: deviceInfo.name,
          device_type: deviceInfo.type,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          location: "Current Location",
          is_current: true,
        });
        fetchSessions();
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  }, [user, fetchSessions]);

  useEffect(() => {
    if (user) {
      fetchSessions();
      createCurrentSession();
    }
  }, [user, fetchSessions, createCurrentSession]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user_sessions_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_sessions",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSessions]);

  const removeSession = async (sessionId: string) => {
    setRemoving(sessionId);
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Device signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out device");
    } finally {
      setRemoving(null);
    }
  };

  const removeAllOtherSessions = async () => {
    setRemovingAll(true);
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", user?.id)
        .eq("is_current", false);

      if (error) throw error;
      setSessions((prev) => prev.filter((s) => s.is_current));
      toast.success("All other devices signed out");
    } catch (error) {
      toast.error("Failed to sign out devices");
    } finally {
      setRemovingAll(false);
    }
  };

  const currentSession = sessions.find((s) => s.is_current);
  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Your devices
              </h1>
              <p className="text-sm text-muted-foreground">
                You're currently signed in on {sessions.length} device
                {sessions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4 animate-fade-up delay-100">
            <SummaryCard
              icon={<Wifi className="h-4 w-4" />}
              label="Active now"
              value={sessions.length.toString()}
              color="text-emerald-500 bg-emerald-500/10"
            />
            <SummaryCard
              icon={<Smartphone className="h-4 w-4" />}
              label="Mobile"
              value={sessions.filter((s) => s.device_type === "mobile").length.toString()}
              color="text-blue-500 bg-blue-500/10"
            />
            <SummaryCard
              icon={<Monitor className="h-4 w-4" />}
              label="Desktop"
              value={sessions.filter((s) => ["desktop", "laptop"].includes(s.device_type)).length.toString()}
              color="text-primary bg-primary/10"
            />
          </div>
        )}

        {loading ? (
          <DevicesLoadingSkeleton />
        ) : (
          <>
            {/* Current Device */}
            {currentSession && (
              <div className="glass-card overflow-hidden animate-fade-up delay-200">
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                      This device
                    </h2>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active now
                  </Badge>
                </div>
                <div className="p-6">
                  <DeviceCard
                    session={currentSession}
                    isCurrent
                    expanded={expandedSession === currentSession.id}
                    onToggleExpand={() =>
                      setExpandedSession(
                        expandedSession === currentSession.id ? null : currentSession.id
                      )
                    }
                  />
                </div>
              </div>
            )}

            {/* Other Sessions */}
            <div className="glass-card overflow-hidden animate-fade-up delay-300">
              <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    Other sessions ({otherSessions.length})
                  </h2>
                </div>
                {otherSessions.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                        disabled={removingAll}
                      >
                        {removingAll ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <LogOut className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Sign out all
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign out all other devices?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign you out of {otherSessions.length} other device
                          {otherSessions.length !== 1 ? "s" : ""}. You'll need to
                          sign in again on those devices.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={removeAllOtherSessions}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sign out all
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {otherSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <WifiOff className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-foreground mb-1">
                    No other active sessions
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    You're only signed in on this device. If you sign in
                    elsewhere, those sessions will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {otherSessions.map((session) => (
                    <div key={session.id} className="p-6">
                      <DeviceCard
                        session={session}
                        onRemove={() => removeSession(session.id)}
                        removing={removing === session.id}
                        expanded={expandedSession === session.id}
                        onToggleExpand={() =>
                          setExpandedSession(
                            expandedSession === session.id ? null : session.id
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="glass-card p-5 animate-fade-up delay-400">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 h-fit">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Don't recognize a device?
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    If you see a device you don't recognize, sign it out
                    immediately and{" "}
                    <a
                      href="/dashboard/security"
                      className="text-primary hover:underline font-medium"
                    >
                      change your password
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 px-1 animate-fade-up delay-500">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sessions show where you're signed in to your Alsamos Account. These
                include devices currently accessing your account. You can sign out
                any session you don't recognize to protect your account.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ─── Summary Card ─── */
function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ─── Device Card ─── */
function DeviceCard({
  session,
  isCurrent = false,
  onRemove,
  removing = false,
  expanded = false,
  onToggleExpand,
}: {
  session: Session;
  isCurrent?: boolean;
  onRemove?: () => void;
  removing?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const DeviceIcon = getDeviceIcon(session.device_type);
  const colorClasses = isCurrent
    ? "text-emerald-500 bg-emerald-500/10"
    : getDeviceColor(session.device_type);

  const isActive =
    new Date(session.last_active).getTime() > Date.now() - 5 * 60 * 1000;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClasses}`}>
          <DeviceIcon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">
              {session.device_name}
            </span>
            {isActive && (
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-sm text-muted-foreground">
            {session.browser && session.os && (
              <span>
                {session.browser} · {session.os}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(session.last_active), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isCurrent && onRemove && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                  disabled={removing}
                >
                  {removing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="h-3.5 w-3.5 mr-1" />
                      Sign out
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out this device?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign out "{session.device_name}" (
                    {session.browser} on {session.os}). You'll need to sign in
                    again on that device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemove}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sign out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={onToggleExpand}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="ml-[3.75rem] grid grid-cols-2 gap-3 pt-2 border-t border-border/30 animate-fade-in">
          <DetailItem label="Device" value={session.device_name} />
          <DetailItem label="Browser" value={session.browser || "Unknown"} />
          <DetailItem label="Operating System" value={session.os || "Unknown"} />
          <DetailItem
            label="Location"
            value={session.location || "Unknown"}
            icon={<MapPin className="h-3 w-3" />}
          />
          <DetailItem
            label="IP Address"
            value={session.ip_address || "Not available"}
          />
          <DetailItem
            label="First sign-in"
            value={format(new Date(session.created_at), "MMM d, yyyy 'at' h:mm a")}
          />
          <DetailItem
            label="Last activity"
            value={format(new Date(session.last_active), "MMM d, yyyy 'at' h:mm a")}
          />
          <DetailItem
            label="Status"
            value={isActive ? "Active now" : "Inactive"}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Detail Item ─── */
function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground flex items-center gap-1">
        {icon}
        {value}
      </p>
    </div>
  );
}

/* ─── Loading Skeleton ─── */
function DevicesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
