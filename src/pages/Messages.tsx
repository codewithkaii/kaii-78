import { useState } from "react";
import { Search, Filter, Reply, Archive, Trash2, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIOrb } from "@/components/AIOrb";

export default function Messages() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const messages = [
    {
      id: 1,
      type: "voicemail",
      from: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      timestamp: "2 hours ago",
      duration: "1:45",
      transcript: "Hi, this is Sarah Johnson calling about the project proposal we discussed. I have a few questions about the timeline and would love to schedule a follow-up call. Please call me back when you get a chance. Thanks!",
      isHandled: false,
      hasAudio: true
    },
    {
      id: 2,
      type: "message",
      from: "Mike Davis",
      phone: "+1 (555) 987-6543",
      timestamp: "5 hours ago",
      duration: null,
      transcript: "Thanks for the quick response to my inquiry. I'll review the documents and get back to you by Friday.",
      isHandled: true,
      hasAudio: false
    },
    {
      id: 3,
      type: "voicemail",
      from: "Unknown",
      phone: "+1 (555) 456-7890",
      timestamp: "1 day ago",
      duration: "0:32",
      transcript: "Hello, I'm calling to inquire about your services. Could someone please call me back? Thank you.",
      isHandled: false,
      hasAudio: true
    }
  ];

  const filteredMessages = messages.filter(message =>
    message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.transcript.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMessageTypeColor = (type: string) => {
    return type === "voicemail" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
  };

  const handleMarkAsHandled = (id: number) => {
    // In a real app, this would update the backend
    console.log(`Marking message ${id} as handled`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages & Voicemails</h1>
          <p className="text-muted-foreground">Manage your voicemails and messages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Messages</TabsTrigger>
              <TabsTrigger value="voicemails">Voicemails</TabsTrigger>
              <TabsTrigger value="unhandled">Unhandled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedMessage === message.id ? 'bg-primary/10 border-primary' : 'bg-muted/20 hover:bg-muted/30'
                        } ${!message.isHandled ? 'border-l-4 border-l-blue-500' : ''}`}
                        onClick={() => setSelectedMessage(message.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{message.from}</h4>
                            <p className="text-sm text-muted-foreground">{message.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge className={`text-xs ${getMessageTypeColor(message.type)}`}>
                                {message.type}
                              </Badge>
                              {!message.isHandled && (
                                <Badge variant="destructive" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {message.transcript}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          {message.duration && (
                            <span className="text-xs text-muted-foreground">
                              Duration: {message.duration}
                            </span>
                          )}
                          <div className="flex gap-2">
                            {message.hasAudio && (
                              <Button size="sm" variant="outline">
                                <Volume2 className="w-3 h-3 mr-1" />
                                Play
                              </Button>
                            )}
                            {!message.isHandled && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsHandled(message.id);
                                }}
                              >
                                Mark Handled
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

        {/* Message Details */}
        <div>
          {selectedMessage ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Message Details</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const message = messages.find(m => m.id === selectedMessage);
                  if (!message) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{message.from}</h3>
                        <p className="text-sm text-muted-foreground">{message.phone}</p>
                        <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge className={`text-xs ${getMessageTypeColor(message.type)}`}>
                          {message.type}
                        </Badge>
                        {!message.isHandled && (
                          <Badge variant="destructive" className="text-xs">
                            Unhandled
                          </Badge>
                        )}
                      </div>
                      
                      {message.hasAudio && (
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <h4 className="font-medium mb-2">Audio Recording</h4>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Volume2 className="w-3 h-3 mr-1" />
                              Play
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                          {message.duration && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Duration: {message.duration}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Transcript</h4>
                        <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
                          {message.transcript}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button size="sm" className="flex-1">
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                        <Button size="sm" variant="outline">
                          <Archive className="w-3 h-3 mr-1" />
                          Archive
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline">Mark All as Read</Button>
          <Button variant="outline">Archive All Handled</Button>
          <Button variant="outline">Export Transcripts</Button>
        </CardContent>
      </Card>

      {/* AI Orb */}
      <AIOrb size="small" position="bottom-right" />
    </div>
  );
}