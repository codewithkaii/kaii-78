import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIOrb } from "@/components/AIOrb";

export default function Calendar() {
  const [selectedView, setSelectedView] = useState("week");

  const events = [
    {
      id: 1,
      title: "Call with Sarah",
      time: "2:30 PM - 3:00 PM",
      date: "Today",
      type: "call",
      attendees: ["Sarah Johnson"]
    },
    {
      id: 2,
      title: "Team Sync",
      time: "5:30 PM - 6:00 PM", 
      date: "Today",
      type: "meeting",
      attendees: ["John", "Mike", "Lisa"]
    },
    {
      id: 3,
      title: "Client Review",
      time: "10:00 AM - 11:00 AM",
      date: "Tomorrow",
      type: "review",
      attendees: ["Alex Smith", "Tom Wilson"]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and appointments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="team">Team View</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.filter(event => event.date === "Today").map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{event.attendees.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Week View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center font-medium p-2 bg-muted/20 rounded">
                    {day}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-primary/10 border-l-4 border-primary">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.time} - {event.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Month View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Full calendar view would be integrated here
                <br />
                (Google/Outlook calendar integration)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Team Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Team calendar view would show here
                <br />
                Shared schedules and availability
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline">Find Free Slot</Button>
          <Button variant="outline">Block Time</Button>
          <Button variant="outline">Schedule Recurring</Button>
        </CardContent>
      </Card>

      {/* AI Orb */}
      <AIOrb size="small" position="bottom-right" />
    </div>
  );
}