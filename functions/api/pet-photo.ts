interface R2ObjectBody {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}

interface R2BucketLike {
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
}

interface PagesEnv {
  VETBOX_MEDIA: R2BucketLike;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

interface PetAccess {
  ownerId: string;
  admin: boolean;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const OBJECT_KEY = new RegExp(`^(${UUID})/(${UUID})/(${UUID})\\.webp$`, "i");

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function getSupabaseConfig(env: PagesEnv) {
  const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/$/, "");
  const anonKey = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

async function getPetAccess(request: Request, env: PagesEnv, petId: string): Promise<PetAccess | Response> {
  const config = getSupabaseConfig(env);
  if (!config) return json({ error: "Cloudflare is missing SUPABASE_URL or SUPABASE_ANON_KEY runtime variables" }, 500);

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return json({ error: "يجب تسجيل الدخول أولًا." }, 401);

  const authResponse = await fetch(`${config.url}/auth/v1/user`, {
    headers: { apikey: config.anonKey, authorization },
  });
  if (!authResponse.ok) return json({ error: "جلسة الدخول غير صالحة. سجّل الدخول مرة أخرى." }, 401);
  const user = await authResponse.json() as { id?: string };
  if (!user.id) return json({ error: "لم يتم التحقق من حساب المستخدم." }, 401);

  const profileUrl = new URL(`${config.url}/rest/v1/profiles`);
  profileUrl.searchParams.set("id", `eq.${user.id}`);
  profileUrl.searchParams.set("select", "role");
  const profileResponse = await fetch(profileUrl, {
    headers: { apikey: config.anonKey, authorization, accept: "application/json" },
  });
  if (!profileResponse.ok) return json({ error: "تعذر التحقق من صلاحية الحساب." }, 403);
  const profiles = await profileResponse.json() as Array<{ role?: string }>;
  const admin = profiles[0]?.role === "admin";

  const petUrl = new URL(`${config.url}/rest/v1/pets`);
  petUrl.searchParams.set("id", `eq.${petId}`);
  petUrl.searchParams.set("select", "owner_id");
  if (!admin) petUrl.searchParams.set("owner_id", `eq.${user.id}`);
  const petResponse = await fetch(petUrl, {
    headers: { apikey: config.anonKey, authorization, accept: "application/json" },
  });
  if (!petResponse.ok) return json({ error: "تعذر التحقق من ملكية الحيوان." }, 403);
  const pets = await petResponse.json() as Array<{ owner_id?: string }>;
  if (!pets[0]?.owner_id) return json({ error: "لا تملك صلاحية تعديل صورة هذا الحيوان." }, 403);
  return { ownerId: pets[0].owner_id, admin };
}

export const onRequest = async ({ request, env }: { request: Request; env: PagesEnv }): Promise<Response> => {
  if (!env.VETBOX_MEDIA) return json({ error: "R2 binding VETBOX_MEDIA is not configured." }, 500);

  const url = new URL(request.url);

  if (request.method === "GET") {
    const key = url.searchParams.get("key") || "";
    if (!OBJECT_KEY.test(key)) return json({ error: "رابط الصورة غير صالح." }, 400);
    const object = await env.VETBOX_MEDIA.get(key);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  }

  if (request.method === "POST") {
    const petId = request.headers.get("x-pet-id") || "";
    if (!new RegExp(`^${UUID}$`, "i").test(petId)) return json({ error: "معرّف الحيوان غير صالح." }, 400);
    const access = await getPetAccess(request, env, petId);
    if (access instanceof Response) return access;
    const contentType = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (contentType !== "image/webp") return json({ error: "يجب رفع الصورة بصيغة WebP." }, 415);
    const declaredSize = Number(request.headers.get("content-length") || 0);
    if (declaredSize > MAX_IMAGE_BYTES) return json({ error: "حجم الصورة أكبر من 5 ميجابايت." }, 413);
    const image = await request.arrayBuffer();
    if (!image.byteLength) return json({ error: "ملف الصورة فارغ." }, 400);
    if (image.byteLength > MAX_IMAGE_BYTES) return json({ error: "حجم الصورة أكبر من 5 ميجابايت." }, 413);

    const key = `${access.ownerId}/${petId}/${crypto.randomUUID()}.webp`;
    await env.VETBOX_MEDIA.put(key, image, {
      httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" },
    });
    return json({ key, url: `${url.origin}/api/pet-photo?key=${encodeURIComponent(key)}` }, 201);
  }

  if (request.method === "DELETE") {
    let body: { petId?: string; key?: string };
    try { body = await request.json() as { petId?: string; key?: string }; }
    catch { return json({ error: "بيانات الحذف غير صالحة." }, 400); }
    if (!body.petId || !new RegExp(`^${UUID}$`, "i").test(body.petId) || !body.key || !OBJECT_KEY.test(body.key)) {
      return json({ error: "بيانات الصورة غير صالحة." }, 400);
    }
    const access = await getPetAccess(request, env, body.petId);
    if (access instanceof Response) return access;
    if (!body.key.startsWith(`${access.ownerId}/${body.petId}/`)) return json({ error: "لا تملك صلاحية حذف هذه الصورة." }, 403);
    await env.VETBOX_MEDIA.delete(body.key);
    return json({ success: true });
  }

  return json({ error: "Method not allowed" }, 405);
};
