import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Email notification function started");

    const { type, userId, data } = await req.json();
    logStep("Request received", { type, userId });

    // Get user email
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .single();

    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) {
      throw new Error('User not found or email not available');
    }

    const userEmail = userData.user.email;
    const userName = userProfile?.first_name || 'User';
    logStep("User data retrieved", { email: userEmail, name: userName });

    let emailContent = {};

    switch (type) {
      case 'missed_call':
        emailContent = {
          subject: '📞 Missed Call Alert - LuniVoice',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                📞 Missed Call Alert
              </h2>
              <p>Hi ${userName},</p>
              <p>You received a missed call:</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>From:</strong> ${data.from}<br>
                <strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}<br>
                <strong>Duration:</strong> ${data.duration || 'N/A'}
              </div>
              <p>You can listen to the recording and view the transcript in your LuniVoice dashboard.</p>
              <a href="https://yourapp.com/calls" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
                View Call Details
              </a>
              <p>Best regards,<br>Your LuniVoice Team</p>
            </div>
          `
        };
        break;

      case 'weekly_digest':
        emailContent = {
          subject: '📊 Your Weekly Business Digest - LuniVoice',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                📊 Weekly Business Digest
              </h2>
              <p>Hi ${userName},</p>
              <p>Here's your weekly business summary:</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0;">This Week's Stats</h3>
                <p><strong>Total Calls:</strong> ${data.totalCalls || 0}</p>
                <p><strong>Call Duration:</strong> ${data.totalDuration || '0 min'}</p>
                <p><strong>New Clients:</strong> ${data.newClients || 0}</p>
                <p><strong>Appointments Scheduled:</strong> ${data.appointments || 0}</p>
              </div>
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0;">💡 AI Insights</h3>
                <p>${data.insights || 'Your business is performing well! Keep up the great work.'}</p>
              </div>
              <a href="https://yourapp.com/analytics" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
                View Full Analytics
              </a>
              <p>Best regards,<br>Your LuniVoice Team</p>
            </div>
          `
        };
        break;

      case 'subscription_confirmation':
        emailContent = {
          subject: '🎉 Welcome to LuniVoice - Subscription Confirmed!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
                🎉 Welcome to LuniVoice!
              </h2>
              <p>Hi ${userName},</p>
              <p>Your subscription has been confirmed! Welcome to the LuniVoice family.</p>
              <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
                <h3 style="margin-top: 0;">Your Plan: ${data.plan || 'Pro'}</h3>
                <p>Your AI phone assistant is now active and ready to handle your calls 24/7.</p>
              </div>
              <div style="margin: 20px 0;">
                <h3>Next Steps:</h3>
                <ol>
                  <li>Set up your business phone number</li>
                  <li>Customize your AI assistant</li>
                  <li>Connect your calendar</li>
                  <li>Add your first clients</li>
                </ol>
              </div>
              <a href="https://yourapp.com/dashboard" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
                Get Started
              </a>
              <p>If you need any help, our support team is here for you!</p>
              <p>Best regards,<br>Your LuniVoice Team</p>
            </div>
          `
        };
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emailResult = await resend.emails.send({
      from: "LuniVoice <notifications@yourdomain.com>",
      to: [userEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    logStep("Email sent successfully", emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResult.data?.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-notification", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});