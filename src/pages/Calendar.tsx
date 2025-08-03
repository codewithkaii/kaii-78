import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Filter, Users, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AIOrb } from "@/components/AIOrb";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PlanGate } from "@/components/PlanGate";
import { useToast } from "@/hooks/use-toast";
import { useBackendSync } from "@/hooks/useBackendSync";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  attendees: string[];
  google_calendar_id?: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { connectGoogleCalendar, fetchGoogleCalendarEvents } = useBackendSync();
  const [selectedView, setSelectedView] = useState("week");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents();
      checkGoogleConnection();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleConnection = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('google_calendar_connected')
        .eq('user_id', user?.id)
        .single();

      setIsGoogleConnected(data?.google_calendar_connected || false);
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      await connectGoogleCalendar();
      toast({
        title: "Connecting...",
        description: "Please complete the authorization in the popup window"
      });
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
    }
  };

  const syncGoogleEvents = async () => {
    try {
      await fetchGoogleCalendarEvents();
      fetchEvents();
      toast({
        title: "Success",
        description: "Google Calendar events synced successfully"
      });
    } catch (error) {
      console.error('Error syncing Google events:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and appointments</p>
        </div>
        <div className="flex gap-2">
          {!isGoogleConnected ? (
            <Button variant="outline" onClick={handleGoogleConnect}>
              <Link className="w-4 h-4 mr-2" />
              Connect Google Calendar
            </Button>
          ) : (
            <Button variant="outline" onClick={syncGoogleEvents}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Sync Google Calendar
            </Button>
          )}
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
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-3 rounded-lg bg-muted/20">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {events
                    .filter(event => {
                      const eventDate = new Date(event.start_time);
                      const today = new Date();
                      return eventDate.toDateString() === today.toDateString();
                    })
                    .map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                          </p>
                          {event.google_calendar_id && (
                            <Badge variant="outline" className="text-xs mt-1">Google</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{event.attendees?.length || 0}</span>
                        </div>
                      </div>
                    ))}
                  {events.filter(event => {
                    const eventDate = new Date(event.start_time);
                    const today = new Date();
                    return eventDate.toDateString() === today.toDateString();
                  }).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No events scheduled for today
                    </div>
                  )}
                </div>
              )}
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start_time).toLocaleDateString()} • 
                          {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                        </p>
                      </div>
                      {event.google_calendar_id && (
                        <Badge variant="outline" className="text-xs">Google</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No events scheduled. {!isGoogleConnected && "Connect Google Calendar to sync your events."}
                  </div>
                )}
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
                {isGoogleConnected ? (
                  <>
                    Full calendar view
                    <br />
                    <Button variant="outline" className="mt-4" onClick={syncGoogleEvents}>
                      Sync Latest Events
                    </Button>
                  </>
                ) : (
                  <>
                    Connect Google Calendar to see your full monthly view
                    <br />
                    <Button className="mt-4" onClick={handleGoogleConnect}>
                      Connect Google Calendar
                    </Button>
                  </>
                )}
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