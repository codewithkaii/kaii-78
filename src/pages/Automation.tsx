import { useState } from "react";
import { Plus, Clock, ArrowRight, Settings, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AIOrb } from "@/components/AIOrb";

export default function Automation() {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: "Doctor Forwarding Rule",
      description: "Forward to doctor if user asks 3 times",
      trigger: "Keyword: 'doctor' mentioned 3+ times",
      action: "Forward call to Dr. Smith",
      isActive: true,
      type: "call-routing"
    },
    {
      id: 2,
      name: "Weekend Forwarding",
      description: "Auto-forward calls during weekends",
      trigger: "Time: Saturday-Sunday, All day",
      action: "Forward to emergency line",
      isActive: true,
      type: "time-based"
    },
    {
      id: 3,
      name: "Follow-up Reminder",
      description: "Remind to follow up after 48 hours",
      trigger: "New lead added to CRM",
      action: "Create task: Follow up call",
      isActive: false,
      type: "crm"
    },
    {
      id: 4,
      name: "Appointment Confirmation",
      description: "Send confirmation 24h before appointment",
      trigger: "Appointment scheduled",
      action: "Send SMS confirmation",
      isActive: true,
      type: "scheduling"
    }
  ]);

  const toggleRule = (id: number) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const getRuleTypeColor = (type: string) => {
    const colors = {
      "call-routing": "bg-blue-100 text-blue-800",
      "time-based": "bg-green-100 text-green-800",
      "crm": "bg-purple-100 text-purple-800",
      "scheduling": "bg-orange-100 text-orange-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const ruleTemplates = [
    {
      name: "Business Hours Forwarding",
      description: "Forward calls outside business hours"
    },
    {
      name: "VIP Client Priority",
      description: "Route VIP clients to specific agents"
    },
    {
      name: "Missed Call Follow-up",
      description: "Auto-send message after missed calls"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Automation Rules</h1>
          <p className="text-muted-foreground">Set up intelligent call routing and automated workflows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Active Rules */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-lg border bg-muted/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Badge className={`text-xs ${getRuleTypeColor(rule.type)}`}>
                        {rule.type.replace('-', ' ')}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Trigger:</span>
                        <span className="text-muted-foreground">{rule.trigger}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Action:</span>
                        <span className="text-muted-foreground">{rule.action}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rule Builder */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Rule Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Trigger</h4>
              <select className="w-full p-2 border rounded-md bg-background">
                <option>Select trigger...</option>
                <option>Time-based</option>
                <option>Keyword detection</option>
                <option>Call duration</option>
                <option>Caller ID</option>
              </select>
            </div>
            <div>
              <h4 className="font-medium mb-2">Condition</h4>
              <select className="w-full p-2 border rounded-md bg-background">
                <option>Select condition...</option>
                <option>Equals</option>
                <option>Contains</option>
                <option>Greater than</option>
                <option>Between</option>
              </select>
            </div>
            <div>
              <h4 className="font-medium mb-2">Action</h4>
              <select className="w-full p-2 border rounded-md bg-background">
                <option>Select action...</option>
                <option>Forward call</option>
                <option>Send message</option>
                <option>Create task</option>
                <option>Add to CRM</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>Create Rule</Button>
            <Button variant="outline">Preview</Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Rule Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ruleTemplates.map((template, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 cursor-pointer">
                <h4 className="font-medium mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <Button size="sm" variant="outline">Use Template</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Rules Executed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Calls Routed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">Automatically handled</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Orb */}
      <AIOrb size="small" position="bottom-right" />
    </div>
  );
}