import { useState, useEffect } from "react";
import { 
  Phone, 
  Calendar as CalendarIcon, 
  Users, 
  TrendingUp, 
  PhoneCall, 
  Voicemail,
  Clock,
  CheckCircle,
  Building2,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIOrb } from "@/components/AIOrb";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStats, setUserStats] = useState({
    clients: 0,
    events: 0,
    documents: 0,
    hasCompany: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch user's actual data
      const [documentsRes, companyRes] = await Promise.all([
        supabase.from('documents').select('id').eq('user_id', user.id),
        supabase.from('companies').select('id').eq('user_id', user.id).single()
      ]);

      setUserStats({
        clients: 0, // Will be added when database types are updated
        events: 0, // Will be added later
        documents: documentsRes.data?.length || 0,
        hasCompany: !!companyRes.data
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    {
      title: "LEADS",
      value: userStats.clients.toString(),
      description: userStats.clients > 0 ? "Active leads" : "No leads yet",
      icon: Users,
      color: "text-primary",
      action: () => navigate('/leads')
    },
    {
      title: "DOCUMENTS",
      value: userStats.documents.toString(),
      description: userStats.documents > 0 ? "Uploaded documents" : "No documents yet",
      icon: FileText,
      color: "text-primary",
      action: () => navigate('/company')
    },
    {
      title: "EVENTS",
      value: userStats.events.toString(),
      description: userStats.events > 0 ? "Scheduled events" : "No events yet",
      icon: CalendarIcon,
      color: "text-primary",
      action: () => navigate('/calendar')
    },
    {
      title: "BUSINESS",
      value: userStats.hasCompany ? "✓" : "Setup",
      description: userStats.hasCompany ? "Profile complete" : "Setup required",
      icon: Building2,
      color: "text-primary",
      action: () => navigate('/company')
    }
  ];

  const quickActions = [
    {
      title: "Setup Business Profile",
      description: "Add your business information and upload documents for AI assistant",
      icon: Building2,
      action: () => navigate('/company'),
      primary: !userStats.hasCompany
    },
    {
      title: "Add Leads",
      description: "Start building your leads database",
      icon: Users,
      action: () => navigate('/leads'),
      primary: userStats.clients === 0
    },
    {
      title: "Connect Calendar",
      description: "Sync your Google Calendar for seamless scheduling",
      icon: CalendarIcon,
      action: () => navigate('/calendar'),
      primary: userStats.events === 0
    }
  ];

  const getUserDisplayName = () => {
    return user?.email?.split('@')[0] || 'User';
  };

  const isNewUser = userStats.clients === 0 && userStats.events === 0 && !userStats.hasCompany;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {getGreeting()}, {getUserDisplayName()}
          </h1>
          <p className="text-muted-foreground">
            {isNewUser ? 
              "Welcome to LuniVoice! Let's get you started with setting up your business profile." :
              "Here's your business overview and performance analytics."
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="glass-card border-0 hover:bg-card/90 transition-all duration-300 cursor-pointer"
              onClick={stat.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-muted-foreground" />
                  <Button variant="ghost" size="sm">View</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions / Setup */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isNewUser ? "Get Started" : "Quick Actions"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isNewUser ? 
                    "Set up your business profile to get the most out of LuniVoice" :
                    "Common tasks and shortcuts"
                  }
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {quickActions.map((action, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        action.primary ? 
                        'border-primary bg-primary/5 hover:bg-primary/10' : 
                        'border-muted hover:border-primary/20 hover:bg-muted/50'
                      }`}
                      onClick={action.action}
                    >
                      <div className="flex items-start gap-3">
                        <action.icon className={`w-5 h-5 mt-1 ${action.primary ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <Button variant={action.primary ? "default" : "outline"} size="sm">
                          {action.primary ? "Setup" : "Go"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Welcome Message / Recent Activity */}
          <div>
            <Card className="glass-card border-0 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isNewUser ? "Welcome to LuniVoice" : "System Status"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isNewUser ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Ready to transform your business?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        LuniVoice helps you manage clients, automate tasks, and grow your business with AI assistance.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>AI-powered voice assistant</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Client relationship management</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Google Calendar integration</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">All Systems Online</div>
                      <p className="text-sm text-muted-foreground">Your LuniVoice is ready</p>
                    </div>
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between text-sm">
                        <span>AI Assistant</span>
                        <span className="text-green-500">Active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Backend Sync</span>
                        <span className="text-green-500">Connected</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Storage</span>
                        <span className="text-green-500">Ready</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Futuristic AI Orb */}
        <AIOrb size="large" position="center" />
      </div>
    </div>
  );
}