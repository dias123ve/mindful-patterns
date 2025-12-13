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
import { Save, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  subject: string;
  body_template: string;
}

const EmailSettingsPage = () => {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    body_template: "",
  });

  // ===============================
  // LOAD SINGLE TEMPLATE
  // ===============================
  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTemplate(data);
        setFormData({
          subject: data.subject,
          body_template: data.body_template,
        });
      } else {
        setTemplate(null);
        setFormData({
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
            subject: formData.subject,
            body_template: formData.body_template,
          })
          .eq("id", template.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_templates").insert({
          subject: formData.subject,
          body_template: formData.body_template,
          is_active: true,
        });

        if (error) throw error;
        fetchTemplate();
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
          Email Template
        </h1>
        <p className="text-muted-foreground mt-1">
          Single delivery email used for all packages
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FORM */}
        <div className="lg:col-span-2 space-y-6">
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
                <Label>Email Body</Label>
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
                  placeholder={`Thank you for your purchase.

You’ve unlocked the {{package_name}}.

{{delivery_content}}

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
                ["{{package_name}}", "Resolved package name"],
                ["{{delivery_content}}", "Download links or access content"],
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
