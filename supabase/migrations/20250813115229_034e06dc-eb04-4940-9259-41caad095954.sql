-- Create call logs table for tracking all calls
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  caller_number TEXT,
  call_direction TEXT NOT NULL CHECK (call_direction IN ('inbound', 'outbound')),
  call_status TEXT NOT NULL CHECK (call_status IN ('completed', 'busy', 'no-answer', 'failed', 'in-progress')),
  duration INTEGER DEFAULT 0,
  recording_url TEXT,
  transcript TEXT,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user phone numbers table
CREATE TABLE public.user_phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  twilio_sid TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation rules table
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time_based', 'keyword_based', 'caller_based')),
  trigger_condition JSONB NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('forward_call', 'send_message', 'create_event')),
  action_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice messages table for inbox
CREATE TABLE public.voice_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  caller_number TEXT NOT NULL,
  recording_url TEXT NOT NULL,
  transcript TEXT,
  ai_response TEXT,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('call_missed', 'voice_message', 'weekly_digest', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice settings table
CREATE TABLE public.voice_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  voice_id TEXT NOT NULL DEFAULT '9BWtsMINqrJLrRacOk9x',
  voice_name TEXT DEFAULT 'Aria',
  personality_prompt TEXT,
  language TEXT DEFAULT 'en',
  renames_used INTEGER DEFAULT 0,
  max_renames INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for call_logs
CREATE POLICY "Users can view their own call logs" ON public.call_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own call logs" ON public.call_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own call logs" ON public.call_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own call logs" ON public.call_logs FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_phone_numbers
CREATE POLICY "Users can view their own phone numbers" ON public.user_phone_numbers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own phone numbers" ON public.user_phone_numbers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own phone numbers" ON public.user_phone_numbers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own phone numbers" ON public.user_phone_numbers FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for automation_rules
CREATE POLICY "Users can view their own automation rules" ON public.automation_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own automation rules" ON public.automation_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own automation rules" ON public.automation_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own automation rules" ON public.automation_rules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for voice_messages
CREATE POLICY "Users can view their own voice messages" ON public.voice_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own voice messages" ON public.voice_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own voice messages" ON public.voice_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own voice messages" ON public.voice_messages FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for voice_settings
CREATE POLICY "Users can view their own voice settings" ON public.voice_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own voice settings" ON public.voice_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own voice settings" ON public.voice_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON public.call_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_phone_numbers_updated_at BEFORE UPDATE ON public.user_phone_numbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_voice_messages_updated_at BEFORE UPDATE ON public.voice_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_voice_settings_updated_at BEFORE UPDATE ON public.voice_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create voice settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_voice_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.voice_settings (user_id, voice_id, voice_name, personality_prompt)
  VALUES (
    NEW.user_id,
    '9BWtsMINqrJLrRacOk9x',
    'Aria',
    'You are a helpful and professional AI assistant. Respond in a friendly but concise manner.'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create voice settings when user profile is created
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_voice_settings();