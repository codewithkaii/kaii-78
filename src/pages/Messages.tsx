import { useState } from "react";
import { MessageSquare, Send, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthContext";

export default function Messages() {
  const { user } = useAuth();
  const [messages] = useState([]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Communication hub for all channels</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Message Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No messages yet. Messages will appear here when you start communicating with leads.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}