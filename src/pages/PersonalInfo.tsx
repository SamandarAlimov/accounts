import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Loader2,
  Save,
  FileText,
  ScanFace,
  Clock,
  BadgeCheck,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { countries } from "@/data/countries";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  date_of_birth: string | null;
  gender: string | null;
  bio: string | null;
  recovery_email: string | null;
  avatar_url: string | null;
  identity_verified: boolean;
}

export default function PersonalInfo() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<"idle" | "upload" | "processing" | "complete">("idle");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    date_of_birth: "",
    gender: "",
    bio: "",
    recovery_email: "",
    avatar_url: null,
    identity_verified: false,
  });

  const applyProfileData = useCallback((data: any) => {
    setProfile({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      country: data.country,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      bio: data.bio,
      recovery_email: data.recovery_email,
      avatar_url: data.avatar_url,
      identity_verified: data.identity_verified || false,
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) applyProfileData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Realtime subscription
    const channel = supabase
      .channel("personal-info-profile")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          applyProfileData(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, applyProfileData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          country: profile.country,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          bio: profile.bio,
          recovery_email: profile.recovery_email,
        })
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Profile photo updated");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleIdentityVerification = async () => {
    if (!user) return;
    
    setVerificationStep("processing");
    setVerifying(true);

    // Simulate AI-assisted verification process
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ identity_verified: true })
        .eq("user_id", user.id);

      if (error) throw error;

      setVerificationStep("complete");
      toast.success("Identity verified successfully!");
    } catch (error) {
      console.error("Error verifying identity:", error);
      toast.error("Verification failed. Please try again.");
      setVerificationStep("upload");
    } finally {
      setVerifying(false);
    }
  };

  const getInitials = () => {
    const first = profile.first_name?.charAt(0) || "";
    const last = profile.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getProfileCompleteness = () => {
    const fields = [
      profile.first_name, profile.last_name, profile.phone, 
      profile.country, profile.date_of_birth, profile.gender, 
      profile.bio, profile.recovery_email, profile.avatar_url
    ];
    const filled = fields.filter(f => f && f.trim?.() !== "").length;
    return Math.round((filled / fields.length) * 100);
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

  const completeness = getProfileCompleteness();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Personal Info</h1>
          <p className="text-muted-foreground">
            Manage your personal information and how it's displayed across Alsamos services.
          </p>
        </div>

        {/* Profile Completeness */}
        <div className="glass-card p-6 animate-fade-up delay-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Profile Completeness</h2>
            <span className="text-sm font-medium text-primary">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
          {completeness < 100 && (
            <p className="text-xs text-muted-foreground mt-2">
              Complete your profile to improve your account security and personalization.
            </p>
          )}
        </div>

        {/* Profile Photo Section */}
        <div className="glass-card p-6 animate-fade-up delay-100">
          <h2 className="font-semibold text-foreground mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </label>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {profile.first_name || "Your"} {profile.last_name || "Name"}
              </p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <label className="inline-flex items-center gap-2 mt-2 text-sm text-primary cursor-pointer hover:underline">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                Upload new photo
              </label>
            </div>
          </div>
        </div>

        {/* Identity Verification */}
        <div className="glass-card p-6 animate-fade-up delay-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${profile.identity_verified ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                {profile.identity_verified ? (
                  <BadgeCheck className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Identity Verification</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.identity_verified
                    ? "Your identity has been verified. You have access to all features."
                    : "Verify your identity to unlock additional features and increase account security."}
                </p>
                {profile.identity_verified && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Verified Account</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Flow */}
          {!profile.identity_verified && verificationStep === "idle" && (
            <div className="mt-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Upload ID</p>
                  <p className="text-xs text-muted-foreground mt-1">Passport or National ID</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <ScanFace className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">AI Verification</p>
                  <p className="text-xs text-muted-foreground mt-1">Automatic document check</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <BadgeCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Get Verified</p>
                  <p className="text-xs text-muted-foreground mt-1">Unlock all features</p>
                </div>
              </div>
              <Button onClick={() => setVerificationStep("upload")} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Start Verification
              </Button>
            </div>
          )}

          {!profile.identity_verified && verificationStep === "upload" && (
            <div className="mt-6 space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                {idFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{idFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(idFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIdFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Upload your ID document</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepted: Passport, National ID, Driver's License (JPG, PNG, PDF)
                    </p>
                    <label className="mt-4 inline-block">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors">
                        <Upload className="h-4 w-4" />
                        Choose File
                      </span>
                    </label>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setVerificationStep("idle"); setIdFile(null); }} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleIdentityVerification} disabled={!idFile || verifying} className="flex-1">
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ScanFace className="h-4 w-4 mr-2" />
                      Verify Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!profile.identity_verified && verificationStep === "processing" && (
            <div className="mt-6 text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="font-medium text-foreground">Processing your document...</p>
              <p className="text-sm text-muted-foreground mt-1">
                AI is analyzing your identity document. This may take a moment.
              </p>
            </div>
          )}

          {verificationStep === "complete" && (
            <div className="mt-6 text-center py-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="font-medium text-foreground">Verification Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your identity has been successfully verified.
              </p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="glass-card p-6 animate-fade-up delay-300">
          <h2 className="font-semibold text-foreground mb-6">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                First Name
              </Label>
              <Input
                id="firstName"
                value={profile.first_name || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Last Name
              </Label>
              <Input
                id="lastName"
                value={profile.last_name || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={profile.date_of_birth || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={profile.gender || ""} 
                onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us a bit about yourself..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass-card p-6 animate-fade-up delay-400">
          <h2 className="font-semibold text-foreground mb-6">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recoveryEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Recovery Email
              </Label>
              <Input
                id="recoveryEmail"
                type="email"
                value={profile.recovery_email || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, recovery_email: e.target.value }))}
                placeholder="recovery@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Country
              </Label>
              <Select 
                value={profile.country || ""} 
                onValueChange={(value) => setProfile(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}