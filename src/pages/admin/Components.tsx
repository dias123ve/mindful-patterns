import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

// -------------------------
// Types
// -------------------------
interface ComponentItem {
  id: string;
  name: string;
  type: string;
  content: {
    description: string;
    examples: string;
  };
}

interface PdfDocument {
  id: string;
  title?: string;
  file_name?: string | null;
  file_url?: string;
}

interface ComponentPdf {
  id: string;
  component_id: string;
  pdf_id: string;
}

// -------------------------
// Helper: safe JSON parser
// -------------------------
function safeParseContent(content: any) {
  if (!content) return { description: "", examples: "" };
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return {
        description: parsed.description || "",
        examples: parsed.examples || "",
      };
    } catch {
      return { description: "", examples: "" };
    }
  }
  if (typeof content === "object") {
    return {
      description: (content && content.description) || "",
      examples: (content && content.examples) || "",
    };
  }
  return { description: "", examples: "" };
}

// -------------------------
// Main Component
// -------------------------
const ComponentsManager = () => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [componentPdfs, setComponentPdfs] = useState<ComponentPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    examples: "",
  });

  // Manage PDFs dialog
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentItem | null>(null);
  const [selectedPdfIds, setSelectedPdfIds] = useState<string[]>([]);
  const [savingPdfs, setSavingPdfs] = useState(false);

  // -------------------------
  // Fetch Data
  // -------------------------
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // gunakan explicit select untuk menghindari parsing relationship error
      const componentsRes = await supabase
        .from("components")
        .select("id, name, type, content")
        .order("created_at", { ascending: true });

      const pdfsRes = await supabase
        .from("pdf_documents")
        .select("id, title, file_name, file_url")
        .order("created_at", { ascending: false });

      const componentPdfsRes = await supabase
        .from("component_pdfs")
        .select("id, component_id, pdf_id");

      // debug if something is wrong
      if (componentsRes.error) {
        console.error("componentsRes (error):", componentsRes);
        throw componentsRes.error;
      }
      if (pdfsRes.error) {
        console.error("pdfsRes (error):", pdfsRes);
        throw pdfsRes.error;
      }
      if (componentPdfsRes.error) {
        console.error("componentPdfsRes (error):", componentPdfsRes);
        throw componentPdfsRes.error;
      }

      const componentsData = (componentsRes.data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        content: safeParseContent(c.content),
      }));

      setComponents(componentsData);
      setPdfs(pdfsRes.data || []);
      setComponentPdfs(componentPdfsRes.data || []);
    } catch (error: any) {
      console.error("fetchData error (full):", error);
      // tampilkan pesan error yang jelas ke user
      if (error && error.message) {
        toast.error(`Failed to load data: ${error.message}`);
      } else {
        toast.error("Failed to load data (see console)");
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Helpers
  // -------------------------
  const resetForm = () => {
    setFormData({ name: "", description: "", examples: "" });
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
      description: component.content?.description || "",
      examples: component.content?.examples || "",
    });
    setDialogOpen(true);
  };

  // -------------------------
  // Save Component
  // -------------------------
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a component name");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        type: "component",
        content: {
          description: formData.description.trim(),
          examples: formData.examples.trim(),
        },
      };

      if (editingComponent) {
        const res = await supabase
          .from("components")
          .update(payload)
          .eq("id", editingComponent.id)
          .select("id, name, type, content");
        if (res.error) {
          console.error("update error:", res);
          throw res.error;
        }
        toast.success("Component updated");
      } else {
        const res = await supabase
          .from("components")
          .insert([payload])
          .select("id, name, type, content");
        if (res.error) {
          console.error("insert error:", res);
          throw res.error;
        }
        toast.success("Component created");
      }

      setDialogOpen(false);
      resetForm();
      // reload data (use fetchData)
      await fetchData();
    } catch (err: any) {
      console.error("handleSave error:", err);
      const msg = err?.message || (err?.error && err.error.message) || "Failed to save component";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // Delete Component
  // -------------------------
  const handleDelete = async (componentId: string) => {
    if (!confirm("Delete this component?")) return;

    try {
      const { error } = await supabase.from("components").delete().eq("id", componentId);
      if (error) {
        console.error("delete error:", error);
        throw error;
      }
      toast.success("Component deleted");
      await fetchData();
    } catch (error) {
      console.error("handleDelete error:", error);
      toast.error("Failed to delete component");
    }
  };

  // -------------------------
  // Manage PDFs
  // -------------------------
  const openManagePdfsDialog = (component: ComponentItem) => {
    setSelectedComponent(component);
    const assignedPdfIds = componentPdfs
      .filter((cp) => cp.component_id === component.id)
      .map((cp) => cp.pdf_id);
    setSelectedPdfIds(assignedPdfIds);
    setPdfDialogOpen(true);
  };

  const handlePdfToggle = (pdfId: string) => {
    setSelectedPdfIds((prev) =>
      prev.includes(pdfId) ? prev.filter((id) => id !== pdfId) : [...prev, pdfId]
    );
  };

  const handleSavePdfs = async () => {
    if (!selectedComponent) return;
    setSavingPdfs(true);
    try {
      const del = await supabase
        .from("component_pdfs")
        .delete()
        .eq("component_id", selectedComponent.id);
      if (del.error) throw del.error;

      if (selectedPdfIds.length > 0) {
        const rows = selectedPdfIds.map((pdfId) => ({
          component_id: selectedComponent.id,
          pdf_id: pdfId,
        }));
        const ins = await supabase.from("component_pdfs").insert(rows);
        if (ins.error) throw ins.error;
      }

      toast.success("PDF assignments updated");
      setPdfDialogOpen(false);
      await fetchData();
    } catch (error) {
      console.error("handleSavePdfs error:", error);
      toast.error("Failed to save PDF assignments");
    } finally {
      setSavingPdfs(false);
    }
  };

  const getAssignedPdfs = (componentId: string) => {
    const pdfIds = componentPdfs.filter((cp) => cp.component_id === componentId).map((cp) => cp.pdf_id);
    return pdfs.filter((p) => pdfIds.includes(p.id));
  };

  // -------------------------
  // Render
  // -------------------------
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
          <p className="text-muted-foreground mt-1">Manage your quiz components and PDF attachments</p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Component
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Example</TableHead>
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
              components.map((c) => {
                const assigned = getAssignedPdfs(c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{c.content?.description || "—"}</p>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{c.content?.examples || "—"}</p>
                    </TableCell>

                    <TableCell>
                      {assigned.length === 0 ? (
                        <span className="text-muted-foreground text-sm">None</span>
                      ) : (
                        <div className="text-xs space-y-1">
                          {assigned.slice(0, 2).map((pdf) => (
                            <div key={pdf.id} className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {pdf.title || pdf.file_name}
                            </div>
                          ))}
                          {assigned.length > 2 && <span>+{assigned.length - 2} more</span>}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => openManagePdfsDialog(c)}>
                          <FileText className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingComponent ? "Edit Component" : "Create Component"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="mt-1" />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className="mt-1" />
            </div>

            <div>
              <Label>Example</Label>
              <Textarea rows={2} value={formData.examples} onChange={(e) => setFormData((p) => ({ ...p, examples: e.target.value }))} className="mt-1" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingComponent ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage PDFs Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage PDFs for {selectedComponent?.name}</DialogTitle>
          </DialogHeader>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="flex items-center gap-3 px-2 py-1 hover:bg-secondary/50 rounded">
                <Checkbox checked={selectedPdfIds.includes(pdf.id)} onCheckedChange={() => handlePdfToggle(pdf.id)} />
                <span className="text-sm">{pdf.title || pdf.file_name || "Untitled PDF"}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePdfs} disabled={savingPdfs}>
              {savingPdfs && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComponentsManager;
