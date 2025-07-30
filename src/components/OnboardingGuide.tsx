import { useState, useEffect } from "react";
import { CheckCircle, Circle, Building2, Users, Calendar, FileText, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  action: string;
  route?: string;
}

interface OnboardingGuideProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export default function OnboardingGuide({ onClose, onNavigate }: OnboardingGuideProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      // Check company profile
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      // Check clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      // Check events
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      // Check documents
      const { data: documents } = await supabase
        .from('documents')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      const onboardingSteps: OnboardingStep[] = [
        {
          id: 'company',
          title: 'Set up your company profile',
          description: 'Add your business information, website, and contact details',
          icon: Building2,
          completed: !!company,
          action: 'Create Company Profile',
          route: '/company'
        },
        {
          id: 'clients',
          title: 'Add your first client',
          description: 'Import or add client information to your CRM',
          icon: Users,
          completed: !!(clients && clients.length > 0),
          action: 'Add Client',
          route: '/crm'
        },
        {
          id: 'calendar',
          title: 'Connect your calendar',
          description: 'Sync with Google Calendar to manage appointments',
          icon: Calendar,
          completed: false, // Will be updated when Google Calendar is connected
          action: 'Connect Calendar',
          route: '/calendar'
        },
        {
          id: 'documents',
          title: 'Upload business documents',
          description: 'Add important documents like contracts, invoices, etc.',
          icon: FileText,
          completed: !!(documents && documents.length > 0),
          action: 'Upload Documents',
          route: '/company'
        }
      ];

      setSteps(onboardingSteps);
      
      // Find first incomplete step
      const firstIncomplete = onboardingSteps.findIndex(step => !step.completed);
      setCurrentStep(firstIncomplete === -1 ? 0 : firstIncomplete);
      
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const handleStepAction = (step: OnboardingStep) => {
    if (step.route) {
      onNavigate(step.route);
      onClose();
    }
  };

  const completeOnboarding = async () => {
    try {
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user?.id);

      toast({
        title: "Welcome to LuniVoice!",
        description: "Your onboarding is complete. You're ready to get started!"
      });
      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Welcome to LuniVoice! 🎉</CardTitle>
              <p className="text-muted-foreground mt-1">
                Let's get you set up in just a few steps
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps} of {totalSteps} completed
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border transition-all ${
                  step.completed 
                    ? 'bg-primary/5 border-primary/20' 
                    : index === currentStep 
                    ? 'bg-accent/50 border-accent' 
                    : 'bg-muted/20 border-muted'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {step.completed ? (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <step.icon className="w-5 h-5" />
                          {step.title}
                          {step.completed && (
                            <Badge variant="secondary" className="text-xs">
                              Completed
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                      
                      {!step.completed && (
                        <Button
                          size="sm"
                          onClick={() => handleStepAction(step)}
                          className="ml-4"
                        >
                          {step.action}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Start Tips */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">💡 Quick Start Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with your company profile to personalize your experience</li>
                <li>• Add a few key clients to test the CRM features</li>
                <li>• Connect Google Calendar to sync your appointments automatically</li>
                <li>• Upload important documents for easy access and organization</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Skip for now
            </Button>
            
            <div className="flex gap-2">
              {completedSteps === totalSteps ? (
                <Button onClick={completeOnboarding} className="bg-primary">
                  Complete Setup 🎉
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const nextIncompleteStep = steps.find(step => !step.completed);
                    if (nextIncompleteStep) {
                      handleStepAction(nextIncompleteStep);
                    }
                  }}
                >
                  Continue Setup
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}