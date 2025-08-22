import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, CheckCircle } from "lucide-react";

interface OnboardingGuideProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export default function OnboardingGuide({ onClose, onNavigate }: OnboardingGuideProps) {
  const steps = [
    {
      title: "Welcome to Darvera Real Estate",
      description: "Your AI-powered real estate control tower is ready",
      action: "Get Started",
      route: "/control-tower"
    },
    {
      title: "Explore Leads Engine", 
      description: "Manage and track all your property leads",
      action: "View Leads",
      route: "/leads"
    },
    {
      title: "Check Listings Hub",
      description: "Manage property listings and inventory",
      action: "View Listings", 
      route: "/listings"
    },
    {
      title: "Setup Company Profile",
      description: "Add your business information",
      action: "Setup Profile",
      route: "/company"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Welcome to Darvera! 🏠</CardTitle>
              <p className="text-muted-foreground mt-1">
                Your AI-powered real estate platform is ready
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    onNavigate(step.route);
                    onClose();
                  }}
                >
                  {step.action}
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Start Exploring
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}