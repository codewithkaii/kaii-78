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
      title: "Upcoming Appointments",
      value: "3",
      description: "Next: 2:30 PM with Sarah",
      icon: CalendarIcon,
      color: "text-blue-600"
    },
    {
      title: "Missed Calls",
      value: "2",
      description: "1 voicemail pending",
      icon: PhoneCall,
      color: "text-red-600"
    },
    {
      title: "Recent Bookings",
      value: "5",
      description: "Today: 2 confirmed",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "CRM Activity",
      value: "12",
      description: "New interactions",
      icon: Users,
      color: "text-purple-600"
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
    <div className="p-6 space-y-6">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="text-muted-foreground">
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">Today's Agenda</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• 2:30 PM - Call with Sarah about project updates</li>
            <li>• 4:00 PM - Review new client proposals</li>
            <li>• 5:30 PM - Team sync meeting</li>
          </ul>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <div className="text-xs text-muted-foreground min-w-[60px]">
                  {activity.time}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Central AI Orb */}
      <AIOrb size="large" position="center" />
    </div>
  );
}