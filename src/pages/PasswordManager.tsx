import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { toast } from "sonner";

interface SavedPassword {
  id: string;
  website: string;
  username: string;
  password: string;
  favicon: string;
  lastUpdated: string;
  strength: "weak" | "medium" | "strong";
  breached: boolean;
}

export default function PasswordManager() {
  const [passwords, setPasswords] = useState<SavedPassword[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<SavedPassword | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Password Generator State
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const filteredPasswords = passwords.filter(
    (p) =>
      p.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breachedCount = passwords.filter((p) => p.breached).length;
  const weakCount = passwords.filter((p) => p.strength === "weak").length;
  const strongCount = passwords.filter((p) => p.strength === "strong").length;

  const generatePassword = () => {
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

    let password = "";
    for (let i = 0; i < passwordLength[0]; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
  };

  useEffect(() => {
    if (generatorOpen) {
      generatePassword();
    }
  }, [generatorOpen, passwordLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const getStrengthBadge = (strength: "weak" | "medium" | "strong") => {
    switch (strength) {
      case "weak":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Weak
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        );
      case "strong":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Strong
          </Badge>
        );
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return Math.min(score, 5);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDelete = async () => {
    if (!selectedPassword) return;
    setDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPasswords((prev) => prev.filter((p) => p.id !== selectedPassword.id));
    setDeleting(false);
    setDeleteDialogOpen(false);
    setSelectedPassword(null);
    toast.success("Password deleted");
  };

  const handleBreachScan = async () => {
    setScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setScanning(false);
    toast.success("Breach scan completed", {
      description: `Found ${breachedCount} compromised password${breachedCount !== 1 ? "s" : ""}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Password Manager</h1>
          <p className="text-muted-foreground">
            Securely store and manage all your passwords in one place.
          </p>
        </div>

        {/* Security Overview */}
        <div className="grid md:grid-cols-4 gap-4 animate-fade-up delay-100">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{passwords.length}</p>
                <p className="text-sm text-muted-foreground">Total Passwords</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{strongCount}</p>
                <p className="text-sm text-muted-foreground">Strong Passwords</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{weakCount}</p>
                <p className="text-sm text-muted-foreground">Weak Passwords</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{breachedCount}</p>
                <p className="text-sm text-muted-foreground">Breached</p>
              </div>
            </div>
          </div>
        </div>

        {/* Breach Alert */}
        {breachedCount > 0 && (
          <div className="glass-card p-4 border-red-500/20 bg-red-500/5 animate-fade-up delay-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-red-500" />
                <div>
                  <p className="font-semibold text-foreground">
                    {breachedCount} password{breachedCount !== 1 ? "s" : ""} found in data breaches
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We recommend changing these passwords immediately
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="sm">
                View Affected
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 animate-fade-up delay-200">
          <Button onClick={() => setGeneratorOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Password Generator
          </Button>
          <Button variant="outline" onClick={handleBreachScan} disabled={scanning}>
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Breach Scan
              </>
            )}
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Add Password
          </Button>
        </div>

        {/* Search */}
        <div className="relative animate-fade-up delay-300">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Passwords List */}
        <div className="space-y-3 animate-fade-up delay-400">
          {filteredPasswords.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No passwords found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Add your first password to get started"}
              </p>
            </div>
          ) : (
            filteredPasswords.map((password) => (
              <div
                key={password.id}
                className={`glass-card p-4 ${
                  password.breached ? "border-red-500/30 bg-red-500/5" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                      {password.favicon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">{password.website}</p>
                        {password.breached && (
                          <Badge variant="destructive" className="shrink-0">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Breached
                          </Badge>
                        )}
                        {getStrengthBadge(password.strength)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{password.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted font-mono text-sm">
                      {visiblePasswords.has(password.id) ? (
                        <span>{password.password}</span>
                      ) : (
                        <span>••••••••••••</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePasswordVisibility(password.id)}
                    >
                      {visiblePasswords.has(password.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(password.password, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedPassword(password);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last updated: {formatDate(password.lastUpdated)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Password Generator Dialog */}
        <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Password Generator
              </DialogTitle>
              <DialogDescription>
                Generate a secure, random password with your preferred settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Generated Password Display */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-lg break-all">{generatedPassword}</p>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(generatedPassword, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={generatePassword}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress
                    value={calculatePasswordStrength(generatedPassword) * 20}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Strength: {calculatePasswordStrength(generatedPassword)}/5
                  </p>
                </div>
              </div>

              {/* Length Slider */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Length</Label>
                  <span className="text-sm text-muted-foreground">{passwordLength[0]} characters</span>
                </div>
                <Slider
                  value={passwordLength}
                  onValueChange={setPasswordLength}
                  min={8}
                  max={32}
                  step={1}
                />
              </div>

              {/* Character Options */}
              <div className="space-y-3">
                <Label>Character Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="uppercase" className="font-normal">
                      Uppercase (A-Z)
                    </Label>
                    <Switch
                      id="uppercase"
                      checked={includeUppercase}
                      onCheckedChange={setIncludeUppercase}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowercase" className="font-normal">
                      Lowercase (a-z)
                    </Label>
                    <Switch
                      id="lowercase"
                      checked={includeLowercase}
                      onCheckedChange={setIncludeLowercase}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="numbers" className="font-normal">
                      Numbers (0-9)
                    </Label>
                    <Switch
                      id="numbers"
                      checked={includeNumbers}
                      onCheckedChange={setIncludeNumbers}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="symbols" className="font-normal">
                      Symbols (!@#$%...)
                    </Label>
                    <Switch
                      id="symbols"
                      checked={includeSymbols}
                      onCheckedChange={setIncludeSymbols}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setGeneratorOpen(false)}>
                Close
              </Button>
              <Button onClick={() => copyToClipboard(generatedPassword, "Password")}>
                <Copy className="h-4 w-4" />
                Copy Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Password</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the password for{" "}
                <span className="font-semibold text-foreground">{selectedPassword?.website}</span>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
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
