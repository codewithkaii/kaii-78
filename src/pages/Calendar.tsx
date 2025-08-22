import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIOrb } from "@/components/AIOrb";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Interaction {
  id: string;
  content: string | null;
  channel: string;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
  lead_id: string;
  user_id: string | null;
}

export default function Calendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedView, setSelectedView] = useState("week");
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInteractions();
    }
  }, [user]);

  const fetchInteractions = async () => {
    try {
      // For now, use empty data until database types are updated
      setInteractions([]);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayInteractions = () => {
    const today = new Date();
    return interactions.filter(interaction => {
      if (!interaction.scheduled_at) return false;
      const interactionDate = new Date(interaction.scheduled_at);
      return interactionDate.toDateString() === today.toDateString();
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments and interactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
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
                  {getTodayInteractions().map((interaction) => (
                    <div key={interaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <h4 className="font-medium">
                          {interaction.content || `${interaction.channel} interaction`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {interaction.scheduled_at && new Date(interaction.scheduled_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {interaction.channel}
                        </span>
                      </div>
                    </div>
                  ))}
                  {getTodayInteractions().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No appointments scheduled for today
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
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="p-3 rounded-lg bg-primary/10 border-l-4 border-primary">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {interaction.content || `${interaction.channel} interaction`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {interaction.scheduled_at && (
                            <>
                              {new Date(interaction.scheduled_at).toLocaleDateString()} • 
                              {new Date(interaction.scheduled_at).toLocaleTimeString()}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {interactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments scheduled
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
                Full calendar view - {interactions.length} appointments this month
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
          <Button variant="outline">Schedule Call</Button>
          <Button variant="outline">Block Time</Button>
          <Button variant="outline">Set Reminder</Button>
        </CardContent>
      </Card>

      {/* AI Orb */}
      <AIOrb size="small" position="bottom-right" />
    </div>
  );
}