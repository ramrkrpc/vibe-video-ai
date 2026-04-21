import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Key, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");

  const handleSave = () => {
    toast.success("Settings saved!");
  };

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
          <Button onClick={handleSave} className="gradient-primary">Save Changes</Button>
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
            <Input type="password" placeholder="Enter your HeyGen API key" />
          </div>
          <Button variant="outline" onClick={() => toast.success("API key saved!")}>
            Save API Key
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-primary" /> Plan & Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="gradient-primary border-0">Pro Plan</Badge>
            <span className="text-sm text-muted-foreground">$24/month</span>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">API Credits Used</span>
              <span className="text-foreground">75 / 100</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Videos This Month</span>
              <span className="text-foreground">12 / 50</span>
            </div>
            <Progress value={24} className="h-2" />
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
        <CardContent>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
