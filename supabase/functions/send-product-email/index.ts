import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend";

serve(async (req) => {
  try {
    // =========================
    // INIT
    // =========================
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

    const { order_id } = await req.json();

    if (!order_id) {
      return new Response("Missing order_id", { status: 400 });
    }

    // =========================
    // LOAD ORDER
    // =========================
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    if (order.payment_status !== "paid") {
      return new Response("Order not paid", { status: 200 });
    }

    if (order.email_sent) {
      return new Response("Email already sent", { status: 200 });
    }

    // =========================
    // LOAD EMAIL TEMPLATE
    // =========================
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("package_key", order.purchase_type)
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      throw new Error("Email template not found");
    }

    // =========================
    // BUILD EMAIL CONTENT
    // =========================
    const deliveryContent = buildDeliveryContent(order.purchase_type);

    const html = renderTemplate(template.body_template, {
      user_name: order.user_email,
      package_name: getPackageName(order.purchase_type),
      delivery_content: deliveryContent,
      support_email: "support.mindprofile@gmail.com",
    });

    // =========================
    // SEND EMAIL
    // =========================
    const emailResult = await resend.emails.send({
      from: `${template.sender_name} <${template.sender_email}>`,
      to: order.user_email,
      subject: template.subject,
      html,
    });

    // =========================
    // LOG EMAIL
    // =========================
    await supabase.from("email_logs").insert({
      to_email: order.user_email,
      subject: template.subject,
      message: html,
      status: "sent",
    });

    // =========================
    // MARK AS SENT
    // =========================
    await supabase
      .from("orders")
      .update({ email_sent: true })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Internal error", { status: 500 });
  }
});

// =========================
// HELPERS
// =========================

function getPackageName(key: string) {
  switch (key) {
    case "single":
      return "Challenge Guide";
    case "bundle":
      return "Personalized Guide Bundle";
    case "full_series":
      return "Full Self Series";
    default:
      return "Your Purchase";
  }
}

function buildDeliveryContent(packageKey: string) {
  if (packageKey === "single") {
    return `
      <p>Your guide is ready:</p>
      <a href="https://mymindprofile.com/download/challenge"
         style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">
        Download Your Challenge Guide
      </a>
    `;
  }

  if (packageKey === "bundle") {
    return `
      <p>You can access your personalized bundle here:</p>
      <a href="https://mymindprofile.com/dashboard"
         style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">
        Access Your Bundle
      </a>
    `;
  }

  return `
    <p>You now have full access to the complete 16-guide library.</p>
    <a href="https://mymindprofile.com/dashboard"
       style="display:inline-block;padding:12px 20px;background:#6d28d9;color:#fff;border-radius:6px;text-decoration:none">
      Open Your Full Library
    </a>
  `;
}

function renderTemplate(template: string, vars: Record<string, string>) {
  let output = template;
  for (const key in vars) {
    output = output.replaceAll(`{{${key}}}`, vars[key]);
  }
  return output;
}
