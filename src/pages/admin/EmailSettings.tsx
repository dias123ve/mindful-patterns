import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, Loader2, Mail, Info } from "lucide-react";
import { toast } from "sonner";

type PackageKey = "single" | "bundle" | "full_series";

interface EmailTemplate {
  id: string;
  package_key: PackageKey;
  sender_email: string;
  sender_name: string;
  subject: string;
  body_template: string;
}

const PACKAGE_OPTIONS: { key: PackageKey; label: string }[] = [
  { key: "single", label: "Single – Challenge Guide" },
  { key: "bundle", label: "Bundle – Elevated + Challenge" },
  { key: "full_series", label: "Full Series – 16 Guides" },
];

const EmailSettingsPage = () => {
  const [selectedPackage, setSelectedPackage] =
    useState<PackageKey>("single");

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    sender_name: "",
    sender_email: "",
    subject: "",
    body_template: "",
  });

  // ===============================
  // LOAD TEMPLATE PER PACKAGE
  // ===============================
  useEffect(() => {
    fetchTemplate(selectedPackage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage]);

  const fetchTemplate = async (pkg: PackageKey) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("package_key", pkg)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTemplate(data);
        setFormData({
          sender_name: data.sender_name,
          sender_email: data.sender_email,
          subject: data.subject,
          body_template: data.body_template,
        });
      } else {
        // reset form if template not exist yet
        setTemplate(null);
        setFormData({
          sender_name: "",
          sender_email: "",
          subject: "",
          body_template: "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load email template");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // SAVE TEMPLATE
  // ===============================
  const handleSave = async () => {
    setSaving(true);

    try {
      if (template) {
        const { error } = await supabase
          .from("email_templates")
          .update({
            sender_name: formData.sender_name,
            sender_email: formData.sender_email,
            subject: formData.subject,
            body_template: formData.body_template,
          })
          .eq("id", template.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_templates").insert({
          package_key: selectedPackage,
          sender_name: formData.sender_name,
          sender_email: formData.sender_email,
          subject: formData.subject,
          body_template: formData.body_template,
          is_active: true,
        });

        if (error) throw error;
        fetchTemplate(selectedPackage);
      }

      toast.success("Email template saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save email template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Email Templates
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure email delivery per product package
        </p>
      </div>

      {/* Package Selector */}
      <Card>
        <CardContent className="pt-6">
          <Label>Email Template For</Label>
          <select
            value={selectedPackage}
            onChange={(e) =>
              setSelectedPackage(e.target.value as PackageKey)
            }
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {PACKAGE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sender */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Sender Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Sender Name</Label>
                  <Input
                    value={formData.sender_name}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        sender_name: e.target.value,
                      }))
                    }
                    placeholder="MindProfile"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Sender Email</Label>
                  <Input
                    type="email"
                    value={formData.sender_email}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        sender_email: e.target.value,
                      }))
                    }
                    placeholder="hello@mindprofile.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Your MindProfile Guide Is Ready"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Email Body (HTML / Template)</Label>
                <Textarea
                  rows={14}
                  className="mt-1 font-mono text-sm"
                  value={formData.body_template}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      body_template: e.target.value,
                    }))
                  }
                  placeholder={`Hi {{user_name}},

Thank you for completing your purchase.

You’ve unlocked the {{package_name}}.

{{delivery_content}}

If you need help, contact us at {{support_email}}.

— MindProfile`}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* VARIABLES */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Available Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ["{{user_name}}", "User email or name"],
                ["{{package_name}}", "Purchased package name"],
                ["{{delivery_content}}", "Download links / access buttons"],
                ["{{support_email}}", "Sender support email"],
              ].map(([key, desc]) => (
                <div key={key}>
                  <div className="p-2 bg-secondary/50 rounded font-mono text-xs">
                    {key}
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">
                    {desc}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsPage;
