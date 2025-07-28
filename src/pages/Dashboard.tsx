import { useState, useEffect } from "react";
import { 
  Phone, 
  Calendar as CalendarIcon, 
  Users, 
  TrendingUp, 
  PhoneCall, 
  Voicemail,
  Clock,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIOrb } from "@/components/AIOrb";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName] = useState("Alex"); // This would come from user context

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    {
      title: "ACTIVE CLIENTS",
      value: "847",
      description: "+12.5% from last month",
      icon: Users,
      color: "text-primary",
      change: "+12.5%"
    },
    {
      title: "MONTHLY REVENUE",
      value: "$52,291",
      description: "+8.2% growth",
      icon: TrendingUp,
      color: "text-primary",
      change: "+8.2%"
    },
    {
      title: "CALLS HANDLED",
      value: "1,247",
      description: "94% success rate",
      icon: PhoneCall,
      color: "text-primary",
      change: "+16.84%"
    },
    {
      title: "APPOINTMENTS",
      value: "324",
      description: "This month",
      icon: CalendarIcon,
      color: "text-primary",
      change: "+2.34%"
    }
  ];

  const activities = [
    {
      time: "10:30 AM",
      action: "Call with John Smith",
      status: "Completed",
      type: "call"
    },
    {
      time: "11:15 AM", 
      action: "Sarah Johnson added to CRM",
      status: "New",
      type: "crm"
    },
    {
      time: "12:00 PM",
      action: "Appointment scheduled",
      status: "Confirmed",
      type: "booking"
    },
    {
      time: "1:30 PM",
      action: "Voicemail from Mike Davis",
      status: "Pending",
      type: "voicemail"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground">
            Here's take a look at your performance and analytics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-0 hover:bg-card/90 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-primary">{stat.change}</span>
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

        {/* Activity Chart and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart Placeholder */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0 h-96">
              <CardHeader>
                <CardTitle className="text-lg">Performance Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </CardHeader>
              <CardContent className="h-full">
                <div className="h-full flex items-center justify-center bg-muted/10 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">Analytics Dashboard</p>
                    <p className="text-sm text-muted-foreground">Interactive charts coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="glass-card border-0 h-96">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                      <div className="text-xs text-muted-foreground min-w-[60px] mt-1">
                        {activity.time}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.action}</p>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                          activity.status === 'Completed' ? 'bg-primary/20 text-primary' :
                          activity.status === 'Pending' ? 'bg-warning/20 text-warning' :
                          activity.status === 'New' ? 'bg-accent/20 text-accent' :
                          'bg-muted/20 text-muted-foreground'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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