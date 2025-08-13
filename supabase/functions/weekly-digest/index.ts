import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEEKLY-DIGEST] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting weekly digest generation");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all users with Business Pro subscriptions
    const { data: businessUsers } = await supabaseClient
      .from("user_profiles")
      .select("user_id")
      .eq("subscription_tier", "Business Pro");

    if (!businessUsers || businessUsers.length === 0) {
      logStep("No Business Pro users found");
      return new Response(JSON.stringify({ message: "No Business Pro users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep(`Processing ${businessUsers.length} Business Pro users`);

    for (const user of businessUsers) {
      await generateWeeklyDigest(supabaseClient, user.user_id);
    }

    return new Response(
      JSON.stringify({ message: `Weekly digest generated for ${businessUsers.length} users` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function generateWeeklyDigest(supabaseClient: any, userId: string) {
  try {
    logStep("Generating digest for user", { userId });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    // Get call statistics for the past week
    const { data: callStats } = await supabaseClient
      .from("call_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", oneWeekAgoISO);

    // Get voice messages for the past week
    const { data: voiceMessages } = await supabaseClient
      .from("voice_messages")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", oneWeekAgoISO);

    // Calculate metrics
    const totalCalls = callStats?.length || 0;
    const completedCalls = callStats?.filter(call => call.call_status === "completed").length || 0;
    const missedCalls = callStats?.filter(call => call.call_status === "no-answer").length || 0;
    const totalMinutes = callStats?.reduce((sum, call) => sum + (call.duration || 0), 0) || 0;
    const avgCallDuration = totalCalls > 0 ? Math.round(totalMinutes / totalCalls) : 0;
    
    const totalVoiceMessages = voiceMessages?.length || 0;
    const repliedMessages = voiceMessages?.filter(msg => msg.replied_at).length || 0;

    // Generate AI insights
    const insights = await generateAIInsights(callStats || [], voiceMessages || []);

    // Create digest content
    const digestTitle = `Weekly Call Summary - ${new Date().toLocaleDateString()}`;
    const digestMessage = `
📊 This Week's Call Activity:

📞 Total Calls: ${totalCalls}
✅ Completed: ${completedCalls}
❌ Missed: ${missedCalls}
⏱️ Total Minutes: ${Math.round(totalMinutes / 60)} hours ${totalMinutes % 60} minutes
📈 Average Call: ${Math.floor(avgCallDuration / 60)}:${(avgCallDuration % 60).toString().padStart(2, '0')}

💬 Voice Messages: ${totalVoiceMessages}
↩️ Replied: ${repliedMessages}

🤖 AI Insights:
${insights}

Keep up the great work! Your AI assistant is helping you stay connected with your customers.
    `;

    // Store the digest as a notification
    await supabaseClient
      .from("notifications")
      .insert({
        user_id: userId,
        type: "weekly_digest",
        title: digestTitle,
        message: digestMessage,
        data: {
          totalCalls,
          completedCalls,
          missedCalls,
          totalMinutes,
          avgCallDuration,
          totalVoiceMessages,
          repliedMessages,
          insights
        }
      });

    logStep("Weekly digest created", { userId, totalCalls, totalVoiceMessages });
  } catch (error) {
    logStep("Error generating digest for user", { userId, error: error.message });
  }
}

async function generateAIInsights(calls: any[], messages: any[]) {
  try {
    // Simple pattern-based insights
    const insights: string[] = [];

    if (calls.length > 0) {
      const missedRate = calls.filter(c => c.call_status === "no-answer").length / calls.length;
      if (missedRate > 0.3) {
        insights.push("• Consider extending business hours or setting up better call forwarding");
      }

      const busyDays = calls.reduce((acc, call) => {
        const day = new Date(call.created_at).getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      
      const busiestDay = Object.entries(busyDays).reduce((a, b) => busyDays[a[0]] > busyDays[b[0]] ? a : b);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      insights.push(`• ${dayNames[parseInt(busiestDay[0])]} was your busiest call day`);
    }

    if (messages.length > 0) {
      const replyRate = messages.filter(m => m.replied_at).length / messages.length;
      if (replyRate < 0.5) {
        insights.push("• Response rate could be improved - consider setting up automated replies");
      } else {
        insights.push("• Great job maintaining quick response times to voice messages!");
      }
    }

    if (insights.length === 0) {
      insights.push("• Your call management system is running smoothly!");
    }

    return insights.join("\n");
  } catch (error) {
    return "• Unable to generate insights at this time";
  }
}