import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building,
  Calendar,
  Handshake,
  TrendingUp,
  MoreVertical,
  Phone,
  Mail,
  Eye,
  Edit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AIOrb } from "@/components/AIOrb";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: string;
  title: string;
  buyer_name: string;
  seller_name: string;
  property_title: string;
  property_location: string;
  offer_price: number;
  listed_price: number;
  deal_status: 'negotiation' | 'offer_made' | 'counter_offer' | 'accepted' | 'contract_sent' | 'signed' | 'completed' | 'cancelled';
  deal_stage: 'inquiry' | 'site_visit' | 'negotiation' | 'documentation' | 'legal' | 'closing';
  probability: number;
  expected_close_date: string;
  commission_amount: number;
  notes: string | null;
  negotiation_history: any[];
  documents: any[];
  created_at: string;
  updated_at: string;
}

interface Contract {
  id: string;
  deal_id: string;
  type: 'LOI' | 'offer_letter' | 'sale_agreement' | 'MOU';
  status: 'draft' | 'sent' | 'signed' | 'executed';
  document_url: string | null;
  signed_at: string | null;
  created_at: string;
}

export default function DealEngine() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedTab, setSelectedTab] = useState("active");

  // Mock data for demonstration
  const mockDeals: Deal[] = [
    {
      id: "1",
      title: "Bandra West Luxury Apartment Deal",
      buyer_name: "Rahul Sharma",
      seller_name: "Property Owner A",
      property_title: "3BHK Sea View Apartment",
      property_location: "Bandra West",
      offer_price: 42000000, // 4.2Cr
      listed_price: 48000000, // 4.8Cr
      deal_status: "negotiation",
      deal_stage: "negotiation",
      probability: 75,
      expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      commission_amount: 800000, // 8L
      notes: "Buyer is flexible on price but wants possession by next month",
      negotiation_history: [
        { date: new Date().toISOString(), type: "counter_offer", amount: 42000000, by: "buyer" },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), type: "initial_offer", amount: 40000000, by: "buyer" }
      ],
      documents: [],
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "2",
      title: "Powai Tech Hub Office Deal", 
      buyer_name: "StartupXYZ Pvt Ltd",
      seller_name: "Commercial Properties Ltd",
      property_title: "Grade A Office Space",
      property_location: "Powai",
      offer_price: 35000000, // 3.5Cr
      listed_price: 35000000, // 3.5Cr
      deal_status: "contract_sent",
      deal_stage: "documentation",
      probability: 90,
      expected_close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      commission_amount: 525000, // 5.25L
      notes: "All terms agreed, contract sent for signatures",
      negotiation_history: [
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), type: "accepted", amount: 35000000, by: "seller" }
      ],
      documents: [
        { type: "LOI", status: "signed" },
        { type: "sale_agreement", status: "sent" }
      ],
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      title: "Juhu Villa Investment Deal",
      buyer_name: "Investor Group",
      seller_name: "Individual Owner",
      property_title: "4BHK Independent Villa",
      property_location: "Juhu",
      offer_price: 125000000, // 12.5Cr
      listed_price: 130000000, // 13Cr
      deal_status: "offer_made",
      deal_stage: "site_visit",
      probability: 60,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      commission_amount: 1875000, // 18.75L
      notes: "Site visit scheduled for this weekend. Buyer interested but wants structural survey",
      negotiation_history: [
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: "initial_offer", amount: 125000000, by: "buyer" }
      ],
      documents: [],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    setDeals(mockDeals);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'offer_made': return 'bg-blue-100 text-blue-800';
      case 'counter_offer': return 'bg-orange-100 text-orange-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'contract_sent': return 'bg-purple-100 text-purple-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageProgress = (stage: string) => {
    const stages = ['inquiry', 'site_visit', 'negotiation', 'documentation', 'legal', 'closing'];
    const currentIndex = stages.indexOf(stage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  const getPriceVariation = (offer: number, listed: number) => {
    const diff = ((offer - listed) / listed) * 100;
    return {
      percentage: Math.abs(diff).toFixed(1),
      isPositive: diff >= 0,
      color: diff >= 0 ? 'text-green-600' : 'text-red-600'
    };
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.property_location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "active" && !['completed', 'cancelled'].includes(deal.deal_status)) ||
                      (selectedTab === "completed" && deal.deal_status === 'completed') ||
                      (selectedTab === "negotiation" && ['negotiation', 'offer_made', 'counter_offer'].includes(deal.deal_status));
    
    return matchesSearch && matchesTab;
  });

  const dealsStats = {
    total: deals.length,
    active: deals.filter(d => !['completed', 'cancelled'].includes(d.deal_status)).length,
    negotiation: deals.filter(d => ['negotiation', 'offer_made', 'counter_offer'].includes(d.deal_status)).length,
    documentation: deals.filter(d => ['contract_sent', 'signed'].includes(d.deal_status)).length,
    completed: deals.filter(d => d.deal_status === 'completed').length,
    totalValue: deals.reduce((sum, deal) => sum + deal.offer_price, 0),
    totalCommission: deals.reduce((sum, deal) => sum + deal.commission_amount, 0)
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
            <h1 className="text-3xl font-bold mb-2">Deal Engine</h1>
            <p className="text-muted-foreground">
              Manage negotiations, contracts, and close deals with AI assistance
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{dealsStats.active}</p>
                  <p className="text-sm text-muted-foreground">Active Deals</p>
                </div>
                <Handshake className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{dealsStats.negotiation}</p>
                  <p className="text-sm text-muted-foreground">Negotiating</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{dealsStats.documentation}</p>
                  <p className="text-sm text-muted-foreground">Documentation</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{dealsStats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 md:col-span-2">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-bold">{formatPrice(dealsStats.totalValue)}</p>
                  <p className="text-sm text-muted-foreground">Total Deal Value</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{formatPrice(dealsStats.totalCommission)}</p>
                  <p className="text-sm text-muted-foreground">Expected Commission</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search deals by title, buyer, or location..."
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
            <TabsTrigger value="active">Active ({dealsStats.active})</TabsTrigger>
            <TabsTrigger value="negotiation">Negotiation ({dealsStats.negotiation})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({dealsStats.completed})</TabsTrigger>
            <TabsTrigger value="all">All ({dealsStats.total})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Deals List */}
              <div className="lg:col-span-2">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Deals ({filteredDeals.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredDeals.map((deal) => {
                        const priceVariation = getPriceVariation(deal.offer_price, deal.listed_price);
                        return (
                          <div
                            key={deal.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              selectedDeal?.id === deal.id 
                                ? 'bg-primary/10 border-primary' 
                                : 'bg-card hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedDeal(deal)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{deal.title}</h3>
                                  <Badge className={getStatusColor(deal.deal_status)}>
                                    {deal.deal_status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {deal.buyer_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Building className="w-3 h-3" />
                                      {deal.property_location}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      <span className="font-medium">{formatPrice(deal.offer_price)}</span>
                                      {deal.offer_price !== deal.listed_price && (
                                        <span className={`text-xs ${priceVariation.color}`}>
                                          ({priceVariation.isPositive ? '+' : '-'}{priceVariation.percentage}%)
                                        </span>
                                      )}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3" />
                                      {deal.probability}% probability
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                                <Badge variant="outline" className="text-xs">
                                  {deal.deal_stage}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Deal Progress</span>
                                <span>{Math.round(getStageProgress(deal.deal_stage))}%</span>
                              </div>
                              <Progress value={getStageProgress(deal.deal_stage)} className="h-1" />
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Expected: {new Date(deal.expected_close_date).toLocaleDateString()}
                              </span>
                              <span>Commission: {formatPrice(deal.commission_amount)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Deal Details */}
              <div>
                {selectedDeal ? (
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle>Deal Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{selectedDeal.title}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getStatusColor(selectedDeal.deal_status)}>
                              {selectedDeal.deal_status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {selectedDeal.deal_stage}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Parties</p>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Buyer: {selectedDeal.buyer_name}</p>
                              <p>Seller: {selectedDeal.seller_name}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Property</p>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>{selectedDeal.property_title}</p>
                              <p className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {selectedDeal.property_location}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Offer Price</p>
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(selectedDeal.offer_price)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Listed Price</p>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(selectedDeal.listed_price)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Deal Progress</p>
                            <Progress value={getStageProgress(selectedDeal.deal_stage)} className="mb-2" />
                            <p className="text-xs text-muted-foreground">
                              {selectedDeal.probability}% probability • Expected: {new Date(selectedDeal.expected_close_date).toLocaleDateString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Expected Commission</p>
                            <p className="text-lg font-semibold text-green-600">
                              {formatPrice(selectedDeal.commission_amount)}
                            </p>
                          </div>

                          {selectedDeal.notes && (
                            <div>
                              <p className="text-sm font-medium mb-1">Notes</p>
                              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {selectedDeal.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 pt-4">
                          <Button size="sm" className="w-full">
                            <Phone className="w-3 h-3 mr-2" />
                            Call Buyer
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <FileText className="w-3 h-3 mr-2" />
                            Generate Contract
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Edit className="w-3 h-3 mr-2" />
                            Update Status
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card border-0">
                    <CardContent className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Select a deal to view details</p>
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