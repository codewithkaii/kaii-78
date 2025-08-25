import { useState, useEffect } from "react";
import { User, Phone, Bell, Shield, CreditCard, Mic, Globe, Palette, Play, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIOrb } from "@/components/AIOrb";
import BusinessHours from "@/components/BusinessHours";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
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

  const [selectedVoice, setSelectedVoice] = useState("9BWtsMINqrJLrRacOk9x");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    elevenlabs: "",
    twilio: "",
    perplexity: ""
  });
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    elevenlabs: false,
    twilio: false,
    perplexity: false
  });
  const [savingApiKeys, setSavingApiKeys] = useState(false);
  const { toast } = useToast();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [user]);

  const voices = [
    // Male voices
    { id: "Fahco4VZzobUeiPqni1S", name: "Marcus", description: "Professional male voice", gender: "male", languages: ["en-US", "en-GB"] },
    { id: "UgBBYS2sOqTuMpoF3BR0", name: "James", description: "Confident and clear male voice", gender: "male", languages: ["en-US", "en-GB"] },
    // Female voices  
    { id: "P7vsEyTOpZ6YUTulin8m", name: "Sophie", description: "Professional female voice", gender: "female", languages: ["en-US", "en-GB"] },
    { id: "aMSt68OGf4xUZAnLpTU8", name: "Emma", description: "Friendly and approachable female voice", gender: "female", languages: ["en-US", "en-GB"] },
    // Additional popular voices
    { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Professional and warm", gender: "female", languages: ["en-US", "en-GB", "es-ES", "fr-FR"] },
    { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "Confident and clear", gender: "male", languages: ["en-US", "en-GB"] },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Friendly and approachable", gender: "female", languages: ["en-US", "en-GB"] },
    { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Energetic and upbeat", gender: "male", languages: ["en-US", "en-GB"] }
  ];

  const languages = [
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" },
    { code: "de-DE", name: "German", flag: "🇩🇪" },
    { code: "it-IT", name: "Italian", flag: "🇮🇹" },
    { code: "pt-PT", name: "Portuguese", flag: "🇵🇹" },
    { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
    { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
    { code: "zh-CN", name: "Chinese", flag: "🇨🇳" }
  ];

  // Get compatible voices for selected language
  const getCompatibleVoices = (languageCode: string) => {
    return voices.filter(voice => 
      voice.languages.includes(languageCode) || 
      voice.languages.includes("en-US") // Fallback to English
    );
  };

  // Auto-select appropriate voice based on language and gender preference
  const selectVoiceForLanguage = (languageCode: string, genderPreference?: "male" | "female") => {
    const compatibleVoices = getCompatibleVoices(languageCode);
    
    if (genderPreference) {
      const genderVoices = compatibleVoices.filter(v => v.gender === genderPreference);
      if (genderVoices.length > 0) {
        return genderVoices[0].id;
      }
    }
    
    // Fallback to first compatible voice or default English voice
    return compatibleVoices.length > 0 ? compatibleVoices[0].id : "9BWtsMINqrJLrRacOk9x";
  };

  const playVoicePreview = async (voiceId: string, voiceName: string) => {
    setPlayingVoice(voiceId);
    
    try {
      const sampleText = `Hello! I'm ${voiceName}. This is how I sound when speaking in your selected language.`;
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: sampleText,
          voice_id: voiceId,
          model_id: 'eleven_multilingual_v2'
        }
      });

      if (error) {
        console.error('TTS API error:', error);
        throw new Error(error.message || 'Text-to-speech service unavailable');
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received from service');
      }

      // Play the audio
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      
      audio.oncanplaythrough = () => {
        audio.play().catch((playError) => {
          console.error('Audio play error:', playError);
          setPlayingVoice(null);
          toast({
            title: "Playback Error",
            description: "Unable to play audio. Please check your browser settings.",
            variant: "destructive"
          });
        });
      };
      
      audio.onended = () => setPlayingVoice(null);
      
      audio.onerror = (audioError) => {
        console.error('Audio error:', audioError);
        setPlayingVoice(null);
        toast({
          title: "Audio Error",
          description: "Failed to load audio preview",
          variant: "destructive"
        });
      };
      
    } catch (error: any) {
      console.error('Voice preview error:', error);
      setPlayingVoice(null);
      
      // More specific error messages
      let errorMessage = "Voice preview is temporarily unavailable";
      if (error.message?.includes('voice_limit_reached')) {
        errorMessage = "Voice service limit reached. Preview unavailable.";
      } else if (error.message?.includes('unauthorized')) {
        errorMessage = "Voice service authentication error";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Preview Unavailable", 
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const saveApiKeys = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can manage API keys",
        variant: "destructive"
      });
      return;
    }

    setSavingApiKeys(true);
    
    try {
      // Save each API key as a secret
      const apiKeyEntries = Object.entries(apiKeys).filter(([_, value]) => value.trim());
      
      for (const [service, key] of apiKeyEntries) {
        const secretName = service.toUpperCase() + '_API_KEY';
        
        // Call the update secret function
        const { error } = await supabase.functions.invoke('update-secret', {
          body: { 
            secret_name: secretName,
            secret_value: key
          }
        });
        
        if (error) {
          throw new Error(`Failed to save ${service} API key: ${error.message}`);
        }
      }
      
      toast({
        title: "API Keys Saved",
        description: "All API keys have been securely stored and are now active",
        variant: "default"
      });
      
      // Clear the form
      setApiKeys({
        openai: "",
        elevenlabs: "",
        twilio: "",
        perplexity: ""
      });
      
    } catch (error: any) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Error Saving API Keys",
        description: error.message || "Failed to save API keys",
        variant: "destructive"
      });
    } finally {
      setSavingApiKeys(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-6'}`}>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {isAdmin && <TabsTrigger value="api-keys">API Keys</TabsTrigger>}
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
                <Label htmlFor="language" className="text-base font-medium">Language</Label>
                <p className="text-sm text-muted-foreground mb-4">Select your preferred language for voice interactions</p>
                <Select 
                  value={selectedLanguage} 
                  onValueChange={(value) => {
                    setSelectedLanguage(value);
                    // Auto-select compatible voice when language changes
                    const newVoice = selectVoiceForLanguage(value);
                    setSelectedVoice(newVoice);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">AI Voice Selection</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the voice for your AI assistant. Only voices compatible with your selected language are shown.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {getCompatibleVoices(selectedLanguage).map((voice) => (
                    <div 
                      key={voice.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedVoice === voice.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{voice.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            voice.gender === 'male' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                          }`}>
                            {voice.gender}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            playVoicePreview(voice.id, voice.name);
                          }}
                          disabled={playingVoice === voice.id}
                        >
                          {playingVoice === voice.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Playing
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              Preview
                            </div>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{voice.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-muted-foreground">Supports:</span>
                        {voice.languages.map((lang, idx) => (
                          <span key={lang} className="text-xs">
                            {languages.find(l => l.code === lang)?.flag || '🌐'}
                            {idx < voice.languages.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
          <BusinessHours />
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="america/new_york">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/new_york">🇺🇸 Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="america/chicago">🇺🇸 Central Time (UTC-6)</SelectItem>
                    <SelectItem value="america/denver">🇺🇸 Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="america/los_angeles">🇺🇸 Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="europe/london">🇬🇧 Greenwich Mean Time (UTC+0)</SelectItem>
                    <SelectItem value="europe/paris">🇫🇷 Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="asia/tokyo">🇯🇵 Japan Standard Time (UTC+9)</SelectItem>
                    <SelectItem value="australia/sydney">🇦🇺 Australian Eastern Time (UTC+10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select defaultValue="mm/dd/yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (US)</SelectItem>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (UK/EU)</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (ISO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button>Save Regional Settings</Button>
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

        {/* API Keys - Admin Only */}
        {isAdmin && (
          <TabsContent value="api-keys" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Key Management
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure API keys for third-party services. All keys are securely encrypted and stored.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OpenAI API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="openai-key" className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      OpenAI API Key
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Required for AI-powered lead processing, property analysis, and automated responses
                    </p>
                    <div className="relative">
                      <Input
                        id="openai-key"
                        type={showApiKeys.openai ? "text" : "password"}
                        placeholder="sk-..."
                        value={apiKeys.openai}
                        onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKeys({...showApiKeys, openai: !showApiKeys.openai})}
                      >
                        {showApiKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* ElevenLabs API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="elevenlabs-key" className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      ElevenLabs API Key
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Required for AI voice synthesis and text-to-speech functionality
                    </p>
                    <div className="relative">
                      <Input
                        id="elevenlabs-key"
                        type={showApiKeys.elevenlabs ? "text" : "password"}
                        placeholder="xi_..."
                        value={apiKeys.elevenlabs}
                        onChange={(e) => setApiKeys({...apiKeys, elevenlabs: e.target.value})}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKeys({...showApiKeys, elevenlabs: !showApiKeys.elevenlabs})}
                      >
                        {showApiKeys.elevenlabs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Twilio API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="twilio-key" className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      Twilio API Key
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Required for phone number management, SMS, and call handling
                    </p>
                    <div className="relative">
                      <Input
                        id="twilio-key"
                        type={showApiKeys.twilio ? "text" : "password"}
                        placeholder="AC..."
                        value={apiKeys.twilio}
                        onChange={(e) => setApiKeys({...apiKeys, twilio: e.target.value})}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKeys({...showApiKeys, twilio: !showApiKeys.twilio})}
                      >
                        {showApiKeys.twilio ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Perplexity API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="perplexity-key" className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      Perplexity API Key
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Required for real-time web search and market data analysis
                    </p>
                    <div className="relative">
                      <Input
                        id="perplexity-key"
                        type={showApiKeys.perplexity ? "text" : "password"}
                        placeholder="pplx-..."
                        value={apiKeys.perplexity}
                        onChange={(e) => setApiKeys({...apiKeys, perplexity: e.target.value})}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKeys({...showApiKeys, perplexity: !showApiKeys.perplexity})}
                      >
                        {showApiKeys.perplexity ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Save API Keys</h4>
                      <p className="text-sm text-muted-foreground">
                        Only enter keys that need to be updated. Empty fields will be ignored.
                      </p>
                    </div>
                    <Button 
                      onClick={saveApiKeys} 
                      disabled={savingApiKeys || !Object.values(apiKeys).some(key => key.trim())}
                      className="min-w-32"
                    >
                      {savingApiKeys ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        "Save Keys"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/20 rounded-lg p-4 border border-muted">
                  <h4 className="font-medium text-sm mb-2">🔒 Security Information</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• All API keys are encrypted using industry-standard encryption</li>
                    <li>• Keys are stored securely in Supabase Edge Function secrets</li>
                    <li>• Only administrators can view and modify API keys</li>
                    <li>• Keys are never logged or displayed in plain text after saving</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* AI Orb */}
      <AIOrb size="small" position="bottom-right" />
    </div>
  );
}