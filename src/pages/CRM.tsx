import { useState } from "react";
import { Search, Plus, Filter, Phone, Mail, Tag, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIOrb } from "@/components/AIOrb";

export default function CRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<number | null>(null);

  const clients = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 123-4567",
      company: "Tech Solutions Inc",
      tags: ["VIP", "Active"],
      lastContact: "2 days ago",
      notes: "Interested in enterprise package. Follow up next week.",
      status: "hot"
    },
    {
      id: 2,
      name: "Mike Davis",
      email: "mike@startup.com",
      phone: "+1 (555) 987-6543",
      company: "Startup Co",
      tags: ["New Lead"],
      lastContact: "1 week ago",
      notes: "Left voicemail, waiting for response.",
      status: "warm"
    },
    {
      id: 3,
      name: "Lisa Chen",
      email: "lisa@business.com",
      phone: "+1 (555) 456-7890",
      company: "Business Corp",
      tags: ["Returning", "Premium"],
      lastContact: "Yesterday",
      notes: "Regular client, scheduling quarterly review.",
      status: "active"
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot": return "bg-red-100 text-red-800";
      case "warm": return "bg-yellow-100 text-yellow-800";
      case "active": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">CRM</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedClient === client.id ? 'bg-primary/10 border-primary' : 'bg-muted/20 hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedClient(client.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.company}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {client.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          <Badge className={`text-xs ${getStatusColor(client.status)}`}>
                            {client.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Details */}
        <div>
          {selectedClient ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const client = clients.find(c => c.id === selectedClient);
                  if (!client) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <p className="text-muted-foreground">{client.company}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{client.email}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {client.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
                          {client.notes}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Last contact: {client.lastContact}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button size="sm" className="flex-1">
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="w-3 h-3 mr-1" />
                          Email
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
                <p className="text-muted-foreground">Select a client to view details</p>
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