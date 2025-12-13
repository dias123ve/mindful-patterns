import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend";

const MAX_EMAIL_ATTEMPTS = 3;

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response("Missing order_id", { status: 400 });
    }

    // =========================
    // LOAD ORDER
    // =========================
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    // =========================
    // GUARDS
    // =========================
    if (order.payment_status !== "paid") {
      return new Response("Order not paid", { status: 200 });
    }

    if (order.email_sent) {
      return new Response("Email already sent", { status: 200 });
    }

    if (order.email_attempts >= MAX_EMAIL_ATTEMPTS) {
      return new Response("Email retry limit reached", { status: 200 });
    }

    if (!order.user_email) {
      await supabase
        .from("orders")
        .update({
          email_attempts: order.email_attempts + 1,
          last_email_error: "user_email is undefined",
          last_email_attempt_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      return new Response("User email missing", { status: 400 });
    }

    // =========================
    // LOAD TEMPLATE
    // =========================
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("package_key", order.purchase_type)
      .eq("is_active", true)
      .single();

    if (!template) {
      throw new Error("Email template not found");
    }

    // =========================
    // BUILD EMAIL
    // =========================
    const html = renderTemplate(template.body_template, {
      user_name: order.user_email,
      package_name: getPackageName(order.purchase_type),
      delivery_content: buildDeliveryContent(order.purchase_type),
      support_email: "support.mindprofile@gmail.com",
    });

    // =========================
    // SEND EMAIL
    // =========================
    await resend.emails.send({
      from: `${template.sender_name} <${template.sender_email}>`,
      to: order.user_email,
      subject: template.subject,
      html,
    });

    // =========================
    // SUCCESS UPDATE
    // =========================
    await supabase
      .from("orders")
      .update({
        email_sent: true,
        email_attempts: order.email_attempts + 1,
        last_email_error: null,
        last_email_attempt_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return new Response("Email sent successfully", { status: 200 });
  } catch (err: any) {
    console.error(err);

    // fallback update if error
    if (err?.order?.id) {
      await supabase
        .from("orders")
        .update({
          email_attempts: err.order.email_attempts + 1,
          last_email_error: err.message,
          last_email_attempt_at: new Date().toISOString(),
        })
        .eq("id", err.order.id);
    }

    return new Response("Email send failed", { status: 500 });
  }
});

// =========================
// HELPERS
// =========================

function getPackageName(key: string) {
  return {
    single: "Challenge Guide",
    bundle: "Personalized Bundle",
    full_series: "Full Self Series",
  }[key] || "Your Purchase";
}

function buildDeliveryContent(key: string) {
  return `
    <p>Your content is ready.</p>
    <a href="https://mymindprofile.com/dashboard"
       style="padding:12px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">
       Access Your Content
    </a>
  `;
}

function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}
