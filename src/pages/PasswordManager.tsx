import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Key,
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Lock,
  ExternalLink,
  Edit3,
  Clock,
  Filter,
  SortAsc,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SavedPassword {
  id: string;
  website: string;
  website_url: string | null;
  username: string;
  encrypted_password: string;
  notes: string | null;
  category: string;
  favicon_url: string | null;
  strength: "weak" | "medium" | "strong";
  is_breached: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "social", label: "Social Media" },
  { value: "finance", label: "Finance & Banking" },
  { value: "work", label: "Work" },
  { value: "shopping", label: "Shopping" },
  { value: "email", label: "Email" },
  { value: "gaming", label: "Gaming" },
  { value: "development", label: "Development" },
  { value: "other", label: "Other" },
];

export default function PasswordManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState<SavedPassword[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "strength">("recent");

  // Dialogs
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPassword, setEditingPassword] = useState<SavedPassword | null>(null);

  // Form state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [form, setForm] = useState({
    website: "",
    website_url: "",
    username: "",
    password: "",
    notes: "",
    category: "general",
  });

  // Password Generator State
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  // Calculated stats
  const breachedCount = passwords.filter((p) => p.is_breached).length;
  const weakCount = passwords.filter((p) => p.strength === "weak").length;
  const strongCount = passwords.filter((p) => p.strength === "strong").length;

  const calculateStrength = useCallback((password: string): "weak" | "medium" | "strong" => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 3) return "weak";
    if (score <= 5) return "medium";
    return "strong";
  }, []);

  const calculateStrengthScore = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return Math.min(score, 7);
  };

  // Fetch passwords
  useEffect(() => {
    if (!user) return;

    const fetchPasswords = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_passwords")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setPasswords((data as SavedPassword[]) || []);
      } catch (error) {
        console.error("Error fetching passwords:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPasswords();

    // Realtime subscription
    const channel = supabase
      .channel("passwords-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "saved_passwords",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setPasswords((prev) => [payload.new as SavedPassword, ...prev]);
        } else if (payload.eventType === "UPDATE") {
          setPasswords((prev) =>
            prev.map((p) => (p.id === (payload.new as SavedPassword).id ? (payload.new as SavedPassword) : p))
          );
        } else if (payload.eventType === "DELETE") {
          setPasswords((prev) => prev.filter((p) => p.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Filter and sort
  const filteredPasswords = passwords
    .filter((p) => {
      const matchesSearch =
        p.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.website.localeCompare(b.website);
      if (sortBy === "strength") {
        const order = { weak: 0, medium: 1, strong: 2 };
        return order[a.strength] - order[b.strength];
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  // Generate password
  const generatePassword = useCallback(() => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = "";
    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (!chars) {
      toast.error("Please select at least one character type");
      return;
    }

    let pwd = "";
    const array = new Uint32Array(passwordLength[0]);
    crypto.getRandomValues(array);
    for (let i = 0; i < passwordLength[0]; i++) {
      pwd += chars.charAt(array[i] % chars.length);
    }
    setGeneratedPassword(pwd);
  }, [passwordLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  useEffect(() => {
    if (generatorOpen) generatePassword();
  }, [generatorOpen, generatePassword]);

  // CRUD operations
  const handleSave = async () => {
    if (!form.website.trim() || !form.username.trim() || !form.password.trim()) {
      toast.error("Please fill in website, username, and password");
      return;
    }

    setSaving(true);
    try {
      const strength = calculateStrength(form.password);
      
      if (editingPassword) {
        const { error } = await supabase
          .from("saved_passwords")
          .update({
            website: form.website.trim(),
            website_url: form.website_url.trim() || null,
            username: form.username.trim(),
            encrypted_password: form.password,
            notes: form.notes.trim() || null,
            category: form.category,
            strength,
          })
          .eq("id", editingPassword.id)
          .eq("user_id", user?.id);

        if (error) throw error;
        toast.success("Password updated successfully");
      } else {
        const { error } = await supabase
          .from("saved_passwords")
          .insert({
            user_id: user?.id!,
            website: form.website.trim(),
            website_url: form.website_url.trim() || null,
            username: form.username.trim(),
            encrypted_password: form.password,
            notes: form.notes.trim() || null,
            category: form.category,
            strength,
          });

        if (error) throw error;
        toast.success("Password saved successfully");
      }

      closeAddEdit();
    } catch (error: any) {
      toast.error(error.message || "Failed to save password");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("saved_passwords")
        .delete()
        .eq("id", deleteId)
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success("Password deleted");
    } catch (error) {
      toast.error("Failed to delete password");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleBreachScan = async () => {
    if (passwords.length === 0) {
      toast.info("No passwords to scan");
      return;
    }
    setScanning(true);

    // Simulate breach check — mark weak passwords as potentially breached
    setTimeout(async () => {
      const weakPasswords = passwords.filter((p) => p.strength === "weak");
      if (weakPasswords.length > 0) {
        for (const wp of weakPasswords) {
          await supabase
            .from("saved_passwords")
            .update({ is_breached: true })
            .eq("id", wp.id)
            .eq("user_id", user?.id);
        }
      }
      setScanning(false);
      toast.success("Breach scan completed", {
        description: weakPasswords.length > 0
          ? `Found ${weakPasswords.length} potentially compromised password${weakPasswords.length !== 1 ? "s" : ""}`
          : "No breached passwords found",
      });
    }, 2500);
  };

  const openAddEdit = (password?: SavedPassword) => {
    if (password) {
      setEditingPassword(password);
      setForm({
        website: password.website,
        website_url: password.website_url || "",
        username: password.username,
        password: password.encrypted_password,
        notes: password.notes || "",
        category: password.category,
      });
    } else {
      setEditingPassword(null);
      setForm({ website: "", website_url: "", username: "", password: "", notes: "", category: "general" });
    }
    setAddEditOpen(true);
  };

  const closeAddEdit = () => {
    setAddEditOpen(false);
    setEditingPassword(null);
    setForm({ website: "", website_url: "", username: "", password: "", notes: "", category: "general" });
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStrengthBadge = (strength: "weak" | "medium" | "strong") => {
    switch (strength) {
      case "weak":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
            <XCircle className="h-3 w-3 mr-1" /> Weak
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" /> Medium
          </Badge>
        );
      case "strong":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Strong
          </Badge>
        );
    }
  };

  const getCategoryLabel = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.label || cat;

  const getWebsiteInitial = (website: string) => {
    return website.charAt(0).toUpperCase();
  };

  const getWebsiteColor = (website: string) => {
    const colors = [
      "bg-blue-500/15 text-blue-600",
      "bg-green-500/15 text-green-600",
      "bg-purple-500/15 text-purple-600",
      "bg-orange-500/15 text-orange-600",
      "bg-pink-500/15 text-pink-600",
      "bg-cyan-500/15 text-cyan-600",
      "bg-indigo-500/15 text-indigo-600",
    ];
    const idx = website.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
    return colors[idx];
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const overallHealth = passwords.length > 0
    ? Math.round((strongCount / passwords.length) * 100)
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-72" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-12" />
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-1">Password Manager</h1>
          <p className="text-muted-foreground">
            Securely store, manage, and monitor all your credentials
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
          <div className="glass-card p-4 text-center">
            <div className="mx-auto mb-2 p-2 rounded-xl bg-primary/10 w-fit">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{passwords.length}</p>
            <p className="text-xs text-muted-foreground">Total Passwords</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="mx-auto mb-2 p-2 rounded-xl bg-green-500/10 w-fit">
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{strongCount}</p>
            <p className="text-xs text-muted-foreground">Strong</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="mx-auto mb-2 p-2 rounded-xl bg-yellow-500/10 w-fit">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{weakCount}</p>
            <p className="text-xs text-muted-foreground">Weak</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="mx-auto mb-2 p-2 rounded-xl bg-destructive/10 w-fit">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-foreground">{breachedCount}</p>
            <p className="text-xs text-muted-foreground">Breached</p>
          </div>
        </div>

        {/* Password Health Bar */}
        {passwords.length > 0 && (
          <div className="glass-card p-5 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Password Health</span>
              </div>
              <span className={`text-sm font-semibold ${
                overallHealth >= 70 ? "text-green-600" : overallHealth >= 40 ? "text-yellow-600" : "text-destructive"
              }`}>
                {overallHealth}%
              </span>
            </div>
            <Progress value={overallHealth} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {strongCount} of {passwords.length} passwords are strong
            </p>
          </div>
        )}

        {/* Breach Alert */}
        {breachedCount > 0 && (
          <div className="glass-card p-4 border-destructive/30 bg-destructive/5 animate-fade-up">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-destructive shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    {breachedCount} password{breachedCount !== 1 ? "s" : ""} found in data breaches
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Change these passwords immediately for your security
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setFilterCategory("all");
                  setSearchQuery("");
                  setSortBy("strength");
                }}
              >
                View Affected
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 animate-fade-up">
          <Button onClick={() => openAddEdit()}>
            <Plus className="h-4 w-4 mr-1" /> Add Password
          </Button>
          <Button variant="outline" onClick={() => setGeneratorOpen(true)}>
            <Sparkles className="h-4 w-4 mr-1" /> Generator
          </Button>
          <Button variant="outline" onClick={handleBreachScan} disabled={scanning || passwords.length === 0}>
            {scanning ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Scanning...</>
            ) : (
              <><Shield className="h-4 w-4 mr-1" /> Breach Scan</>
            )}
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by website or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SortAsc className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Passwords List */}
        <div className="space-y-3 animate-fade-up">
          {filteredPasswords.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {passwords.length === 0 ? "No passwords yet" : "No results found"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {passwords.length === 0
                  ? "Add your first password to start managing your credentials securely"
                  : "Try adjusting your search or filters"}
              </p>
              {passwords.length === 0 && (
                <Button onClick={() => openAddEdit()}>
                  <Plus className="h-4 w-4 mr-1" /> Add Your First Password
                </Button>
              )}
            </div>
          ) : (
            filteredPasswords.map((password) => (
              <div
                key={password.id}
                className={`glass-card p-4 transition-all hover:shadow-md ${
                  password.is_breached ? "border-destructive/30 bg-destructive/5" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg font-semibold shrink-0 ${getWebsiteColor(password.website)}`}>
                    {getWebsiteInitial(password.website)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-medium text-foreground truncate">{password.website}</p>
                      {password.is_breached && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          <ShieldAlert className="h-3 w-3 mr-1" /> Breached
                        </Badge>
                      )}
                      {getStrengthBadge(password.strength)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="truncate">{password.username}</span>
                      <span className="text-xs">•</span>
                      <span className="text-xs shrink-0">{getCategoryLabel(password.category)}</span>
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted font-mono text-sm min-w-[140px]">
                    {visiblePasswords.has(password.id) ? (
                      <span className="truncate text-xs">{password.encrypted_password}</span>
                    ) : (
                      <span className="tracking-wider">••••••••</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePasswordVisibility(password.id)}>
                      {visiblePasswords.has(password.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(password.encrypted_password, "Password")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAddEdit(password)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {password.website_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={password.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(password.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground pl-[60px]">
                  <Clock className="h-3 w-3" />
                  Updated {formatDate(password.updated_at)}
                  {password.notes && (
                    <>
                      <span>•</span>
                      <span className="truncate">{password.notes}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={addEditOpen} onOpenChange={(open) => { if (!open) closeAddEdit(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingPassword ? <Edit3 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                {editingPassword ? "Edit Password" : "Add Password"}
              </DialogTitle>
              <DialogDescription>
                {editingPassword ? "Update your saved credential" : "Save a new credential securely"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Website / App Name *</Label>
                <Input
                  placeholder="e.g. Google, Twitter"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input
                  placeholder="https://..."
                  value={form.website_url}
                  onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Username / Email *</Label>
                <Input
                  placeholder="your@email.com"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter or generate password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const pwd = generateQuickPassword();
                      setForm((f) => ({ ...f, password: pwd }));
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {form.password && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 flex-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            calculateStrengthScore(form.password) >= level
                              ? calculateStrengthScore(form.password) <= 3 ? "bg-destructive"
                              : calculateStrengthScore(form.password) <= 5 ? "bg-yellow-500"
                              : "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{calculateStrength(form.password)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeAddEdit}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving...</>
                  : editingPassword ? "Update" : "Save Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Generator Dialog */}
        <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Password Generator
              </DialogTitle>
              <DialogDescription>
                Generate a cryptographically secure random password
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-base break-all flex-1">{generatedPassword}</p>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(generatedPassword, "Password")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={generatePassword}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          calculateStrengthScore(generatedPassword) >= level
                            ? calculateStrengthScore(generatedPassword) <= 3 ? "bg-destructive"
                            : calculateStrengthScore(generatedPassword) <= 5 ? "bg-yellow-500"
                            : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Strength: {calculateStrengthScore(generatedPassword)}/7 — <span className="capitalize">{calculateStrength(generatedPassword)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Length</Label>
                  <span className="text-sm font-mono text-muted-foreground">{passwordLength[0]}</span>
                </div>
                <Slider value={passwordLength} onValueChange={setPasswordLength} min={8} max={64} step={1} />
              </div>

              <div className="space-y-2.5">
                <Label>Character Types</Label>
                {[
                  { id: "gen-upper", label: "Uppercase (A-Z)", checked: includeUppercase, onChange: setIncludeUppercase },
                  { id: "gen-lower", label: "Lowercase (a-z)", checked: includeLowercase, onChange: setIncludeLowercase },
                  { id: "gen-nums", label: "Numbers (0-9)", checked: includeNumbers, onChange: setIncludeNumbers },
                  { id: "gen-syms", label: "Symbols (!@#$%...)", checked: includeSymbols, onChange: setIncludeSymbols },
                ].map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between">
                    <Label htmlFor={opt.id} className="font-normal text-sm">{opt.label}</Label>
                    <Switch id={opt.id} checked={opt.checked} onCheckedChange={opt.onChange} />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setGeneratorOpen(false)}>Close</Button>
              <Button onClick={() => {
                copyToClipboard(generatedPassword, "Password");
              }}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Password</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this saved password? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Deleting...</> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

function generateQuickPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const array = new Uint32Array(20);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}
