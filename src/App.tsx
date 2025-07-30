import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/AuthContext";
import Dashboard from "./pages/Dashboard";
import Company from "./pages/Company";
import Calendar from "./pages/Calendar";
import CRM from "./pages/CRM";
import Calls from "./pages/Calls";
import Analytics from "./pages/Analytics";
import Automation from "./pages/Automation";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-12 flex items-center border-b bg-background">
                  <SidebarTrigger className="ml-4" />
                  <div className="ml-4">
                    <span className="font-semibold">Lunivoice Dashboard</span>
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/company" element={<Company />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/calls" element={<Calls />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/automation" element={<Automation />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
