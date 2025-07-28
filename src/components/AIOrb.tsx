import { useState } from "react";
import { MessageCircle, Mic, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIOrbProps {
  size?: "small" | "large";
  position?: "center" | "bottom-right";
}

export function AIOrb({ size = "large", position = "center" }: AIOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  const orbSize = size === "large" ? "w-24 h-24" : "w-12 h-12";
  const positionClass = position === "center" 
    ? "fixed bottom-8 left-1/2 transform -translate-x-1/2" 
    : "fixed bottom-6 right-6";

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would integrate with your AI service
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Here you would integrate with speech recognition
  };

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
            `}
            size="icon"
          >
            {/* Inner glow effect */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-sm"></div>
            
            {/* Icon with holographic effect */}
            <MessageCircle 
              className={`${size === "large" ? "w-8 h-8" : "w-6 h-6"} relative z-10 text-white drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]`} 
            />
            
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
              <CardTitle className="text-lg">Lunivoice AI Assistant</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Chat Area */}
              <div className="flex-1 border rounded-lg p-4 mb-4 bg-muted/20 overflow-y-auto">
                <div className="text-sm text-muted-foreground text-center">
                  👋 Hi! I'm your AI assistant. How can I help you today?
                </div>
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
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleListening}
                >
                  <Mic className="w-4 h-4" />
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