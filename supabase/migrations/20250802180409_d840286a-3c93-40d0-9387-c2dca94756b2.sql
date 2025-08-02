-- Enable RLS on existing tables
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create policies for call_logs
CREATE POLICY "Users can view their own call logs" 
ON public.call_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call logs" 
ON public.call_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own call logs" 
ON public.call_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user_phone_numbers
CREATE POLICY "Users can view their own phone numbers" 
ON public.user_phone_numbers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone numbers" 
ON public.user_phone_numbers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers" 
ON public.user_phone_numbers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable realtime for call_logs
ALTER TABLE public.call_logs REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.call_logs;