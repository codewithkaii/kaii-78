import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, Calendar, Users, BarChart3, Settings } from "lucide-react";

const Index = () => {
  const { user, subscribed, subscriptionTier, signOut } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Phone,
      title: "24/7 Call Answering",
      description: "Never miss a call with our AI-powered phone assistant"
    },
    {
      icon: MessageSquare,
      title: "AI Transcripts & Recordings", 
      description: "Get detailed transcripts and recordings of all calls"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent calendar integration and appointment booking"
    },
    {
      icon: Users,
      title: "CRM Integration",
      description: "Seamlessly manage your customer relationships"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Get weekly AI-powered insights and analytics"
    },
    {
      icon: Settings,
      title: "Automation Rules",
      description: "Set up custom triggers and automation workflows"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome to LuniVoice</h1>
            <p className="text-xl text-muted-foreground">
              {user ? `Welcome back, ${user.email}` : "Your AI-Powered Business Phone Assistant"}
              {subscribed && (
                <span className="ml-2 text-success">• {subscriptionTier} Plan Active</span>
              )}
            </p>
          </div>
          <div className="space-x-2">
            {user ? (
              <>
                <Button onClick={() => navigate('/pricing')} variant="outline">
                  {subscribed ? 'Manage Plan' : 'Subscribe'}
                </Button>
                <Button onClick={signOut} variant="secondary">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/auth')} variant="outline">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/pricing')}>
                  View Pricing
                </Button>
              </>
            )}
          </div>
        </header>

        {user && subscribed ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/calls')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Recent Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Calls today</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/messages')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Unread messages</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/calendar')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!user && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Business Communications?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join thousands of businesses using LuniVoice to never miss another call
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate('/auth')} size="lg">
                Get Started Today
              </Button>
              <Button onClick={() => navigate('/pricing')} variant="outline" size="lg">
                View Pricing Plans
              </Button>
            </div>
          </div>
        )}
        
        {user && !subscribed && (
          <div className="text-center bg-card p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Unlock the Full Power of LuniVoice</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Subscribe to access all features and start transforming your business communications
            </p>
            <Button onClick={() => navigate('/pricing')} size="lg">
              Choose Your Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;