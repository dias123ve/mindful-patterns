import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend";

const MAX_EMAIL_ATTEMPTS = 3;

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

  // =========================
  // FIND ORDERS TO RETRY
  // =========================
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("payment_status", "paid")
    .eq("email_sent", false)
    .lt("email_attempts", MAX_EMAIL_ATTEMPTS);

  if (error || !orders || orders.length === 0) {
    return new Response("No emails to process", { status: 200 });
  }

  for (const order of orders) {
    try {
      // =========================
      // GUARDS
      // =========================
      if (!order.user_email) {
        await markFailure(
          supabase,
          order,
          "user_email is undefined"
        );
        continue;
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
        await markFailure(
          supabase,
          order,
          "email template not found"
        );
        continue;
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
      // SUCCESS
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
    } catch (err: any) {
      console.error(err);
      await markFailure(supabase, order, err.message);
    }
  }

  return new Response("Email retry job finished", { status: 200 });
});

// =========================
// HELPERS
// =========================

async function markFailure(
  supabase: any,
  order: any,
  message: string
) {
  await supabase
    .from("orders")
    .update({
      email_attempts: order.email_attempts + 1,
      last_email_error: message,
      last_email_attempt_at: new Date().toISOString(),
    })
    .eq("id", order.id);
}

function getPackageName(key: string) {
  return {
    single: "Challenge Guide",
    bundle: "Personalized Bundle",
    full_series: "Full Self Series",
  }[key] || "Your Purchase";
}

function buildDeliveryContent(_: string) {
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
