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

interface Component {
  id: string;
  name: string;
  type: string;
  // display_order removed
  content: {
    description: string;
    examples: string;
  } | null;
}

interface PdfDocument {
  id: string;
  title: string;
  file_name: string | null;
  file_url: string;
}

interface ComponentPdf {
  id: string;
  component_id: string;
  pdf_id: string;
}

const ComponentsManager = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [componentPdfs, setComponentPdfs] = useState<ComponentPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    examples: "",
  });

  // Manage PDFs dialog
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [selectedPdfIds, setSelectedPdfIds] = useState<string[]>([]);
  const [savingPdfs, setSavingPdfs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [componentsRes, pdfsRes, componentPdfsRes] = await Promise.all([
        supabase.from("components").select("*").order("created_at", { ascending: true }),
        supabase.from("pdf_documents").select("*").order("created_at", { ascending: false }),
        supabase.from("component_pdfs").select("*"),
      ]);

      if (componentsRes.error) throw componentsRes.error;
      if (pdfsRes.error) throw pdfsRes.error;
      if (componentPdfsRes.error) throw componentPdfsRes.error;

      setComponents(componentsRes.data || []);
      setPdfs(pdfsRes.data || []);
      setComponentPdfs(componentPdfsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", examples: "" });
    setEditingComponent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (component: Component) => {
    setEditingComponent(component);
    setFormData({
  name: component.name,
  description: component.content?.description || "",
  examples: component.content?.examples || "",
});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a component name");
      return;
    }

    setSaving(true);
    try {
      if (editingComponent) {
  const { data, error } = await supabase
  .from("components")
  .update({
    name: formData.name,
    type: editingComponent.type || "component",
    content: {
      description: formData.description || "",
      examples: formData.examples || "",
    },
  })
  .eq("id", editingComponent.id)
  .select("*");

        if (error) throw error;
        toast.success("Component updated successfully");
      } else {
        // Generate component_key from name
        const componentKey = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "");

        const { data, error } = await supabase
  .from("components")
  .insert({
    name: formData.name,
    type: "component",
    content: {
      description: formData.description || "",
      examples: formData.examples || "",
    },
  })
  .select("*"); // WAJIB


        if (error) throw error;
        toast.success("Component created successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Supabase error:", JSON.stringify(error, null, 2));
      if (error.code === "23505") {
        toast.error("A component with this name already exists");
      } else {
        toast.error("Failed to save component");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (componentId: string) => {
    if (!confirm("Are you sure you want to delete this component?")) return;

    try {
      const { error } = await supabase
        .from("components")
        .delete()
        .eq("id", componentId);

      if (error) throw error;
      toast.success("Component deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting component:", error);
      toast.error("Failed to delete component");
    }
  };

  const openManagePdfsDialog = (component: Component) => {
    setSelectedComponent(component);
    const assignedPdfIds = componentPdfs
      .filter((cp) => cp.component_id === component.id)
      .map((cp) => cp.pdf_id);
    setSelectedPdfIds(assignedPdfIds);
    setPdfDialogOpen(true);
  };

  const handlePdfToggle = (pdfId: string) => {
    setSelectedPdfIds((prev) =>
      prev.includes(pdfId)
        ? prev.filter((id) => id !== pdfId)
        : [...prev, pdfId]
    );
  };

  const handleSavePdfs = async () => {
    if (!selectedComponent) return;

    setSavingPdfs(true);
    try {
      // Delete all existing assignments for this component
      await supabase
        .from("component_pdfs")
        .delete()
        .eq("component_id", selectedComponent.id);

      // Insert new assignments
      if (selectedPdfIds.length > 0) {
        const newAssignments = selectedPdfIds.map((pdfId) => ({
          component_id: selectedComponent.id,
          pdf_id: pdfId,
        }));

        const { error } = await supabase
          .from("component_pdfs")
          .insert(newAssignments);

        if (error) throw error;
      }

      toast.success("PDF assignments updated");
      setPdfDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving PDF assignments:", error);
      toast.error("Failed to save PDF assignments");
    } finally {
      setSavingPdfs(false);
    }
  };

  const getAssignedPdfs = (componentId: string) => {
    const pdfIds = componentPdfs
      .filter((cp) => cp.component_id === componentId)
      .map((cp) => cp.pdf_id);
    return pdfs.filter((pdf) => pdfIds.includes(pdf.id));
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Components
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage quiz result components and their PDF assignments
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Component
        </Button>
      </div>

      {/* Components Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="max-w-xs">Description</TableHead>
              <TableHead className="max-w-xs">Example</TableHead>
              <TableHead>Assigned PDFs</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {components.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No components yet. Click "Create Component" to add one.
                </TableCell>
              </TableRow>
            ) : (
              components.map((component) => {
                const assignedPdfs = getAssignedPdfs(component.id);
                return (
                  <TableRow key={component.id}>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell className="max-w-xs">
  <p className="truncate text-sm text-muted-foreground">
    {component.content?.description || "—"}
  </p>
</TableCell>
<TableCell className="max-w-xs">
  <p className="truncate text-sm text-muted-foreground">
    {component.content?.examples || "—"}
  </p>
</TableCell>

                    <TableCell>
                      {assignedPdfs.length > 0 ? (
                        <div className="space-y-1">
                          {assignedPdfs.slice(0, 2).map((pdf) => (
                            <div key={pdf.id} className="text-xs text-muted-foreground flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {pdf.title || pdf.file_name || "Untitled"}
                            </div>
                          ))}
                          {assignedPdfs.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{assignedPdfs.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(component)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openManagePdfsDialog(component)}
                          title="Manage PDFs"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(component.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
                        >
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

      {/* Create/Edit Component Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingComponent ? "Edit Component" : "Create Component"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Component name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe this component..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Example</Label>
              <Textarea
                value={formData.examples}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, examples: e.target.value }))
                }
                placeholder="Provide an example..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
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
            <DialogTitle>
              Manage PDFs for "{selectedComponent?.name}"
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {pdfs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No PDFs available. Upload PDFs in the PDF Modules page first.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50"
                  >
                    <Checkbox
                      id={pdf.id}
                      checked={selectedPdfIds.includes(pdf.id)}
                      onCheckedChange={() => handlePdfToggle(pdf.id)}
                    />
                    <label
                      htmlFor={pdf.id}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {pdf.title || pdf.file_name || "Untitled PDF"}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePdfs} disabled={savingPdfs}>
                {savingPdfs && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Assignments
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComponentsManager;
