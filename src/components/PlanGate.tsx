import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlanAccess } from '@/hooks/usePlanAccess';

interface PlanGateProps {
  feature: string;
  requiredPlan: 'Pro' | 'Business Pro';
  children: React.ReactNode;
  showUpgrade?: boolean;
}

export const PlanGate: React.FC<PlanGateProps> = ({ 
  feature, 
  requiredPlan, 
  children, 
  showUpgrade = true 
}) => {
  const { subscribed, currentPlan } = usePlanAccess();
  const navigate = useNavigate();

  const hasAccess = subscribed && (
    (requiredPlan === 'Pro' && (currentPlan === 'Pro' || currentPlan === 'Business Pro')) ||
    (requiredPlan === 'Business Pro' && currentPlan === 'Business Pro')
  );

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const getIcon = () => {
    switch (requiredPlan) {
      case 'Pro':
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 'Business Pro':
        return <Zap className="w-8 h-8 text-purple-500" />;
      default:
        return <Lock className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/30">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {getIcon()}
        </div>
        <CardTitle className="text-lg">
          {requiredPlan} Feature
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {feature} is available with the {requiredPlan} plan or higher.
        </p>
        <div className="space-y-2">
          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full"
          >
            Upgrade to {requiredPlan}
          </Button>
          {!subscribed && (
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              className="w-full"
            >
              Sign In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};