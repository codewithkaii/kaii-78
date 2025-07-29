import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionSuccess = () => {
  const { refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh subscription status after successful payment
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>
          <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for subscribing to LuniVoice. Your subscription is now active.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate('/pricing')} variant="outline" className="w-full">
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;