import CompanyProfile from "@/components/CompanyProfile";
import { useAuth } from "@/components/AuthContext";
import AuthRequired from "@/components/AuthRequired";

export default function Company() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthRequired 
        title="Company Profile Access Required"
        description="Please sign in to manage your company profile, business hours, and AI assistant settings."
      />
    );
  }

  return <CompanyProfile />;
}