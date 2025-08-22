import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import Dashboard from "./pages/Dashboard";
import Company from "./pages/Company"; 
import Calendar from "./pages/Calendar";
import CRM from "./pages/CRM";
import Calls from "./pages/Calls";
import Analytics from "./pages/Analytics";
import Automation from "./pages/Automation";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ControlTower from "./pages/ControlTower";
import LeadsEngine from "./pages/LeadsEngine";
import ListingsHub from "./pages/ListingsHub";
import DealEngine from "./pages/DealEngine";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, show auth page
  if (!user) {
    return <Auth />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background">
            <SidebarTrigger className="ml-4" />
            <div className="ml-4">
              <span className="font-semibold">Darvera Control Tower</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/auth" element={<Navigate to="/control-tower" replace />} />
              <Route path="/" element={<Navigate to="/control-tower" replace />} />
              <Route path="/control-tower" element={<ControlTower />} />
              <Route path="/listings" element={<ListingsHub />} />
              <Route path="/deals" element={<DealEngine />} />
              <Route path="/leads" element={<LeadsEngine />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/company" element={<Company />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/calls" element={<Calls />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
