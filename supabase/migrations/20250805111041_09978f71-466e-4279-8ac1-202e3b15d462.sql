-- Add business hours table
CREATE TABLE public.business_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    is_open boolean NOT NULL DEFAULT true,
    open_time time,
    close_time time,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Create policies for business hours
CREATE POLICY "Users can view their own business hours"
ON public.business_hours
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own business hours"
ON public.business_hours
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own business hours"
ON public.business_hours
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own business hours"
ON public.business_hours
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_business_hours_updated_at
BEFORE UPDATE ON public.business_hours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();