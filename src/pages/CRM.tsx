import { useState, useEffect } from "react";
import { Search, Plus, Filter, Phone, Mail, Tag, MoreVertical, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIOrb } from "@/components/AIOrb";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBackendSync } from "@/hooks/useBackendSync";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  tags: string[];
  notes: string;
  status: string;
  last_contact: string;
}

export default function CRM() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { syncClientsToBackend } = useBackendSync();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    status: "active"
  });

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addClient = async () => {
    if (!user || !newClient.name.trim()) return;

    try {
      const { error } = await supabase
        .from('clients')
        .insert([{
          ...newClient,
          user_id: user.id,
          tags: [],
          last_contact: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client added successfully"
      });

      setNewClient({
        name: "",
        email: "",
        phone: "",
        company: "",
        notes: "",
        status: "active"
      });
      setIsAddingClient(false);
      fetchClients();
      syncClientsToBackend();
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive"
      });
    }
  };

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
        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-name">Name *</Label>
                  <Input
                    id="client-name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <Label htmlFor="client-company">Company</Label>
                  <Input
                    id="client-company"
                    value={newClient.company}
                    onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="client-phone">Phone</Label>
                  <Input
                    id="client-phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="client-notes">Notes</Label>
                <Textarea
                  id="client-notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  placeholder="Client notes..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addClient} disabled={!newClient.name.trim()}>
                  Add Client
                </Button>
                <Button variant="outline" onClick={() => setIsAddingClient(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 rounded-lg bg-muted/20">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredClients.length > 0 ? (
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
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </span>
                            )}
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {client.tags?.map((tag, index) => (
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
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No clients found</p>
                  <Button onClick={() => setIsAddingClient(true)}>Add Your First Client</Button>
                </div>
              )}
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
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{client.email}</span>
                          </div>
                        )}
                      </div>
                      
                      {client.tags && client.tags.length > 0 && (
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
                      )}
                      
                      {client.notes && (
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
                            {client.notes}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Last contact: {client.last_contact ? new Date(client.last_contact).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        {client.phone && (
                          <Button size="sm" className="flex-1">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        )}
                        {client.email && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                        )}
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