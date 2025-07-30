import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = 'https://lunivoice-userbackend-j71m.onrender.com';

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

      // Sync to backend
      const response = await fetch(`${BACKEND_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync with backend');
      }

      const backendUserData = await response.json();
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

      await fetch(`${BACKEND_URL}/api/clients/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          supabaseUserId: user.id,
          clients: clients || []
        })
      });
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

      await fetch(`${BACKEND_URL}/api/events/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          supabaseUserId: user.id,
          events: events || []
        })
      });
    } catch (error) {
      console.error('Events sync error:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    if (!user || !session) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/calendar/google/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          supabaseUserId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect Google Calendar');
      }

      const { authUrl } = await response.json();
      
      // Open Google OAuth in new window
      window.open(authUrl, 'google-calendar', 'width=500,height=600');
      
      return authUrl;
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
      const response = await fetch(`${BACKEND_URL}/api/calendar/events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const events = await response.json();
      
      // Sync events to Supabase
      for (const event of events) {
        await supabase
          .from('events')
          .upsert([{
            user_id: user.id,
            title: event.summary,
            description: event.description,
            start_time: event.start.dateTime,
            end_time: event.end.dateTime,
            google_calendar_id: event.id,
            event_type: 'meeting'
          }], {
            onConflict: 'google_calendar_id,user_id'
          });
      }

      return events;
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