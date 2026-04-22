import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Key, CreditCard, Shield, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const SettingsPage = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setApiKey(profile.heygen_api_key || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ full_name: fullName });
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await updateProfile.mutateAsync({ heygen_api_key: apiKey });
      toast.success("API key saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save API key");
    }
  };

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        user?.email || "",
        { redirectTo: `${window.location.origin}/auth` }
      );
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-6">
            <Skeleton className="h-5 w-24 mb-4" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
          </div>
          <Button
            onClick={handleSaveProfile}
            className="gradient-primary"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Check className="w-4 h-4 mr-2" /> Save Changes</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="w-4 h-4 text-primary" /> HeyGen API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your HeyGen API key to enable video generation. Get your key from{" "}
            <a href="https://app.heygen.com/settings" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              app.heygen.com/settings
            </a>
          </p>
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your HeyGen API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSaveApiKey}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save API Key
            </Button>
            {profile?.heygen_api_key && (
              <Badge className="bg-success/10 text-success border-0">
                <Check className="w-3 h-3 mr-1" /> Connected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-primary" /> Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Request a password reset link to change your password.
          </p>
          <Button variant="outline" onClick={handleResetPassword}>
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
