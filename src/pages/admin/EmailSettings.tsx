import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Mail, Info } from "lucide-react";
import { toast } from "sonner";

interface EmailSettings {
  id: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  body_template: string;
}

const EmailSettingsPage = () => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    sender_email: "",
    sender_name: "",
    subject: "",
    body_template: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("email_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setFormData({
          sender_email: data.sender_email,
          sender_name: data.sender_name,
          subject: data.subject,
          body_template: data.body_template,
        });
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
      toast.error("Failed to load email settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (settings) {
        const { error } = await supabase
          .from("email_settings")
          .update({
            sender_email: formData.sender_email,
            sender_name: formData.sender_name,
            subject: formData.subject,
            body_template: formData.body_template,
          })
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_settings").insert({
          sender_email: formData.sender_email,
          sender_name: formData.sender_name,
          subject: formData.subject,
          body_template: formData.body_template,
        });

        if (error) throw error;
        fetchSettings();
      }

      toast.success("Email settings saved successfully");
    } catch (error) {
      console.error("Error saving email settings:", error);
      toast.error("Failed to save email settings");
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
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Email Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure the email template for ebook delivery
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
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
                      setFormData((prev) => ({
                        ...prev,
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
                      setFormData((prev) => ({
                        ...prev,
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject Line</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Your Personalized MindProfile Ebook"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Email Body (Rich Text Template)</Label>
                <Textarea
                  value={formData.body_template}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      body_template: e.target.value,
                    }))
                  }
                  rows={12}
                  className="mt-1 font-mono text-sm"
                  placeholder="Hi {{user_name}},&#10;&#10;Thank you for taking the MindProfile quiz!&#10;&#10;Your top thinking patterns are:&#10;1. {{component_1}}&#10;2. {{component_2}}&#10;3. {{component_3}}&#10;&#10;Download your ebook modules:&#10;{{ebook_links}}&#10;&#10;Best regards,&#10;The MindProfile Team"
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Variables Reference */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Available Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-2 bg-secondary/50 rounded font-mono text-xs">
                {"{{user_name}}"}
              </div>
              <p className="text-muted-foreground text-xs">
                User's email address
              </p>

              <div className="p-2 bg-secondary/50 rounded font-mono text-xs">
                {"{{component_1}}"}
              </div>
              <p className="text-muted-foreground text-xs">
                Name of top component #1
              </p>

              <div className="p-2 bg-secondary/50 rounded font-mono text-xs">
                {"{{component_2}}"}
              </div>
              <p className="text-muted-foreground text-xs">
                Name of top component #2
              </p>

              <div className="p-2 bg-secondary/50 rounded font-mono text-xs">
                {"{{component_3}}"}
              </div>
              <p className="text-muted-foreground text-xs">
                Name of top component #3
              </p>

              <div className="p-2 bg-secondary/50 rounded font-mono text-xs">
                {"{{ebook_links}}"}
              </div>
              <p className="text-muted-foreground text-xs">
                Download links for PDF modules
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsPage;
