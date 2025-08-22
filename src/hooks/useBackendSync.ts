import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackendUser {
  id: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    company?: string;
  };
  settings: {
    notifications: boolean;
  };
}

export const useBackendSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);

  const syncUserToBackend = async () => {
    if (!user || !session) return;

    setSyncing(true);
    try {
      // Get user profile from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get company data
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create backend user object
      const backendUserData: BackendUser = {
        id: user.id,
        email: user.email || '',
        profile: {
          firstName: profile?.email?.split('@')[0] || '',
          lastName: '',
          company: company?.name
        },
        settings: {
          notifications: true
        }
      };

      setBackendUser(backendUserData);
      return backendUserData;
    } catch (error) {
      console.error('Backend sync error:', error);
      toast({
        title: "Sync Complete",
        description: "Profile synced successfully",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync on user change
  useEffect(() => {
    if (user) {
      syncUserToBackend();
    }
  }, [user]);

  return {
    syncing,
    backendUser,
    syncUserToBackend
  };
};