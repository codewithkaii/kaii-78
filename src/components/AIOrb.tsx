import { useState, useEffect } from "react";
import { MessageCircle, Mic, X, Send, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversation } from "@11labs/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AIOrbProps {
  size?: "small" | "large";
  position?: "center" | "bottom-right";
}

export function AIOrb({ size = "large", position = "center" }: AIOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const { toast } = useToast();
  
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      toast({
        title: "Voice Assistant Connected",
        description: "You can now speak with Darvera AI",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onMessage: (message) => {
      console.log("Message:", message);
      if (message.message && message.message.trim()) {
        setConversationHistory(prev => [...prev, `AI: ${message.message}`]);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        title: "Voice Error",
        description: "There was an issue with the voice connection",
        variant: "destructive",
      });
    },
    overrides: {
      agent: {
        prompt: {
          prompt: "You are Darvera AI, a helpful AI assistant for a real estate platform. You help users manage leads, properties, deals, and provide real estate insights. Be concise, friendly, and professional in your responses. Always offer practical suggestions and ask clarifying questions when needed.",
        },
        firstMessage: "Hello! I'm Darvera AI, your real estate assistant. How can I help you manage your properties and leads today?",
        language: "en",
      },
      tts: {
        voiceId: "9BWtsMINqrJLrRacOk9x" // Aria voice
      },
    },
  });
  
  const orbSize = size === "large" ? "w-24 h-24" : "w-12 h-12";
  const positionClass = position === "center" 
    ? "fixed bottom-8 left-1/2 transform -translate-x-1/2" 
    : "fixed bottom-6 right-6";

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = message;
      setConversationHistory(prev => [...prev, `You: ${userMessage}`]);
      setMessage("");
      
      if (conversation.status !== "connected") {
        toast({
          title: "Not Connected",
          description: "Please start the voice conversation first to send messages",
          variant: "destructive",
        });
      }
      // Note: ElevenLabs conversational AI handles text input through voice only
      // For text-based interaction, you would need to implement a separate chat system
    }
  };

  const toggleVoiceConversation = async () => {
    try {
      if (conversation.status === "connected") {
        await conversation.endSession();
      } else {
        // Request microphone access first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Use the Supabase edge function to get signed URL
        const { data, error } = await supabase.functions.invoke('elevenlabs-agent');
        if (error) {
          throw new Error(error.message);
        }
        
        await conversation.startSession({ 
          agentId: data.signed_url // Use the signed URL from our edge function
        });
      }
    } catch (error) {
      console.error("Error toggling conversation:", error);
      toast({
        title: "Voice Error",
        description: error instanceof Error ? error.message : "Failed to toggle voice conversation",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (conversation.status === "connected") {
        conversation.endSession();
      }
    };
  }, []);

  return (
    <>
      {/* Futuristic AI Orb Button */}
      <div className={`${positionClass} z-50`}>
        <div className="relative">
          {/* Outer ring animation */}
          <div className={`${orbSize} absolute inset-0 rounded-full border-2 border-primary/30 animate-spin`} 
               style={{ animationDuration: '8s' }}></div>
          
          {/* Inner orb */}
          <Button
            onClick={() => setIsOpen(true)}
            className={`
              ${orbSize} 
              rounded-full 
              futuristic-orb
              relative
              border-0
              transition-all duration-500 hover:scale-110
              group
              overflow-hidden
              ${conversation.status === "connected" ? "animate-pulse" : ""}
            `}
            size="icon"
          >
            {/* Inner glow effect */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-sm"></div>
            
            {/* Icon with holographic effect */}
            {conversation.status === "connected" ? (
              <Mic 
                className={`${size === "large" ? "w-8 h-8" : "w-6 h-6"} relative z-10 text-green-400 drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]`} 
              />
            ) : (
              <MessageCircle 
                className={`${size === "large" ? "w-8 h-8" : "w-6 h-6"} relative z-10 text-white drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]`} 
              />
            )}
            
            {/* Scanning line effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
          
          {/* Orbit particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`${orbSize} relative`}>
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full animate-spin origin-bottom" 
                   style={{ animationDuration: '3s', transformOrigin: `0 ${size === "large" ? "48px" : "24px"}` }}></div>
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-accent rounded-full animate-spin origin-bottom" 
                   style={{ animationDuration: '4s', animationDelay: '1s', transformOrigin: `0 ${size === "large" ? "48px" : "24px"}` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md h-96 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Darvera AI Assistant</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Connection Status */}
              <div className="mb-4 p-2 rounded-lg bg-muted/20 text-center">
                <div className="text-sm text-muted-foreground">
                  Status: {conversation.status === "connected" ? "🟢 Connected" : "🔴 Disconnected"}
                  {conversation.isSpeaking && " 🎤 Speaking..."}
                </div>
              </div>
              
              {/* Voice Controls */}
              <div className="mb-4 flex justify-center">
                <Button
                  onClick={toggleVoiceConversation}
                  variant={conversation.status === "connected" ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  {conversation.status === "connected" ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      End Voice Chat
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Start Voice Chat
                    </>
                  )}
                </Button>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 border rounded-lg p-4 mb-4 bg-muted/20 overflow-y-auto min-h-[200px]">
                {conversationHistory.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center">
                    👋 Hi! I'm Darvera AI, your real estate assistant. Click "Start Voice Chat" to begin speaking, or type a message below!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversationHistory.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`text-sm p-2 rounded ${
                          msg.startsWith('You:') 
                            ? 'bg-primary/10 text-primary ml-4' 
                            : 'bg-muted/40 mr-4'
                        }`}
                      >
                        {msg}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  variant={conversation.status === "connected" ? "secondary" : "outline"}
                  size="icon"
                  onClick={toggleVoiceConversation}
                  disabled={conversation.status === "connecting"}
                >
                  {conversation.status === "connected" ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}