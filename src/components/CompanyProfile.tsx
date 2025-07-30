import { useState, useEffect } from "react";
import { Building2, Globe, Upload, FileText, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";

interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string;
}

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  description: string;
  created_at: string;
}

export default function CompanyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    description: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    if (user) {
      fetchCompanyData();
      fetchDocuments();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCompany(data);
        setFormData(data);
      } else {
        setIsEditing(true); // Show form if no company exists
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: "Error",
        description: "Failed to load company data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const companyData = {
        ...formData,
        user_id: user.id
      };

      if (company?.id) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', company.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('companies')
          .insert([companyData])
          .select()
          .single();

        if (error) throw error;
        setCompany(data);
      }

      toast({
        title: "Success",
        description: "Company profile saved successfully"
      });
      setIsEditing(false);
      fetchCompanyData();
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: "Failed to save company profile",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          user_id: user.id,
          company_id: company?.id,
          name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          description: ""
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId: string, filePath: string) => {
    try {
      // Extract file path from URL
      const urlParts = filePath.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userFolder = urlParts[urlParts.length - 2];
      const filePathInStorage = `${userFolder}/${fileName}`;

      await supabase.storage
        .from('documents')
        .remove([filePathInStorage]);

      await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
          <p className="text-muted-foreground">Manage your business information and documents</p>
        </div>
        {!isEditing && company && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="Technology, Healthcare, etc."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your business..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="contact@yourcompany.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Company address..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save Profile</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : company ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{company.name}</h3>
                  {company.industry && <Badge variant="outline">{company.industry}</Badge>}
                </div>
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline">
                      {company.website}
                    </a>
                  </div>
                )}
                {company.description && (
                  <p className="text-muted-foreground">{company.description}</p>
                )}
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {company.phone && <div><strong>Phone:</strong> {company.phone}</div>}
                  {company.email && <div><strong>Email:</strong> {company.email}</div>}
                  {company.address && <div><strong>Address:</strong> {company.address}</div>}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No company profile found</p>
                <Button onClick={() => setIsEditing(true)}>Create Company Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload documents"}
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Label>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()} • 
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteDocument(doc.id, doc.file_url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No documents uploaded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}