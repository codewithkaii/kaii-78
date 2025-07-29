import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, subscribed, subscriptionTier, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">LuniVoice Dashboard</h1>
            <p className="text-muted-foreground">
              {user ? `Welcome back, ${user.email}` : "Welcome to LuniVoice"}
              {subscribed && (
                <span className="ml-2 text-success">• {subscriptionTier} Plan</span>
              )}
            </p>
          </div>
          <div className="space-x-2">
            {user ? (
              <>
                <Button onClick={() => navigate('/pricing')} variant="outline">
                  {subscribed ? 'Manage Plan' : 'Subscribe'}
                </Button>
                <Button onClick={signOut} variant="secondary">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/auth')} variant="outline">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/pricing')}>
                  View Pricing
                </Button>
              </>
            )}
          </div>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CryptoChart />
          </div>
          <div>
            <PortfolioCard />
          </div>
        </div>
        
        <CryptoList />
      </div>
    </div>
  );
};

export default Index;