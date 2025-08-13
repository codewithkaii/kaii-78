import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface BusinessHour {
  id?: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

const DAYS = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export default function BusinessHours() {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBusinessHours();
    }
  }, [user]);

  const fetchBusinessHours = async () => {
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('user_id', user?.id)
        .order('day_of_week');

      if (error) throw error;

      // Initialize with default hours if none exist
      const defaultHours = DAYS.map((_, index) => ({
        day_of_week: index,
        is_open: index >= 1 && index <= 5, // Monday to Friday open by default
        open_time: '09:00',
        close_time: '17:00'
      }));

      if (data && data.length > 0) {
        const existingHours = data.map(hour => ({
          id: hour.id,
          day_of_week: parseInt(hour.day_of_week),
          is_open: hour.is_open,
          open_time: hour.open_time || '09:00',
          close_time: hour.close_time || '17:00'
        }));
        setBusinessHours(existingHours);
      } else {
        setBusinessHours(defaultHours);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load business hours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessHour = (dayIndex: number, field: keyof BusinessHour, value: any) => {
    setBusinessHours(prev => prev.map(hour => 
      hour.day_of_week === dayIndex 
        ? { ...hour, [field]: value }
        : hour
    ));
  };

  const saveBusinessHours = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Delete existing hours first
      await supabase
        .from('business_hours')
        .delete()
        .eq('user_id', user.id);

      // Insert new hours
      const hoursToInsert = businessHours.map(hour => ({
        user_id: user.id,
        day_of_week: hour.day_of_week.toString(),
        is_open: hour.is_open,
        open_time: hour.is_open ? hour.open_time : null,
        close_time: hour.is_open ? hour.close_time : null
      }));

      const { error } = await supabase
        .from('business_hours')
        .insert(hoursToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business hours saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save business hours",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>
          Set your business operating hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {businessHours.map((hour, index) => (
          <div key={hour.day_of_week} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="w-24 font-medium">
              {DAYS[hour.day_of_week]}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={hour.is_open}
                onCheckedChange={(checked) => 
                  updateBusinessHour(hour.day_of_week, 'is_open', checked)
                }
              />
              <Label className="text-sm">Open</Label>
            </div>

            {hour.is_open && (
              <>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">From:</Label>
                  <Input
                    type="time"
                    value={hour.open_time}
                    onChange={(e) => 
                      updateBusinessHour(hour.day_of_week, 'open_time', e.target.value)
                    }
                    className="w-32"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">To:</Label>
                  <Input
                    type="time"
                    value={hour.close_time}
                    onChange={(e) => 
                      updateBusinessHour(hour.day_of_week, 'close_time', e.target.value)
                    }
                    className="w-32"
                  />
                </div>
              </>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button onClick={saveBusinessHours} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Business Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}