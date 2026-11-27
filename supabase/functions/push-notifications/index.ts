import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0.5.0";

type NotificationRecord = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
};

type DatabaseWebhook = {
  type: string;
  table: string;
  schema: string;
  record: NotificationRecord;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (request) => {
  console.log("push-notifications handler started", { method: request.method });
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  const webhookSecret = Deno.env.get("PUSH_WEBHOOK_SECRET");
  const expectedAuthorization = webhookSecret ? `Bearer ${webhookSecret}` : "";
  if (!expectedAuthorization || request.headers.get("authorization") !== expectedAuthorization) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const exportedVapidKeys = Deno.env.get("VAPID_KEYS_JSON");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!exportedVapidKeys || !supabaseUrl || !serviceRoleKey) {
    console.error("Push configuration missing", {
      hasVapidKeys: Boolean(exportedVapidKeys),
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
    });
    return Response.json({ error: "Push delivery is not configured" }, { status: 500, headers: corsHeaders });
  }

  let payload: DatabaseWebhook;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders });
  }
  if (payload.schema !== "public" || payload.table !== "notifications" || payload.type !== "INSERT" || !payload.record?.user_id) {
    return Response.json({ ignored: true }, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", payload.record.user_id);
  if (error) {
    console.error("Could not load push subscriptions", { code: error.code, message: error.message });
    return Response.json({ error: "Could not load subscriptions" }, { status: 500, headers: corsHeaders });
  }
  if (!subscriptions?.length) return Response.json({ sent: 0 }, { headers: corsHeaders });

  let vapidKeys: CryptoKeyPair;
  try {
    vapidKeys = await webpush.importVapidKeys(JSON.parse(exportedVapidKeys), { extractable: false });
  } catch (error) {
    console.error("VAPID keys could not be imported", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "VAPID keys are invalid" }, { status: 500, headers: corsHeaders });
  }
  const appServer = await webpush.ApplicationServer.new({
    contactInformation: Deno.env.get("VAPID_CONTACT") || "https://vetbox.pages.dev",
    vapidKeys,
  });
  const notification = payload.record;
  const url = notification.link?.startsWith("/") && !notification.link.startsWith("//") ? notification.link : "/";
  const body = JSON.stringify({ id: notification.id, title: notification.title, body: notification.message, url });

  const results = await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await appServer.subscribe({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      }).pushTextMessage(body, { ttl: 60, urgency: webpush.Urgency.High });
      return true;
    } catch (error) {
      const statusCode = error instanceof webpush.PushMessageError ? error.response.status : 0;
      console.error("Push delivery failed", {
        statusCode,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
      }
      throw error;
    }
  }));

  const sent = results.filter((result) => result.status === "fulfilled").length;
  console.log("Push delivery completed", { sent, failed: results.length - sent });
  return Response.json({ sent, failed: results.length - sent }, { headers: corsHeaders });
});
