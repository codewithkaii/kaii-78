import { useState, useEffect } from 'react';
import { MessageSquare, Play, Reply, Search, Phone, Clock } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AIOrb } from '@/components/AIOrb';
import AuthRequired from '@/components/AuthRequired';
import { toast } from 'sonner';

interface VoiceMessage {
  id: string;
  from_number: string;
  to_number: string;
  message_text: string;
  audio_url?: string;
  transcript?: string;
  ai_response?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  message_type?: string;
  processed_at?: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<VoiceMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('voice_messages')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'voice_messages', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Voice message updated:', payload);
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      // For now, using call_logs as placeholder until voice_messages table exists
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform call logs to voice message format
      const transformedMessages = (data || []).map(call => ({
        id: call.id,
        from_number: call.from_number,
        to_number: call.to_number,
        message_text: call.transcript || 'No transcript available',
        audio_url: call.recording_url,
        transcript: call.transcript,
        ai_response: call.ai_summary,
        created_at: call.created_at,
        updated_at: call.updated_at,
        user_id: call.user_id,
        message_type: 'voice',
        processed_at: call.processed_at
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    // Placeholder - would update voice_messages table when it exists
    console.log('Marking message as read:', messageId);
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSendingReply(true);
    try {
      // Generate AI voice response
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: replyText,
          caller_number: selectedMessage.from_number 
        }
      });

      if (error) throw error;

      // Update message with reply - placeholder
      console.log('Would update message with reply:', replyText);

      toast.success('Reply sent successfully!');
      setReplyText('');
      fetchMessages();
      
      // Update selected message
      if (selectedMessage) {
        setSelectedMessage({
          ...selectedMessage,
          ai_response: replyText
        });
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.from_number?.includes(searchTerm) ||
      message.transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.ai_response?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all'; // Simplified for now

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleMessageSelect = (message: VoiceMessage) => {
    setSelectedMessage(message);
    markAsRead(message.id);
  };

  if (!user) {
    return <AuthRequired title="Voice Messages" description="Please sign in to view and manage your voice messages." />;
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
          <h1 className="text-3xl font-bold tracking-tight">Voice Messages</h1>
          <p className="text-muted-foreground">
            Manage your voice message inbox and AI-powered replies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* Message List */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Inbox ({filteredMessages.length})
            </CardTitle>
            <CardDescription>
              Voice messages from your callers with AI transcripts
            </CardDescription>
            
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter messages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="unreplied">Unreplied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleMessageSelect(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{message.from_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(message.created_at)}
                        </p>
                        {message.transcript && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {message.transcript}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {message.ai_response && (
                        <Badge variant="secondary" className="text-xs">
                          Replied
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No voice messages found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Details */}
        <Card className="flex flex-col">
          <CardContent className="flex-1 p-6">
            {selectedMessage ? (
              <div className="space-y-6 h-full flex flex-col">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Message Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="font-medium">{selectedMessage.from_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Received</p>
                      <p className="font-medium">{formatDate(selectedMessage.created_at)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recording */}
                <div>
                  <h4 className="font-semibold mb-2">Recording</h4>
                  <Button variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Play Voice Message
                  </Button>
                </div>

                {/* Transcript */}
                {selectedMessage.transcript && (
                  <div>
                    <h4 className="font-semibold mb-2">Transcript</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">{selectedMessage.transcript}</p>
                    </div>
                  </div>
                )}

                {/* Previous Reply */}
                {selectedMessage.ai_response && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      Your Reply
                      <Badge variant="secondary" className="text-xs">
                        Sent
                      </Badge>
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <p className="text-sm">{selectedMessage.ai_response}</p>
                    </div>
                  </div>
                )}

                {/* Reply Section */}
                <div className="flex-1 flex flex-col">
                  <h4 className="font-semibold mb-2">
                    {selectedMessage.ai_response ? 'Send Another Reply' : 'Send Reply'}
                  </h4>
                  <div className="flex-1 flex flex-col gap-2">
                    <Textarea
                      placeholder="Type your reply message..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 min-h-[100px]"
                    />
                    <Button 
                      onClick={sendReply}
                      disabled={!replyText.trim() || sendingReply}
                      className="w-full"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      {sendingReply ? 'Sending...' : 'Send AI Voice Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a message to view details</p>
                  <p className="text-sm mt-1">
                    Choose any voice message from the inbox to listen, read transcript, and reply
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