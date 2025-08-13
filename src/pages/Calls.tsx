import { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Play, Download, Search } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AIOrb } from '@/components/AIOrb';
import AuthRequired from '@/components/AuthRequired';

interface CallLog {
  id: string;
  phone_number: string;
  caller_number: string;
  call_direction: string;
  call_status: string;
  duration: number;
  recording_url: string | null;
  transcript: string | null;
  ai_summary: string | null;
  created_at: string;
}

export default function Calls() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchCalls();
      
      // Set up real-time subscription for call updates
      const subscription = supabase
        .channel('call_logs')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'call_logs', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Call log updated:', payload);
            fetchCalls();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchCalls = async () => {
    if (!user) return;
    
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
    } finally {
      setLoading(false);
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = 
      call.caller_number?.includes(searchTerm) ||
      call.phone_number?.includes(searchTerm) ||
      call.transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.ai_summary?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || call.call_status === statusFilter;
    const matchesType = typeFilter === 'all' || call.call_direction === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getCallIcon = (direction: string, status: string) => {
    if (direction === 'inbound') {
      return <PhoneIncoming className="h-4 w-4" />;
    } else if (direction === 'outbound') {
      return <PhoneOutgoing className="h-4 w-4" />;
    }
    return <Phone className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'no-answer': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      busy: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user) {
    return <AuthRequired feature="Call History" />;
  }

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call History</h1>
          <p className="text-muted-foreground">
            View and manage your call logs, recordings, and transcripts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* Call List */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Recent Calls ({filteredCalls.length})
            </CardTitle>
            <CardDescription>
              Your call history with recordings and AI analysis
            </CardDescription>
            
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calls, numbers, or transcripts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="no-answer">No Answer</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {filteredCalls.map((call) => (
                <div
                  key={call.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedCall?.id === call.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCallIcon(call.call_direction, call.call_status)}
                      <div>
                        <p className="font-medium">
                          {call.call_direction === 'inbound' ? call.caller_number : call.phone_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(call.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(call.call_status)}
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(call.duration)}
                      </p>
                    </div>
                  </div>
                  
                  {call.recording_url && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="h-7">
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                      <Button size="sm" variant="outline" className="h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredCalls.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No calls found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call Details */}
        <Card className="flex flex-col">
          <CardContent className="flex-1 p-6">
            {selectedCall ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Call Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="font-medium">{selectedCall.caller_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">To</p>
                      <p className="font-medium">{selectedCall.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{formatDuration(selectedCall.duration)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      {getStatusBadge(selectedCall.call_status)}
                    </div>
                  </div>
                </div>

                <Separator />

                {selectedCall.transcript && (
                  <div>
                    <h4 className="font-semibold mb-2">Transcript</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">{selectedCall.transcript}</p>
                    </div>
                  </div>
                )}

                {selectedCall.ai_summary && (
                  <div>
                    <h4 className="font-semibold mb-2">AI Summary</h4>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <p className="text-sm">{selectedCall.ai_summary}</p>
                    </div>
                  </div>
                )}

                {selectedCall.recording_url && (
                  <div>
                    <h4 className="font-semibold mb-2">Recording</h4>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Play Recording
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <PhoneCall className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a call to view details</p>
                  <p className="text-sm mt-1">
                    Choose any call from the list to see recordings, transcripts, and AI analysis
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AIOrb />
    </div>
  );
}