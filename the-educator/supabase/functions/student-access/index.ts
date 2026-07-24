import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const OTP_FROM_EMAIL = Deno.env.get("OTP_FROM_EMAIL") || "";
const STUDENT_PORTAL_URL = Deno.env.get("STUDENT_PORTAL_URL") ||
  "https://dr-aattallah.github.io/the-educator/attendance/student/";
const CHALLENGE_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_REQUESTS_PER_15_MINUTES = 3;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeUniversityId(value: unknown): string {
  return String(value || "").trim().toUpperCase();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "البريد الجامعي المسجل";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function genericRequestResponse() {
  const numericOtpEnabled = Boolean(RESEND_API_KEY && OTP_FROM_EMAIL);
  return json({
    success: true,
    pending: true,
    delivery_method: numericOtpEnabled ? "otp" : "magic_link",
    message:
      numericOtpEnabled
        ? "إذا كان الرقم مرتبطًا بحساب نشط فسيصل رمز إلى البريد المسجل."
        : "إذا كان الرقم مرتبطًا بحساب نشط فسيصل رابط دخول آمن إلى البريد المسجل.",
  });
}

async function sendNumericOtp(email: string, token: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: OTP_FROM_EMAIL,
      to: [email],
      subject: "رمز الدخول إلى بوابة الطالب",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">
        <h2>رمز الدخول إلى بوابة الطالب</h2>
        <p>استخدم الرمز التالي خلال ${CHALLENGE_MINUTES} دقائق:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;direction:ltr">${token}</p>
        <p>إذا لم تطلب هذا الرمز فتجاهل الرسالة.</p>
      </div>`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Email provider rejected request (${response.status}).`);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ success: false, message: "Method not allowed." }, 405);
  }

  try {
    const body = await request.json();
    const action = String(body?.action || "");
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (action === "request") {
      const universityId = normalizeUniversityId(body?.university_id);
      if (!/^[0-9A-Z-]{5,20}$/.test(universityId)) {
        return genericRequestResponse();
      }

      const forwardedFor =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown";
      const ipHash = await sha256(forwardedFor);
      const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const { count: recentRequests } = await admin
        .from("student_login_challenges")
        .select("challenge_id", { count: "exact", head: true })
        .or(`university_id.eq.${universityId},request_ip_hash.eq.${ipHash}`)
        .gte("requested_at", windowStart);

      if ((recentRequests || 0) >= MAX_REQUESTS_PER_15_MINUTES) {
        return json({
          success: false,
          message: "تم تجاوز عدد المحاولات. حاول بعد 15 دقيقة.",
        }, 429);
      }

      const { data: student } = await admin
        .from("users")
        .select("university_id,email,role,status")
        .eq("university_id", universityId)
        .ilike("role", "student")
        .ilike("status", "active")
        .maybeSingle();

      if (!student?.email) {
        return genericRequestResponse();
      }

      const email = String(student.email).trim().toLowerCase();
      const numericOtpEnabled = Boolean(RESEND_API_KEY && OTP_FROM_EMAIL);

      const { error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        password: `${crypto.randomUUID()}Aa9!`,
        user_metadata: { university_id: universityId, role: "Student" },
      });
      if (
        createError &&
        !/already|registered|exists/i.test(createError.message)
      ) {
        throw createError;
      }

      if (numericOtpEnabled) {
        const { data: link, error: linkError } =
          await admin.auth.admin.generateLink({
            type: "magiclink",
            email,
            options: { redirectTo: STUDENT_PORTAL_URL },
          });
        if (linkError || !link?.properties?.email_otp) {
          throw linkError || new Error("OTP generation failed.");
        }

        await sendNumericOtp(email, link.properties.email_otp);

        const expiresAt = new Date(
          Date.now() + CHALLENGE_MINUTES * 60 * 1000,
        ).toISOString();
        const { data: challenge, error: challengeError } = await admin
          .from("student_login_challenges")
          .insert({
            university_id: universityId,
            email,
            expires_at: expiresAt,
            request_ip_hash: ipHash,
          })
          .select("challenge_id")
          .single();
        if (challengeError) throw challengeError;

        return json({
          success: true,
          delivery_method: "otp",
          challenge_id: challenge.challenge_id,
          masked_email: maskEmail(email),
          expires_in_seconds: CHALLENGE_MINUTES * 60,
        });
      }

      const { error: linkError } = await authClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: STUDENT_PORTAL_URL,
        },
      });
      if (linkError) throw linkError;

      return json({
        success: true,
        delivery_method: "magic_link",
        masked_email: maskEmail(email),
        expires_in_seconds: CHALLENGE_MINUTES * 60,
      });
    }

    if (action === "verify") {
      const challengeId = String(body?.challenge_id || "");
      const token = String(body?.token || "").trim();
      if (
        !/^[0-9a-f-]{36}$/i.test(challengeId) ||
        !/^[0-9]{6,8}$/.test(token)
      ) {
        return json({ success: false, message: "رمز التحقق غير صحيح." }, 400);
      }

      const { data: challenge } = await admin
        .from("student_login_challenges")
        .select("challenge_id,email,expires_at,attempts,used_at")
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (
        !challenge ||
        challenge.used_at ||
        new Date(challenge.expires_at).getTime() <= Date.now() ||
        Number(challenge.attempts) >= MAX_VERIFY_ATTEMPTS
      ) {
        return json({
          success: false,
          message: "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.",
        }, 400);
      }

      await admin
        .from("student_login_challenges")
        .update({ attempts: Number(challenge.attempts) + 1 })
        .eq("challenge_id", challengeId);

      const { data: verified, error: verifyError } =
        await authClient.auth.verifyOtp({
          email: challenge.email,
          token,
          type: "email",
        });

      if (verifyError || !verified.session) {
        return json({ success: false, message: "رمز التحقق غير صحيح." }, 400);
      }

      await admin
        .from("student_login_challenges")
        .update({ used_at: new Date().toISOString() })
        .eq("challenge_id", challengeId);

      return json({
        success: true,
        access_token: verified.session.access_token,
        refresh_token: verified.session.refresh_token,
        expires_in: verified.session.expires_in,
      });
    }

    return json({ success: false, message: "طلب غير صالح." }, 400);
  } catch (error) {
    console.error("student-access", error);
    return json({
      success: false,
      message: "تعذر إرسال رمز الدخول الآن. حاول لاحقًا.",
    }, 500);
  }
});
