import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server configuration is incomplete" }, 500);

  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await service.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Invalid session" }, 401);

  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("id, role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Application profile lookup failed", {
      code: profileError.code,
      message: profileError.message,
    });
    return json({ error: `Could not read public.profiles: ${profileError.message} (${profileError.code || "database error"})` }, 500);
  }
  if (!profile) {
    console.warn("Authenticated account has no public profile");
    const signedInIdentity = authData.user.email || authData.user.id;
    return json({ error: `No public.profiles row exists for the signed-in account (${signedInIdentity}). The account profile must be repaired before this action can run.` }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  if (body.action === "list_users") {
    if (profile.role !== "admin") return json({ error: "Administrator access required" }, 403);

    const authUsers = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return json({ error: `Could not load Auth users: ${error.message}` }, 500);
      authUsers.push(...data.users);
      if (data.users.length < 1000) break;
    }

    const { data: profiles, error: profilesError } = await service.from("profiles").select("*");
    if (profilesError) return json({ error: `Could not load profiles: ${profilesError.message} (${profilesError.code || "database error"})` }, 500);
    const profileById = new Map((profiles || []).map((row) => [row.id, row]));
    const ownerIds = (profiles || []).filter((row) => row.role === "owner").map((row) => row.id);
    let petsByOwner = new Map<string, Array<Record<string, unknown>>>();
    if (ownerIds.length) {
      const { data: pets, error: petsError } = await service
        .from("pets")
        .select("id, owner_id, name, species, breed, created_at")
        .in("owner_id", ownerIds);
      if (petsError) return json({ error: `Could not load owner pets: ${petsError.message}` }, 500);
      for (const pet of pets || []) petsByOwner.set(pet.owner_id, [...(petsByOwner.get(pet.owner_id) || []), pet]);
    }
    const veterinarianIds = (profiles || []).filter((row) => row.role === "veterinarian").map((row) => row.id);
    let veterinarianById = new Map<string, Record<string, unknown>>();
    if (veterinarianIds.length) {
      const { data: veterinarians, error: veterinariansError } = await service
        .from("veterinarian_profiles")
        .select("id, license_number, years_of_experience, specializations, education, clinic_affiliation_name, consultation_fee, verification_status")
        .in("id", veterinarianIds);
      if (veterinariansError) return json({ error: `Could not load veterinarian details: ${veterinariansError.message}` }, 500);
      veterinarianById = new Map((veterinarians || []).map((row) => [row.id, row]));
    }

    return json({ users: authUsers.map((authUser) => ({
      id: authUser.id,
      email: authUser.email || "",
      auth_phone: authUser.phone || "",
      email_confirmed_at: authUser.email_confirmed_at,
      last_sign_in_at: authUser.last_sign_in_at,
      auth_created_at: authUser.created_at,
      profile: profileById.get(authUser.id) || null,
      veterinarian: veterinarianById.get(authUser.id) || null,
      pets: petsByOwner.get(authUser.id) || [],
    })) });
  }

  if (body.action === "set_password") {
    if (profile.role !== "admin") return json({ error: "Administrator access required" }, 403);
    const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!targetUserId || password.length < 8) {
      return json({ error: "Choose a user and enter a password of at least 8 characters" }, 400);
    }
    const { error } = await service.auth.admin.updateUserById(targetUserId, { password });
    if (error) return json({ error: error.message }, 400);
    await service.from("audit_logs").insert({
      user_id: authData.user.id,
      action: "ADMIN_PASSWORD_CHANGED",
      resource_type: "user",
      resource_id: targetUserId,
      metadata: {},
    });
    return json({ success: true });
  }

  if (body.action === "send_notification") {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const audience = body.audience === "user" ? "user" : body.audience === "all" ? "all" : "";
    const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : "";
    if (!title || title.length > 120 || !message || message.length > 2000 || !audience) {
      return json({ error: "Enter a title (up to 120 characters), a message (up to 2000 characters), and a valid audience" }, 400);
    }
    if (audience === "user" && !targetUserId) return json({ error: "Choose a recipient" }, 400);

    let recipients: string[] = [];
    const recipientRoles = new Map<string, string>();
    if (profile.role === "admin") {
      if (audience === "all") {
        const { data, error } = await service.from("profiles").select("id, role");
        if (error) return json({ error: error.message }, 500);
        recipients = (data || []).map((row) => row.id);
        for (const row of data || []) recipientRoles.set(row.id, row.role);
      } else {
        const { data, error } = await service.from("profiles").select("id, role").eq("id", targetUserId).maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Recipient not found" }, 404);
        recipients = [data.id];
        recipientRoles.set(data.id, data.role);
      }
    } else if (profile.role === "veterinarian") {
      const { data: vetProfile, error: vetProfileError } = await service
        .from("veterinarian_profiles")
        .select("verification_status")
        .eq("id", authData.user.id)
        .maybeSingle();
      if (vetProfileError) return json({ error: vetProfileError.message }, 500);
      if (vetProfile?.verification_status !== "verified") return json({ error: "Verified veterinarian access required" }, 403);
      const { data: links, error: linksError } = await service
        .from("pet_vet_links")
        .select("pet_id")
        .eq("vet_id", authData.user.id)
        .eq("status", "accepted");
      if (linksError) return json({ error: linksError.message }, 500);
      const petIds = [...new Set((links || []).map((link) => link.pet_id))];
      if (petIds.length) {
        const { data: pets, error: petsError } = await service.from("pets").select("owner_id").in("id", petIds);
        if (petsError) return json({ error: petsError.message }, 500);
        recipients = [...new Set((pets || []).map((pet) => pet.owner_id))];
        for (const ownerId of recipients) recipientRoles.set(ownerId, "owner");
      }
      if (audience === "user") {
        if (!recipients.includes(targetUserId)) return json({ error: "You can notify only an owner with an accepted connection" }, 403);
        recipients = [targetUserId];
      }
    } else {
      return json({ error: "Only administrators and veterinarians can send platform notifications" }, 403);
    }

    if (!recipients.length) return json({ error: "No eligible recipients were found" }, 404);
    const rows = recipients.map((userId) => ({
      user_id: userId,
      title,
      message,
      type: "system",
      link: recipientRoles.get(userId) === "owner" ? "/owner/notifications"
        : recipientRoles.get(userId) === "veterinarian" ? "/veterinarian/dashboard" : "/admin/dashboard",
    }));
    const { error: insertError } = await service.from("notifications").insert(rows);
    if (insertError) return json({ error: insertError.message }, 500);
    return json({ success: true, count: recipients.length });
  }

  return json({ error: "Unsupported action" }, 400);
});
