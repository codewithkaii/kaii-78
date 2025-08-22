import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  Mail, 
  Star,
  MapPin,
  IndianRupee,
  Calendar,
  User,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AIOrb } from "@/components/AIOrb";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: 'website' | 'whatsapp' | 'call' | 'referral' | 'ad';
  persona: 'buyer' | 'seller' | 'investor';
  budget_min: number | null;
  budget_max: number | null;
  location_preferences: string[];
  requirements: string | null;
  ai_score: number;
  status: 'new' | 'qualified' | 'contacted' | 'meeting_scheduled' | 'converted' | 'lost';
  assigned_agent: string | null;
  created_at: string;
  updated_at: string;
  transcript_summary: string | null;
}

export default function LeadsEngine() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  // Mock data for demonstration
  const mockLeads: Lead[] = [
    {
      id: "1",
      name: "Rahul Sharma",
      phone: "+91 9876543210",
      email: "rahul.sharma@gmail.com",
      source: "whatsapp",
      persona: "buyer",
      budget_min: 80_00_000,
      budget_max: 120_00_000,
      location_preferences: ["Andheri West", "Bandra", "Juhu"],
      requirements: "2-3 BHK apartment, sea view preferred, good connectivity",
      ai_score: 85,
      status: "qualified",
      assigned_agent: "Agent 1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      transcript_summary: "Interested buyer looking for luxury apartment with sea view. Budget flexible up to 1.2Cr."
    },
    {
      id: "2", 
      name: "Priya Mehta",
      phone: "+91 9876543211",
      email: "priya.mehta@yahoo.com",
      source: "call",
      persona: "seller",
      budget_min: null,
      budget_max: null,
      location_preferences: ["Powai"],
      requirements: "Selling 2BHK in Powai, urgent sale required",
      ai_score: 92,
      status: "new",
      assigned_agent: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      transcript_summary: "Property owner with 2BHK in Powai tech hub. Urgent sale due to relocation."
    },
    {
      id: "3",
      name: "Amit Patel", 
      phone: "+91 9876543212",
      email: null,
      source: "website",
      persona: "investor",
      budget_min: 200_00_000,
      budget_max: 500_00_000,
      location_preferences: ["Lower Parel", "BKC", "Worli"],
      requirements: "Commercial spaces for investment, high ROI areas",
      ai_score: 78,
      status: "contacted",
      assigned_agent: "Agent 2",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
      transcript_summary: "HNI investor looking for commercial real estate opportunities in prime locations."
    }
  ];

  useEffect(() => {
    setLeads(mockLeads);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'meeting_scheduled': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return MessageSquare;
      case 'call': return Phone;
      case 'website': return User;
      case 'referral': return Star;
      case 'ad': return TrendingUp;
      default: return User;
    }
  };

  const getPersonaColor = (persona: string) => {
    switch (persona) {
      case 'buyer': return 'bg-green-100 text-green-800';
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'investor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      return `₹${amount.toLocaleString()}`;
    };
    
    if (min && max) return `${formatAmount(min)} - ${formatAmount(max)}`;
    if (min) return `${formatAmount(min)}+`;
    if (max) return `Up to ${formatAmount(max)}`;
    return "Not specified";
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === "all" || lead.status === selectedTab;
    
    return matchesSearch && matchesTab;
  });

  const leadsStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Leads Engine</h1>
            <p className="text-muted-foreground">
              AI-powered lead intake, qualification, and routing system
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{leadsStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                </div>
                <User className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{leadsStats.new}</p>
                  <p className="text-sm text-muted-foreground">New</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{leadsStats.qualified}</p>
                  <p className="text-sm text-muted-foreground">Qualified</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{leadsStats.contacted}</p>
                  <p className="text-sm text-muted-foreground">Contacted</p>
                </div>
                <Phone className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{leadsStats.converted}</p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All ({leadsStats.total})</TabsTrigger>
            <TabsTrigger value="new">New ({leadsStats.new})</TabsTrigger>
            <TabsTrigger value="qualified">Qualified ({leadsStats.qualified})</TabsTrigger>
            <TabsTrigger value="contacted">Contacted ({leadsStats.contacted})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leads List */}
              <div className="lg:col-span-2">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Leads ({filteredLeads.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredLeads.map((lead) => {
                        const SourceIcon = getSourceIcon(lead.source);
                        return (
                          <div
                            key={lead.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              selectedLead?.id === lead.id 
                                ? 'bg-primary/10 border-primary' 
                                : 'bg-card hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{lead.name}</h3>
                                  <Badge className={getPersonaColor(lead.persona)}>
                                    {lead.persona}
                                  </Badge>
                                  <Badge className={getStatusColor(lead.status)}>
                                    {lead.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
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
                                  
                                  <div className="flex items-center gap-1">
                                    <IndianRupee className="w-3 h-3" />
                                    <span>{formatBudget(lead.budget_min, lead.budget_max)}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{lead.location_preferences.join(", ")}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1">
                                  <SourceIcon className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground capitalize">{lead.source}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm font-medium">{lead.ai_score}</span>
                                </div>
                              </div>
                            </div>
                            
                            {lead.transcript_summary && (
                              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                {lead.transcript_summary}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Details */}
              <div>
                {selectedLead ? (
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle>Lead Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{selectedLead.name}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getPersonaColor(selectedLead.persona)}>
                              {selectedLead.persona}
                            </Badge>
                            <Badge className={getStatusColor(selectedLead.status)}>
                              {selectedLead.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Contact</p>
                            {selectedLead.phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {selectedLead.phone}
                              </p>
                            )}
                            {selectedLead.email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {selectedLead.email}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Budget</p>
                            <p className="text-sm text-muted-foreground">
                              {formatBudget(selectedLead.budget_min, selectedLead.budget_max)}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Preferred Locations</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedLead.location_preferences.map((location, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {location}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">AI Score</p>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${selectedLead.ai_score}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{selectedLead.ai_score}</span>
                            </div>
                          </div>

                          {selectedLead.requirements && (
                            <div>
                              <p className="text-sm font-medium mb-1">Requirements</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedLead.requirements}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 pt-4">
                          <Button size="sm" className="w-full">
                            <Phone className="w-3 h-3 mr-2" />
                            Call Lead
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <MessageSquare className="w-3 h-3 mr-2" />
                            Send Message
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Calendar className="w-3 h-3 mr-2" />
                            Schedule Meeting
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card border-0">
                    <CardContent className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Select a lead to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Orb */}
        <AIOrb size="small" position="bottom-right" />
      </div>
    </div>
  );
}