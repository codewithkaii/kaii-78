import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Use native Supabase edge functions instead of external backend

interface BackendUser {
  id: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    company?: string;
  };
  settings: {
    googleCalendarConnected: boolean;
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
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get company data
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Use native Supabase edge function instead of external backend
      const response = await supabase.functions.invoke('user-sync', {
        body: {
          supabaseUserId: user.id,
          email: user.email,
          profile: {
            firstName: profile?.first_name,
            lastName: profile?.last_name,
            company: company?.name
          },
          settings: {
            googleCalendarConnected: profile?.google_calendar_connected || false,
            notifications: true
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to sync with backend');
      }

      const backendUserData = response.data;
      setBackendUser(backendUserData);

      // Update backend_user_id in Supabase if not set
      if (!profile?.backend_user_id) {
        await supabase
          .from('user_profiles')
          .update({ backend_user_id: backendUserData.id })
          .eq('user_id', user.id);
      }

      return backendUserData;
    } catch (error) {
      console.error('Backend sync error:', error);
      toast({
        title: "Sync Warning",
        description: "Unable to sync with backend services. Some features may be limited.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const syncClientsToBackend = async () => {
    if (!user || !session) return;

    try {
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id);

      // Note: For now, clients are managed entirely in Supabase
      // If needed, we can add a client-sync edge function later
      console.log('Clients are managed in Supabase - no external sync needed');
    } catch (error) {
      console.error('Client sync error:', error);
    }
  };

  const syncEventsToBackend = async () => {
    if (!user || !session) return;

    try {
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id);

      // Note: For now, events are managed entirely in Supabase
      // If needed, we can add an events-sync edge function later
      console.log('Events are managed in Supabase - no external sync needed');
    } catch (error) {
      console.error('Events sync error:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    if (!user || !session) return;

    try {
      // Use native Google Calendar integration through Supabase
      // For now, direct users to manually connect via Google OAuth
      toast({
        title: "Google Calendar",
        description: "Please use the Settings page to connect your Google Calendar directly.",
      });
      
      return null;
    } catch (error) {
      console.error('Google Calendar connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive"
      });
    }
  };

  const fetchGoogleCalendarEvents = async () => {
    if (!user || !session) return;

    try {
      // For now, events are managed directly in Supabase
      // Future enhancement: Add Google Calendar sync edge function
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      return events || [];
    } catch (error) {
      console.error('Fetch calendar events error:', error);
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
    syncUserToBackend,
    syncClientsToBackend,
    syncEventsToBackend,
    connectGoogleCalendar,
    fetchGoogleCalendarEvents
  };
};