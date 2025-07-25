import { useState } from "react";
import { User, Phone, Bell, Shield, CreditCard, Mic, Globe, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIOrb } from "@/components/AIOrb";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    company: "Johnson Communications"
  });

  const [notifications, setNotifications] = useState({
    missedCalls: true,
    voicemails: true,
    appointments: true,
    emailReports: false
  });

  const voices = [
    { id: "aria", name: "Aria", description: "Professional and warm" },
    { id: "roger", name: "Roger", description: "Confident and clear" },
    { id: "sarah", name: "Sarah", description: "Friendly and approachable" },
    { id: "charlie", name: "Charlie", description: "Energetic and upbeat" }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button>Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Settings */}
        <TabsContent value="voice" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">AI Voice Selection</Label>
                <p className="text-sm text-muted-foreground mb-4">Choose the voice for your AI assistant</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voices.map((voice) => (
                    <div key={voice.id} className="p-4 border rounded-lg hover:bg-muted/30 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{voice.name}</h4>
                        <Button size="sm" variant="outline">Preview</Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{voice.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en-US">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="speed">Speaking Speed</Label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  defaultValue="1" 
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>
              
              <Button>Save Voice Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Missed Call Alerts</h4>
                  <p className="text-sm text-muted-foreground">Get notified when you miss a call</p>
                </div>
                <Switch
                  checked={notifications.missedCalls}
                  onCheckedChange={(checked) => setNotifications({...notifications, missedCalls: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Voicemail Notifications</h4>
                  <p className="text-sm text-muted-foreground">Alert when new voicemails arrive</p>
                </div>
                <Switch
                  checked={notifications.voicemails}
                  onCheckedChange={(checked) => setNotifications({...notifications, voicemails: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Appointment Reminders</h4>
                  <p className="text-sm text-muted-foreground">Reminders for upcoming appointments</p>
                </div>
                <Switch
                  checked={notifications.appointments}
                  onCheckedChange={(checked) => setNotifications({...notifications, appointments: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Email Reports</h4>
                  <p className="text-sm text-muted-foreground">Summary of weekly activity</p>
                </div>
                <Switch
                  checked={notifications.emailReports}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailReports: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Business Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Select defaultValue="9:00">
                    <SelectTrigger>
                      <SelectValue placeholder="Open" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:00">8:00 AM</SelectItem>
                      <SelectItem value="9:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="17:00">
                    <SelectTrigger>
                      <SelectValue placeholder="Close" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="america/new_york">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/new_york">Eastern Time</SelectItem>
                    <SelectItem value="america/chicago">Central Time</SelectItem>
                    <SelectItem value="america/denver">Mountain Time</SelectItem>
                    <SelectItem value="america/los_angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button>Save Business Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Plan & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold">Current Plan: Professional</h3>
                <p className="text-sm text-muted-foreground">$99/month • Next billing: March 15, 2024</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Usage This Month</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>API Calls</span>
                    <span>2,847 / 10,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage</span>
                    <span>4.2 GB / 50 GB</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline">Download Invoice</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Orb */}
      <AIOrb size="small" position="bottom-right" />
    </div>
  );
}