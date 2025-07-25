import { useState } from "react";
import { Phone, Play, Download, Filter, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AIOrb } from "@/components/AIOrb";

export default function Calls() {
  const [selectedCall, setSelectedCall] = useState<number | null>(null);

  const calls = [
    {
      id: 1,
      contact: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      type: "incoming",
      status: "completed",
      duration: "15:32",
      timestamp: "Today, 2:30 PM",
      hasRecording: true,
      hasTranscript: true,
      summary: "Discussed project timeline and budget requirements. Sarah agreed to the proposal."
    },
    {
      id: 2,
      contact: "Mike Davis",
      phone: "+1 (555) 987-6543", 
      type: "outgoing",
      status: "voicemail",
      duration: "2:15",
      timestamp: "Today, 11:15 AM",
      hasRecording: true,
      hasTranscript: false,
      summary: "Left voicemail about follow-up meeting."
    },
    {
      id: 3,
      contact: "Unknown",
      phone: "+1 (555) 456-7890",
      type: "incoming",
      status: "missed",
      duration: "0:00",
      timestamp: "Yesterday, 4:45 PM",
      hasRecording: false,
      hasTranscript: false,
      summary: ""
    }
  ];

  const getCallIcon = (type: string, status: string) => {
    if (status === "missed") return <PhoneMissed className="w-4 h-4 text-red-500" />;
    if (type === "incoming") return <PhoneIncoming className="w-4 h-4 text-blue-500" />;
    return <PhoneOutgoing className="w-4 h-4 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      missed: "bg-red-100 text-red-800", 
      voicemail: "bg-yellow-100 text-yellow-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calls & Recordings</h1>
          <p className="text-muted-foreground">Manage your call history and recordings</p>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Calls</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
              <TabsTrigger value="missed">Missed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Call Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calls.map((call) => (
                      <div
                        key={call.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedCall === call.id ? 'bg-primary/10 border-primary' : 'bg-muted/20 hover:bg-muted/30'
                        }`}
                        onClick={() => setSelectedCall(call.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getCallIcon(call.type, call.status)}
                            <div>
                              <h4 className="font-medium">{call.contact}</h4>
                              <p className="text-sm text-muted-foreground">{call.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{call.timestamp}</p>
                            <Badge className={`text-xs ${getStatusBadge(call.status)}`}>
                              {call.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Duration: {call.duration}
                          </span>
                          <div className="flex gap-2">
                            {call.hasRecording && (
                              <Button size="sm" variant="outline">
                                <Play className="w-3 h-3 mr-1" />
                                Play
                              </Button>
                            )}
                            {call.hasTranscript && (
                              <Button size="sm" variant="outline">
                                <Download className="w-3 h-3 mr-1" />
                                Transcript
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Call Details */}
        <div>
          {selectedCall ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Call Details</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const call = calls.find(c => c.id === selectedCall);
                  if (!call) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {getCallIcon(call.type, call.status)}
                        <div>
                          <h3 className="font-semibold">{call.contact}</h3>
                          <p className="text-sm text-muted-foreground">{call.phone}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Duration:</span>
                          <span className="text-sm font-medium">{call.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Time:</span>
                          <span className="text-sm font-medium">{call.timestamp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge className={`text-xs ${getStatusBadge(call.status)}`}>
                            {call.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {call.hasRecording && (
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <h4 className="font-medium mb-2">Recording</h4>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {call.summary && (
                        <div>
                          <h4 className="font-medium mb-2">AI Summary</h4>
                          <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
                            {call.summary}
                          </p>
                        </div>
                      )}
                      
                      {call.hasTranscript && (
                        <Button className="w-full">
                          View Full Transcript
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a call to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Orb */}
      <AIOrb size="small" position="bottom-right" />
    </div>
  );
}