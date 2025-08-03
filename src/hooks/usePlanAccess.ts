import { useAuth } from '@/components/AuthContext';

export type PlanTier = 'Starter' | 'Pro' | 'Business Pro' | null;

export interface PlanLimits {
  maxTriggers: number;
  maxBusinessNumbers: number;
  hasAssistantOrb: boolean;
  hasCRMAccess: boolean;
  hasCalendarIntegration: boolean;
  hasAutomationRules: boolean;
  hasVoiceCustomization: boolean;
  maxVoiceRenames: number;
  hasMultilingualVoices: boolean;
  hasNotificationSystem: boolean;
  hasWeeklyDigest: boolean;
  hasPrioritySupport: boolean;
  hasDashboardAccess: boolean;
  hasInboxAccess: boolean;
  monthlyMinutes: number;
  perMinuteCost: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'Starter': {
    maxTriggers: 1,
    maxBusinessNumbers: 0,
    hasAssistantOrb: false,
    hasCRMAccess: false,
    hasCalendarIntegration: false,
    hasAutomationRules: false,
    hasVoiceCustomization: false,
    maxVoiceRenames: 0,
    hasMultilingualVoices: false,
    hasNotificationSystem: false,
    hasWeeklyDigest: false,
    hasPrioritySupport: false,
    hasDashboardAccess: false,
    hasInboxAccess: false,
    monthlyMinutes: 150,
    perMinuteCost: 0.29
  },
  'Pro': {
    maxTriggers: 3,
    maxBusinessNumbers: 1,
    hasAssistantOrb: true,
    hasCRMAccess: true,
    hasCalendarIntegration: true,
    hasAutomationRules: true,
    hasVoiceCustomization: true,
    maxVoiceRenames: 1,
    hasMultilingualVoices: true,
    hasNotificationSystem: true,
    hasWeeklyDigest: true,
    hasPrioritySupport: false,
    hasDashboardAccess: true,
    hasInboxAccess: true,
    monthlyMinutes: 500,
    perMinuteCost: 0.29
  },
  'Business Pro': {
    maxTriggers: -1, // Unlimited
    maxBusinessNumbers: 2,
    hasAssistantOrb: true,
    hasCRMAccess: true,
    hasCalendarIntegration: true,
    hasAutomationRules: true,
    hasVoiceCustomization: true,
    maxVoiceRenames: 2,
    hasMultilingualVoices: true,
    hasNotificationSystem: true,
    hasWeeklyDigest: true,
    hasPrioritySupport: true,
    hasDashboardAccess: true,
    hasInboxAccess: true,
    monthlyMinutes: 700,
    perMinuteCost: 0.25
  }
};

export const usePlanAccess = () => {
  const { subscribed, subscriptionTier } = useAuth();

  const currentPlan = subscribed ? subscriptionTier as PlanTier : null;
  const planLimits = currentPlan ? PLAN_LIMITS[currentPlan] : PLAN_LIMITS['Starter'];

  const checkFeatureAccess = (feature: keyof PlanLimits): boolean => {
    if (!subscribed) return false;
    
    const limit = planLimits[feature];
    if (typeof limit === 'boolean') {
      return limit;
    }
    return true; // For numeric limits, just return true (specific checks handled separately)
  };

  const checkLimit = (feature: keyof PlanLimits, currentCount: number): boolean => {
    if (!subscribed) return false;
    
    const limit = planLimits[feature] as number;
    if (limit === -1) return true; // Unlimited
    return currentCount < limit;
  };

  const getFeatureLimit = (feature: keyof PlanLimits): number => {
    return planLimits[feature] as number;
  };

  const requiresUpgrade = (feature: keyof PlanLimits): boolean => {
    return !checkFeatureAccess(feature);
  };

  return {
    currentPlan,
    planLimits,
    subscribed,
    checkFeatureAccess,
    checkLimit,
    getFeatureLimit,
    requiresUpgrade,
    isStarter: currentPlan === 'Starter',
    isPro: currentPlan === 'Pro',
    isBusiness: currentPlan === 'Business Pro'
  };
};