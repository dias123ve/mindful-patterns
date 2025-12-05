import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Loader2, Check, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Component {
  id: string;
  component_key: string;
  name: string;
  pdf_url: string | null;
}

const PDFModules = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { data, error } = await supabase
        .from("components")
        .select("id, component_key, name, pdf_url")
        .order("display_order");

      if (error) throw error;
      setComponents(data || []);
    } catch (error) {
      console.error("Error fetching components:", error);
      toast.error("Failed to load components");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (componentId: string, file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(componentId);

    try {
      const component = components.find((c) => c.id === componentId);
      if (!component) return;

      const filePath = `${component.component_key}/${Date.now()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdf-modules")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("pdf-modules")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("components")
        .update({ pdf_url: urlData.publicUrl })
        .eq("id", componentId);

      if (updateError) throw updateError;

      toast.success("PDF uploaded successfully");
      fetchComponents();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = async (componentId: string) => {
    if (!confirm("Are you sure you want to remove this PDF?")) return;

    try {
      const { error } = await supabase
        .from("components")
        .update({ pdf_url: null })
        .eq("id", componentId);

      if (error) throw error;

      toast.success("PDF removed");
      fetchComponents();
    } catch (error) {
      console.error("Error removing PDF:", error);
      toast.error("Failed to remove PDF");
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
          PDF Modules
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload PDF ebook modules for each thinking component
        </p>
      </div>

      {/* Upload Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {components.map((component) => (
          <Card key={component.id} className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {component.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {component.pdf_url ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">
                      PDF uploaded
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={component.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View PDF
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs.current[component.id]?.click()}
                      disabled={uploading === component.id}
                    >
                      Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(component.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRefs.current[component.id]?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  {uploading === component.id ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {uploading === component.id
                      ? "Uploading..."
                      : "Click to upload PDF"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 10MB
                  </p>
                </div>
              )}

              <input
                ref={(el) => (fileInputRefs.current[component.id] = el)}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(component.id, file);
                  e.target.value = "";
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PDFModules;
