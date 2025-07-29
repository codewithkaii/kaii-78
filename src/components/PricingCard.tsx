import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  features: Array<{ name: string; included: boolean; note?: string }>;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  features,
  isPopular,
  isCurrentPlan,
  onSelect,
  disabled
}) => {
  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'border-success' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-success text-success-foreground">
          Current Plan
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="text-3xl font-bold text-primary">{price}</div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              {feature.included ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={feature.included ? '' : 'text-muted-foreground'}>
                {feature.name}
                {feature.note && <span className="text-sm text-muted-foreground"> {feature.note}</span>}
              </span>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={onSelect} 
          className="w-full"
          variant={isCurrentPlan ? "secondary" : "default"}
          disabled={disabled || isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : "Choose Plan"}
        </Button>
      </CardContent>
    </Card>
  );
};