import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Home,
  IndianRupee,
  Calendar,
  Eye,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  Camera,
  MoreVertical
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

interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: 'apartment' | 'villa' | 'office' | 'shop' | 'plot';
  bhk: number | null;
  area_sqft: number | null;
  price: number;
  location: string;
  address: string | null;
  amenities: string[];
  images: string[];
  status: 'draft' | 'verified' | 'live' | 'reserved' | 'sold';
  valuation_score: number | null;
  fraud_score: number | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export default function ListingsHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  // Mock data for demonstration
  const mockProperties: Property[] = [
    {
      id: "1",
      title: "Luxury 3BHK Sea View Apartment",
      description: "Stunning sea-facing apartment in Bandra West with modern amenities and premium finishes.",
      property_type: "apartment",
      bhk: 3,
      area_sqft: 1450,
      price: 48000000, // 4.8Cr
      location: "Bandra West",
      address: "Linking Road, Bandra West, Mumbai - 400050",
      amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Sea View", "Elevator"],
      images: ["/placeholder-property1.jpg", "/placeholder-property2.jpg"],
      status: "live",
      valuation_score: 92,
      fraud_score: 8,
      owner_id: "owner1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "2",
      title: "Modern 2BHK Tech Hub Apartment",
      description: "Contemporary apartment in Powai tech hub, perfect for professionals.",
      property_type: "apartment", 
      bhk: 2,
      area_sqft: 950,
      price: 18000000, // 1.8Cr
      location: "Powai",
      address: "Hiranandani Gardens, Powai, Mumbai - 400076",
      amenities: ["Gym", "Security", "Parking", "Garden", "Club House"],
      images: ["/placeholder-property3.jpg"],
      status: "verified",
      valuation_score: 85,
      fraud_score: 12,
      owner_id: "owner2",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "3",
      title: "Premium Office Space",
      description: "Grade A office space in Lower Parel business district with modern infrastructure.",
      property_type: "office",
      bhk: null,
      area_sqft: 2500,
      price: 75000000, // 7.5Cr
      location: "Lower Parel",
      address: "Senapati Bapat Marg, Lower Parel, Mumbai - 400013",
      amenities: ["AC", "Elevator", "Security", "Parking", "Conference Room"],
      images: ["/placeholder-office1.jpg"],
      status: "draft",
      valuation_score: null,
      fraud_score: null,
      owner_id: "owner3",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  useEffect(() => {
    setProperties(mockProperties);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return Clock;
      case 'verified': return CheckCircle;
      case 'live': return Eye;
      case 'reserved': return AlertCircle;
      case 'sold': return CheckCircle;
      default: return Clock;
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === "all" || property.status === selectedTab;
    
    return matchesSearch && matchesTab;
  });

  const propertiesStats = {
    total: properties.length,
    draft: properties.filter(p => p.status === 'draft').length,
    verified: properties.filter(p => p.status === 'verified').length,
    live: properties.filter(p => p.status === 'live').length,
    sold: properties.filter(p => p.status === 'sold').length
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
            <h1 className="text-3xl font-bold mb-2">Listings Hub</h1>
            <p className="text-muted-foreground">
              Manage property listings with AI-powered valuation and fraud detection
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{propertiesStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                </div>
                <Building className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{propertiesStats.draft}</p>
                  <p className="text-sm text-muted-foreground">Draft</p>
                </div>
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{propertiesStats.verified}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{propertiesStats.live}</p>
                  <p className="text-sm text-muted-foreground">Live</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{propertiesStats.sold}</p>
                  <p className="text-sm text-muted-foreground">Sold</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties by title or location..."
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
            <TabsTrigger value="all">All ({propertiesStats.total})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({propertiesStats.draft})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({propertiesStats.verified})</TabsTrigger>
            <TabsTrigger value="live">Live ({propertiesStats.live})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Properties Grid */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProperties.map((property) => {
                    const StatusIcon = getStatusIcon(property.status);
                    return (
                      <Card
                        key={property.id}
                        className={`glass-card border-0 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedProperty?.id === property.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedProperty(property)}
                      >
                        <CardContent className="p-4">
                          {/* Property Image Placeholder */}
                          <div className="aspect-video bg-muted/20 rounded-lg mb-4 flex items-center justify-center relative">
                            <Camera className="w-8 h-8 text-muted-foreground" />
                            {property.images.length > 1 && (
                              <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                                +{property.images.length}
                              </Badge>
                            )}
                          </div>

                          {/* Property Details */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                  <MapPin className="w-3 h-3" />
                                  <span>{property.location}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="ml-2">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(property.status)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {property.property_type}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-primary">
                                  {formatPrice(property.price)}
                                </span>
                                {property.valuation_score && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium">{property.valuation_score}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {property.bhk && (
                                  <span className="flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    {property.bhk} BHK
                                  </span>
                                )}
                                {property.area_sqft && (
                                  <span>{property.area_sqft} sq.ft</span>
                                )}
                              </div>
                            </div>

                            {property.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {property.description}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredProperties.length === 0 && (
                  <Card className="glass-card border-0">
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No properties found</p>
                        <Button>Add Your First Property</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Property Details Sidebar */}
              <div>
                {selectedProperty ? (
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle>Property Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{selectedProperty.title}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getStatusColor(selectedProperty.status)}>
                              {selectedProperty.status}
                            </Badge>
                            <Badge variant="outline">
                              {selectedProperty.property_type}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Price</p>
                            <p className="text-2xl font-bold text-primary">
                              {formatPrice(selectedProperty.price)}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {selectedProperty.bhk && (
                              <div>
                                <p className="text-sm font-medium mb-1">BHK</p>
                                <p className="text-sm text-muted-foreground">{selectedProperty.bhk} Bedroom</p>
                              </div>
                            )}
                            {selectedProperty.area_sqft && (
                              <div>
                                <p className="text-sm font-medium mb-1">Area</p>
                                <p className="text-sm text-muted-foreground">{selectedProperty.area_sqft} sq.ft</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Location</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {selectedProperty.location}
                            </p>
                            {selectedProperty.address && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedProperty.address}
                              </p>
                            )}
                          </div>

                          {selectedProperty.amenities.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Amenities</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedProperty.amenities.map((amenity, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {(selectedProperty.valuation_score || selectedProperty.fraud_score) && (
                            <div>
                              <p className="text-sm font-medium mb-2">AI Insights</p>
                              <div className="space-y-2">
                                {selectedProperty.valuation_score && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Valuation Score</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-muted rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full transition-all"
                                          style={{ width: `${selectedProperty.valuation_score}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium">{selectedProperty.valuation_score}</span>
                                    </div>
                                  </div>
                                )}
                                {selectedProperty.fraud_score && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Fraud Risk</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-muted rounded-full h-2">
                                        <div 
                                          className="bg-red-500 h-2 rounded-full transition-all"
                                          style={{ width: `${selectedProperty.fraud_score}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium">{selectedProperty.fraud_score}%</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedProperty.description && (
                            <div>
                              <p className="text-sm font-medium mb-1">Description</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedProperty.description}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 pt-4">
                          <Button size="sm" className="w-full">
                            <Eye className="w-3 h-3 mr-2" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Calendar className="w-3 h-3 mr-2" />
                            Schedule Visit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card border-0">
                    <CardContent className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Select a property to view details</p>
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