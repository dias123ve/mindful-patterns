import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

interface ComponentItem {
  id: string;
  name: string;
  component_key: string;
  description_positive: string;
  example_positive: string;
  pdf_positive_url: string | null;
  description_negative: string;
  example_negative: string;
  pdf_negative_url: string | null;
}

const ComponentsManager = () => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description_positive: "",
    example_positive: "",
    description_negative: "",
    example_negative: "",
  });

  // File uploads
  const [pdfPositiveFile, setPdfPositiveFile] = useState<File | null>(null);
  const [pdfNegativeFile, setPdfNegativeFile] = useState<File | null>(null);
  const [uploadingPositive, setUploadingPositive] = useState(false);
  const [uploadingNegative, setUploadingNegative] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("components")
        .select("id, name, component_key, description_positive, example_positive, pdf_positive_url, description_negative, example_negative, pdf_negative_url")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setComponents(data || []);
    } catch (error: any) {
      console.error("fetchData error:", error);
      toast.error(`Failed to load components: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description_positive: "",
      example_positive: "",
      description_negative: "",
      example_negative: "",
    });
    setPdfPositiveFile(null);
    setPdfNegativeFile(null);
    setEditingComponent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (component: ComponentItem) => {
    setEditingComponent(component);
    setFormData({
      name: component.name || "",
      description_positive: component.description_positive || "",
      example_positive: component.example_positive || "",
      description_negative: component.description_negative || "",
      example_negative: component.example_negative || "",
    });
    setPdfPositiveFile(null);
    setPdfNegativeFile(null);
    setDialogOpen(true);
  };

  const uploadPdf = async (file: File, bucket: string): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a component name");
      return;
    }

    setSaving(true);
    try {
      let pdfPositiveUrl = editingComponent?.pdf_positive_url || null;
      let pdfNegativeUrl = editingComponent?.pdf_negative_url || null;

      // Upload positive PDF if provided
      if (pdfPositiveFile) {
        setUploadingPositive(true);
        pdfPositiveUrl = await uploadPdf(pdfPositiveFile, "components-positive");
        setUploadingPositive(false);
      }

      // Upload negative PDF if provided
      if (pdfNegativeFile) {
        setUploadingNegative(true);
        pdfNegativeUrl = await uploadPdf(pdfNegativeFile, "components-negative");
        setUploadingNegative(false);
      }

      const payload = {
        name: formData.name.trim(),
        description_positive: formData.description_positive.trim(),
        example_positive: formData.example_positive.trim(),
        pdf_positive_url: pdfPositiveUrl,
        description_negative: formData.description_negative.trim(),
        example_negative: formData.example_negative.trim(),
        pdf_negative_url: pdfNegativeUrl,
      };

      if (editingComponent) {
        const { error } = await supabase
          .from("components")
          .update(payload)
          .eq("id", editingComponent.id);

        if (error) throw error;
        toast.success("Component updated");
      } else {
        // Generate a component_key from name
        const componentKey = formData.name.trim().toLowerCase().replace(/\s+/g, "_");
        
        const { error } = await supabase
          .from("components")
          .insert([{ ...payload, component_key: componentKey as any }]);

        if (error) throw error;
        toast.success("Component created");
      }

      setDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error("handleSave error:", err);
      toast.error(err?.message || "Failed to save component");
    } finally {
      setSaving(false);
      setUploadingPositive(false);
      setUploadingNegative(false);
    }
  };

  const handleDelete = async (componentId: string) => {
    if (!confirm("Delete this component?")) return;

    try {
      const { error } = await supabase.from("components").delete().eq("id", componentId);
      if (error) throw error;
      toast.success("Component deleted");
      await fetchData();
    } catch (error) {
      console.error("handleDelete error:", error);
      toast.error("Failed to delete component");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Components</h1>
          <p className="text-muted-foreground mt-1">
            Manage quiz result components with positive and negative versions
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Component
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Positive Description</TableHead>
              <TableHead>Negative Description</TableHead>
              <TableHead>PDFs</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {components.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No components yet.
                </TableCell>
              </TableRow>
            ) : (
              components.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">
                      {c.description_positive || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">
                      {c.description_negative || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      {c.pdf_positive_url && (
                        <a
                          href={c.pdf_positive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Positive PDF
                        </a>
                      )}
                      {c.pdf_negative_url && (
                        <a
                          href={c.pdf_negative_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Negative PDF
                        </a>
                      )}
                      {!c.pdf_positive_url && !c.pdf_negative_url && (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingComponent ? "Edit Component" : "Create Component"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <Label>Component Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="mt-1"
                placeholder="e.g., All-or-Nothing Thinking"
              />
            </div>

            {/* Positive Section */}
            <div className="p-4 border border-green-200 rounded-lg bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Positive Version (Strengths)
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Description (Positive)</Label>
                  <Textarea
                    rows={3}
                    value={formData.description_positive}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, description_positive: e.target.value }))
                    }
                    className="mt-1"
                    placeholder="Describe this as a strength..."
                  />
                </div>

                <div>
                  <Label>Example (Positive)</Label>
                  <Textarea
                    rows={2}
                    value={formData.example_positive}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, example_positive: e.target.value }))
                    }
                    className="mt-1"
                    placeholder="Give an example of this strength in daily life..."
                  />
                </div>

                <div>
                  <Label>PDF (Positive)</Label>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">
                        {pdfPositiveFile ? pdfPositiveFile.name : "Choose PDF"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setPdfPositiveFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {editingComponent?.pdf_positive_url && !pdfPositiveFile && (
                      <a
                        href={editingComponent.pdf_positive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline"
                      >
                        Current PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Negative Section */}
            <div className="p-4 border border-amber-200 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                Negative Version (Growth Areas)
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Description (Negative)</Label>
                  <Textarea
                    rows={3}
                    value={formData.description_negative}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, description_negative: e.target.value }))
                    }
                    className="mt-1"
                    placeholder="Describe this as an area for improvement..."
                  />
                </div>

                <div>
                  <Label>Example (Negative)</Label>
                  <Textarea
                    rows={2}
                    value={formData.example_negative}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, example_negative: e.target.value }))
                    }
                    className="mt-1"
                    placeholder="Give an example of how this shows up as a challenge..."
                  />
                </div>

                <div>
                  <Label>PDF (Negative)</Label>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">
                        {pdfNegativeFile ? pdfNegativeFile.name : "Choose PDF"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setPdfNegativeFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {editingComponent?.pdf_negative_url && !pdfNegativeFile && (
                      <a
                        href={editingComponent.pdf_negative_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-600 hover:underline"
                      >
                        Current PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || uploadingPositive || uploadingNegative}>
                {(saving || uploadingPositive || uploadingNegative) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingComponent ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComponentsManager;