import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { PricingCard } from '@/components/PricingCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const { user, session, subscribed, subscriptionTier, loading } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('paddle-checkout', {
        body: { plan },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      // Open Paddle checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('paddle-customer-portal', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      id: 'starter',
      title: 'Starter',
      price: '$59/mo',
      features: [
        { name: '150 min included ($0.29/add-on)', included: true },
        { name: '24/7 Call Answering', included: true },
        { name: 'AI Transcripts & Recordings', included: true },
        { name: 'Answer Basic Questions', included: true },
        { name: 'Dashboard Access', included: false },
        { name: 'Plan-A Assistant Orb', included: false },
        { name: 'CRM Access', included: false },
        { name: 'Calendar Integration + Smart Scheduling', included: false },
        { name: 'Call Logs & Summaries', included: true },
        { name: 'Triggers for Call Forwarding', included: true, note: '(1 Trigger)' },
        { name: 'Add Business Numbers', included: false },
        { name: 'Automation Rules', included: false },
        { name: 'Inbox / Voice Message Reply', included: false },
      ],
    },
    {
      id: 'pro',
      title: 'Pro',
      price: '$119/mo',
      isPopular: true,
      features: [
        { name: '500 min included ($0.29/add-on)', included: true },
        { name: '24/7 Call Answering', included: true },
        { name: 'AI Transcripts & Recordings', included: true },
        { name: 'Answer Basic Questions', included: true },
        { name: 'Dashboard Access', included: true },
        { name: 'Plan-A Assistant Orb', included: true },
        { name: 'CRM Access', included: true },
        { name: 'Calendar Integration + Smart Scheduling', included: true },
        { name: 'Call Logs & Summaries', included: true },
        { name: 'Triggers for Call Forwarding', included: true, note: '(Up to 3 Triggers)' },
        { name: 'Add Business Numbers', included: true, note: '(1 extra)' },
        { name: 'Automation Rules', included: true },
        { name: 'Inbox / Voice Message Reply', included: true },
        { name: 'Assistant Memory View/Edit', included: true },
        { name: 'Custom Voice / Personality', included: true, note: '(1 Rename/Month)' },
        { name: 'Multilingual Voice Options', included: true, note: '(4 Voices)' },
        { name: 'Notification System', included: true },
        { name: 'Weekly AI Digest + Insights', included: true },
      ],
    },
    {
      id: 'business',
      title: 'Business Pro',
      price: '$299/mo',
      features: [
        { name: '700 min included ($0.25/add-on)', included: true },
        { name: '24/7 Call Answering', included: true },
        { name: 'AI Transcripts & Recordings', included: true },
        { name: 'Answer Basic Questions', included: true },
        { name: 'Dashboard Access', included: true },
        { name: 'Plan-A Assistant Orb', included: true },
        { name: 'CRM Access', included: true },
        { name: 'Calendar Integration + Smart Scheduling', included: true },
        { name: 'Call Logs & Summaries', included: true },
        { name: 'Triggers for Call Forwarding', included: true, note: '(Unlimited Triggers)' },
        { name: 'Add Business Numbers', included: true, note: '(2 total)' },
        { name: 'Automation Rules', included: true },
        { name: 'Inbox / Voice Message Reply', included: true },
        { name: 'Assistant Memory View/Edit', included: true },
        { name: 'Custom Voice / Personality', included: true, note: '(2 Rename/Month)' },
        { name: 'Multilingual Voice Options', included: true, note: '(4 Voices)' },
        { name: 'Notification System', included: true },
        { name: 'Weekly AI Digest + Insights', included: true },
        { name: 'Priority Support', included: true },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Select the perfect plan for your business needs
          </p>
          {subscribed && (
            <div className="mt-4">
              <p className="text-success">
                Current Plan: {subscriptionTier}
              </p>
              <Button 
                onClick={handleManageSubscription}
                variant="outline"
                className="mt-2"
              >
                Manage Subscription
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              isPopular={plan.isPopular}
              isCurrentPlan={subscriptionTier === plan.title}
              onSelect={() => handleSubscribe(plan.id)}
              disabled={!user}
            />
          ))}
        </div>

        {!user && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Please sign in to subscribe to a plan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;