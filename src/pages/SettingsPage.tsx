import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Key, Shield, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const SettingsPage = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [heygenKey, setHeygenKey] = useState("");
  const [fishAudioKey, setFishAudioKey] = useState("");
  const [didKey, setDidKey] = useState("");
  const [syncLabsKey, setSyncLabsKey] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setHeygenKey(profile.heygen_api_key || "");
      setFishAudioKey(profile.fish_audio_api_key || "");
      setDidKey(profile.did_api_key || "");
      setSyncLabsKey(profile.sync_labs_api_key || "");
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

  const handleSaveKey = async (field: string, value: string, label: string) => {
    try {
      await updateProfile.mutateAsync({ [field]: value } as any);
      toast.success(`${label} key saved!`);
    } catch (err: any) {
      toast.error(err.message || `Failed to save ${label} key`);
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

  const toggleShow = (key: string) => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));

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

  const ApiKeyField = ({
    label,
    description,
    link,
    linkLabel,
    value,
    onChange,
    fieldKey,
    fieldId,
    connected,
  }: {
    label: string;
    description: string;
    link: string;
    linkLabel: string;
    value: string;
    onChange: (v: string) => void;
    fieldKey: string;
    fieldId: string;
    connected: boolean;
  }) => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {description}{" "}
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {linkLabel}
        </a>
      </p>
      <div className="space-y-2">
        <Label>API Key</Label>
        <div className="relative">
          <Input
            type={showKeys[fieldKey] ? "text" : "password"}
            placeholder={`Enter your ${label} API key`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => toggleShow(fieldKey)}
          >
            {showKeys[fieldKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => handleSaveKey(fieldId, value, label)}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save API Key
        </Button>
        {connected && (
          <Badge className="bg-success/10 text-success border-0">
            <Check className="w-3 h-3 mr-1" /> Connected
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and API integrations</p>
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

      {/* API Keys - Tabbed */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="w-4 h-4 text-primary" /> API Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="heygen" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="heygen" className="text-xs">
                HeyGen
                {profile?.heygen_api_key && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-success inline-block" />}
              </TabsTrigger>
              <TabsTrigger value="fish" className="text-xs">
                Fish Audio
                {profile?.fish_audio_api_key && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-success inline-block" />}
              </TabsTrigger>
              <TabsTrigger value="did" className="text-xs">
                D-ID
                {profile?.did_api_key && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-success inline-block" />}
              </TabsTrigger>
              <TabsTrigger value="sync" className="text-xs">
                Sync Labs
                {profile?.sync_labs_api_key && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-success inline-block" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="heygen" className="mt-4">
              <ApiKeyField
                label="HeyGen"
                description="Avatar video generation. Get your key from"
                link="https://app.heygen.com/settings"
                linkLabel="app.heygen.com/settings"
                value={heygenKey}
                onChange={setHeygenKey}
                fieldKey="heygen"
                fieldId="heygen_api_key"
                connected={!!profile?.heygen_api_key}
              />
            </TabsContent>

            <TabsContent value="fish" className="mt-4">
              <ApiKeyField
                label="Fish Audio"
                description="Affordable TTS ($0.015/1K chars). Get your key from"
                link="https://fish.audio/account"
                linkLabel="fish.audio/account"
                value={fishAudioKey}
                onChange={setFishAudioKey}
                fieldKey="fish"
                fieldId="fish_audio_api_key"
                connected={!!profile?.fish_audio_api_key}
              />
            </TabsContent>

            <TabsContent value="did" className="mt-4">
              <ApiKeyField
                label="D-ID"
                description="Photo-to-video avatars. Get your key from"
                link="https://studio.d-id.com/account-settings"
                linkLabel="studio.d-id.com/account-settings"
                value={didKey}
                onChange={setDidKey}
                fieldKey="did"
                fieldId="did_api_key"
                connected={!!profile?.did_api_key}
              />
            </TabsContent>

            <TabsContent value="sync" className="mt-4">
              <ApiKeyField
                label="Sync Labs"
                description="Lip-sync & dubbing ($0.035/sec, free tier). Get your key from"
                link="https://app.synclabs.so/settings"
                linkLabel="app.synclabs.so/settings"
                value={syncLabsKey}
                onChange={setSyncLabsKey}
                fieldKey="sync"
                fieldId="sync_labs_api_key"
                connected={!!profile?.sync_labs_api_key}
              />
            </TabsContent>
          </Tabs>
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
