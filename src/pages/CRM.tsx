import { useState, useEffect } from "react";
import { Search, Plus, Filter, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AIOrb } from "@/components/AIOrb";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  lead_type: string;
  source: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

export default function CRM() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    lead_type: "buyer"
  });

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    try {
      // For now, use mock data until database types are updated
      setLeads([]);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLead = async () => {
    if (!user || !newLead.name.trim()) return;

    try {
      // Create mock lead for now
      const mockLead: Lead = {
        id: Date.now().toString(),
        name: newLead.name,
        email: newLead.email || null,
        phone: newLead.phone || null,
        lead_type: newLead.lead_type,
        source: 'Manual Entry',
        status: 'new',
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      setLeads(prev => [mockLead, ...prev]);

      toast({
        title: "Success",
        description: "Lead added successfully"
      });

      setNewLead({
        name: "",
        email: "",
        phone: "",
        lead_type: "buyer"
      });
      setIsAddingLead(false);
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive"
      });
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.lead_type && lead.lead_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">CRM - Leads Management</h1>
          <p className="text-muted-foreground">Manage your real estate leads</p>
        </div>
        <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lead-name">Name *</Label>
                <Input
                  id="lead-name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  placeholder="Lead name"
                />
              </div>
              <div>
                <Label htmlFor="lead-email">Email</Label>
                <Input
                  id="lead-email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="lead-phone">Phone</Label>
                <Input
                  id="lead-phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addLead} disabled={!newLead.name.trim()}>
                  Add Lead
                </Button>
                <Button variant="outline" onClick={() => setIsAddingLead(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
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
        {/* Leads List */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Leads ({leads.length})</CardTitle>
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
              ) : filteredLeads.length > 0 ? (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedLead === lead.id ? 'bg-primary/10 border-primary' : 'bg-muted/20 hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedLead(lead.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{lead.name}</h3>
                          <p className="text-sm text-muted-foreground">{lead.lead_type}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </span>
                            )}
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`text-xs ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {lead.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No leads found</p>
                  <Button onClick={() => setIsAddingLead(true)}>Add Your First Lead</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lead Details */}
        <div>
          {selectedLead ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const lead = leads.find(l => l.id === selectedLead);
                  if (!lead) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{lead.name}</h3>
                        <p className="text-muted-foreground">{lead.lead_type}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{lead.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Source: {lead.source} • Added: {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        {lead.phone && (
                          <Button size="sm" className="flex-1">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        )}
                        {lead.email && (
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
                <p className="text-muted-foreground">Select a lead to view details</p>
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