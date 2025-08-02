import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  PhoneCall, 
  PhoneMissed, 
  PhoneIncoming, 
  PhoneOutgoing,
  Filter,
  Play,
  Download,
  Calendar,
  Clock,
  User,
  Search
} from 'lucide-react';
import { AIOrb } from '@/components/AIOrb';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

const Calls = () => {
  const [selectedCall, setSelectedCall] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCalls();
      
      // Set up real-time updates
      const channel = supabase
        .channel('call-logs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'call_logs',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchCalls();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast.error('Failed to load call logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.from_number?.includes(searchTerm) || 
                         call.to_number?.includes(searchTerm) ||
                         call.transcript?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || call.call_status === statusFilter;
    const matchesType = typeFilter === 'all' || call.direction === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getCallIcon = (direction, status) => {
    if (status === 'failed' || status === 'no-answer') return PhoneMissed;
    if (direction === 'inbound') return PhoneIncoming;
    if (direction === 'outbound') return PhoneOutgoing;
    return Phone;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'failed':
      case 'no-answer':
        return 'bg-destructive text-destructive-foreground';
      case 'busy':
        return 'bg-warning text-warning-foreground';
      case 'in-progress':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading call logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Call History</h1>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search calls..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="no-answer">No Answer</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inbound">Incoming</SelectItem>
                  <SelectItem value="outbound">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {filteredCalls.length === 0 ? (
                <div className="p-8 text-center">
                  <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No calls found</h3>
                  <p className="text-muted-foreground">
                    {calls.length === 0 
                      ? "You haven't received any calls yet. Your AI assistant is ready to handle incoming calls."
                      : "No calls match your current filters."
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCalls.map((call) => {
                    const Icon = getCallIcon(call.direction, call.call_status);
                    return (
                      <div
                        key={call.id}
                        className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                          selectedCall?.id === call.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedCall(call)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{call.from_number}</p>
                                <Badge className={getStatusBadge(call.call_status)}>
                                  {call.call_status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {call.direction === 'inbound' ? `To: ${call.to_number}` : `From: ${call.to_number}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatDuration(call.duration_seconds)}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(call.created_at)}
                              </span>
                              {call.recording_url && (
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                                      <Play className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href={call.recording_url} download>
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedCall && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Call Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">From</label>
                    <p className="text-lg font-medium">{selectedCall.from_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">To</label>
                    <p className="text-lg">{selectedCall.to_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="text-lg">{formatDuration(selectedCall.duration_seconds)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                    <p className="text-lg">{formatDate(selectedCall.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={getStatusBadge(selectedCall.call_status)}>
                      {selectedCall.call_status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Direction</label>
                    <p className="text-lg capitalize">{selectedCall.direction}</p>
                  </div>
                </div>

                {selectedCall.recording_url && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Recording</label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedCall.recording_url} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4 mr-2" />
                          Play Recording
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedCall.recording_url} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {selectedCall.transcript && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Transcript</label>
                    <div className="p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-sm">{selectedCall.transcript}</p>
                    </div>
                  </div>
                )}

                {selectedCall.ai_summary && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">AI Summary</label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedCall.ai_summary}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!selectedCall && (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <PhoneCall className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">Select a call to view details</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AIOrb />
    </div>
  );
};

export default Calls;