import { useState, useEffect } from "react";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Activity,
  Users,
  Building,
  DollarSign,
  Phone,
  MessageSquare,
  FileText,
  Settings,
  Zap,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIOrb } from "@/components/AIOrb";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApprovalCard {
  id: string;
  type: 'lead_routing' | 'offer_negotiation' | 'listing_approval' | 'system_fix' | 'contract_send';
  title: string;
  description: string;
  context: any;
  risk_level: 'low' | 'medium' | 'high';
  recommended_action: 'approve' | 'reject' | 'review';
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface SystemMetric {
  name: string;
  value: string;
  change: string;
  status: 'good' | 'warning' | 'critical';
  icon: any;
}

export default function ControlTower() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvalCards, setApprovalCards] = useState<ApprovalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  const systemMetrics: SystemMetric[] = [
    {
      name: "Lead Conversion",
      value: "23.4%",
      change: "+2.1%",
      status: "good",
      icon: TrendingUp
    },
    {
      name: "Active Leads",
      value: "847",
      change: "+15",
      status: "good", 
      icon: Users
    },
    {
      name: "Listings Live",
      value: "1,234",
      change: "+45",
      status: "good",
      icon: Building
    },
    {
      name: "Revenue Pipeline",
      value: "₹2.4Cr",
      change: "+18%",
      status: "good",
      icon: DollarSign
    },
    {
      name: "System Health",
      value: "99.2%",
      change: "Stable",
      status: "good",
      icon: Activity
    },
    {
      name: "AI Response Time",
      value: "1.2s",
      change: "-0.3s",
      status: "good",
      icon: Zap
    }
  ];

  const mockApprovalCards: ApprovalCard[] = [
    {
      id: "1",
      type: "lead_routing",
      title: "High-Value Lead Routing",
      description: "Premium lead from Bandra requiring immediate attention - Budget ₹5Cr+",
      context: { lead_score: 95, budget: "5-7Cr", location: "Bandra West" },
      risk_level: "high",
      recommended_action: "approve",
      created_at: new Date().toISOString(),
      status: "pending" as const
    },
    {
      id: "2", 
      type: "offer_negotiation",
      title: "Counter-Offer Negotiation",
      description: "Client wants to counter at ₹4.2Cr for Juhu property (Listed: ₹4.8Cr)",
      context: { original_price: "4.8Cr", counter_offer: "4.2Cr", margin_impact: "-12%" },
      risk_level: "medium",
      recommended_action: "review",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: "pending" as const
    },
    {
      id: "3",
      type: "system_fix",
      title: "CTO Agent: WhatsApp API Latency Fix",
      description: "Auto-detected high latency in WhatsApp responses. Proposed fix ready.",
      context: { avg_latency: "3.2s", proposed_fix: "Connection pool optimization" },
      risk_level: "low", 
      recommended_action: "approve",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      status: "pending" as const
    }
  ];

  useEffect(() => {
    setApprovalCards(mockApprovalCards);
    setLoading(false);
  }, []);

  const handleApproval = async (cardId: string, action: 'approve' | 'reject') => {
    const updatedCards = approvalCards.map(card => 
      card.id === cardId ? { ...card, status: (action === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected' } : card
    );
    setApprovalCards(updatedCards);
    
    toast({
      title: `Action ${action}d`,
      description: `The request has been ${action}d successfully.`,
      variant: action === 'approve' ? 'default' : 'destructive'
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-muted rounded"></div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-primary" />
              Control Tower
            </h1>
            <p className="text-muted-foreground">
              Central command center for Darvera AI Real Estate Platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              All Systems Operational
            </Badge>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {systemMetrics.map((metric, index) => (
            <Card key={index} className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="w-5 h-5 text-muted-foreground" />
                  <span className={`text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.change}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals ({approvalCards.filter(c => c.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="live-ops">Live Ops</TabsTrigger>
            <TabsTrigger value="deals">Deals Desk</TabsTrigger>
            <TabsTrigger value="cto">CTO Agent</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Leads Engine</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Listings Hub</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Deal Engine</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CRM & Communications</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span>New lead from WhatsApp - Andheri West</span>
                      <span className="text-muted-foreground">2m ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="w-4 h-4 text-green-500" />
                      <span>Listing approved - Bandra East 3BHK</span>
                      <span className="text-muted-foreground">8m ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span>Contract signed - Juhu deal closed</span>
                      <span className="text-muted-foreground">15m ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and approve critical business decisions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvalCards.filter(card => card.status === 'pending').map((card) => (
                    <div key={card.id} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{card.title}</h4>
                            <Badge className={getRiskColor(card.risk_level)}>
                              {card.risk_level} risk
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {card.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(card.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproval(card.id, 'approve')}
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproval(card.id, 'reject')}
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live-ops" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>Active Calls & Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Rahul Sharma - Incoming Call</span>
                        <Badge className="bg-blue-100 text-blue-800">Live</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Interested in 2BHK Andheri - Budget ₹1.2Cr
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Priya Patel - WhatsApp</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Discussing site visit for Bandra property
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">Site Visit - Amit Singh</p>
                        <p className="text-sm text-muted-foreground">Today 3:00 PM - Juhu 3BHK</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">Document Signing - Neha Gupta</p>
                        <p className="text-sm text-muted-foreground">Tomorrow 11:00 AM - Office</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Active Negotiations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Bandra West 3BHK - Luxury Apartment</h4>
                      <Badge className="bg-yellow-100 text-yellow-800">Negotiating</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Listed Price</p>
                        <p className="font-semibold">₹4.8 Crores</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Offer Price</p>
                        <p className="font-semibold">₹4.2 Crores</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin Impact</p>
                        <p className="font-semibold text-red-600">-12%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cto" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>CTO AI Agent</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Self-healing system monitor and automation
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">System Auto-Fix Applied</span>
                    </div>
                    <p className="text-sm text-green-700">
                      WhatsApp API connection pool optimized. Response time improved by 40%.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Performance Optimization</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Database query optimization suggested for leads search functionality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Orb */}
        <AIOrb size="small" position="bottom-right" />
      </div>
    </div>
  );
}