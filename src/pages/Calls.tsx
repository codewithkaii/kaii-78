import { useState } from "react";
import { Phone, PhoneCall, Voicemail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthContext";

export default function Calls() {
  const { user } = useAuth();
  const [phoneInteractions] = useState([]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calls & Voice</h1>
          <p className="text-muted-foreground">Manage your phone interactions</p>
        </div>
        <Button>
          <PhoneCall className="w-4 h-4 mr-2" />
          Make Call
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Answered</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Voicemail className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Voicemails</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">0h 0m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No calls yet. Call history will appear here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}