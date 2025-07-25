import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Phone, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIOrb } from "@/components/AIOrb";

export default function Analytics() {
  const callVolumeData = [
    { name: 'Mon', calls: 12 },
    { name: 'Tue', calls: 19 },
    { name: 'Wed', calls: 15 },
    { name: 'Thu', calls: 25 },
    { name: 'Fri', calls: 22 },
    { name: 'Sat', calls: 8 },
    { name: 'Sun', calls: 5 }
  ];

  const conversionData = [
    { name: 'Leads', value: 45, color: '#8989DE' },
    { name: 'Qualified', value: 30, color: '#7EBF8E' },
    { name: 'Converted', value: 15, color: '#D2886F' },
    { name: 'Lost', value: 10, color: '#605F5B' }
  ];

  const peakHoursData = [
    { hour: '9AM', calls: 5 },
    { hour: '10AM', calls: 8 },
    { hour: '11AM', calls: 12 },
    { hour: '12PM', calls: 15 },
    { hour: '1PM', calls: 18 },
    { hour: '2PM', calls: 22 },
    { hour: '3PM', calls: 20 },
    { hour: '4PM', calls: 16 },
    { hour: '5PM', calls: 10 }
  ];

  const stats = [
    {
      title: "Total Calls",
      value: "1,234",
      change: "+12%",
      icon: Phone,
      color: "text-blue-600"
    },
    {
      title: "Avg Call Duration",
      value: "8:32",
      change: "+5%",
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Conversion Rate",
      value: "23.5%",
      change: "+3%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Active Clients",
      value: "456",
      change: "+8%",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your business performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calls">Call Analytics</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Weekly Call Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={callVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#605F5B" />
                  <XAxis dataKey="name" stroke="#E6E4DD" />
                  <YAxis stroke="#E6E4DD" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#3A3935',
                      border: '1px solid #605F5B',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="calls" fill="#8989DE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Peak Call Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#605F5B" />
                  <XAxis dataKey="hour" stroke="#E6E4DD" />
                  <YAxis stroke="#E6E4DD" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#3A3935',
                      border: '1px solid #605F5B',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="calls" stroke="#7EBF8E" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Call Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={conversionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {conversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  {conversionData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Detailed conversion analytics would be displayed here
                  <br />
                  Including lead sources, conversion paths, and optimization insights
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-sm">📈 Call volume increased by 12% this week, with peak activity between 1-3 PM</p>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <p className="text-sm">✅ Conversion rate improved by 3% after implementing new greeting scripts</p>
            </div>
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm">⚠️ Consider adding more staff during 2-3 PM to handle peak call volume</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Orb */}
      <AIOrb size="small" position="bottom-right" />
    </div>
  );
}