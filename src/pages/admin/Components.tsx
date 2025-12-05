import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Loader2, Save, Puzzle } from "lucide-react";
import { toast } from "sonner";

interface Component {
  id: string;
  component_key: string;
  name: string;
  description: string;
  examples: string;
  pdf_url: string | null;
  display_order: number;
}

const ComponentsManager = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    examples: "",
  });

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { data, error } = await supabase
        .from("components")
        .select("*")
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

  const openEditDialog = (component: Component) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      description: component.description,
      examples: component.examples,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingComponent) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("components")
        .update({
          name: formData.name,
          description: formData.description,
          examples: formData.examples,
        })
        .eq("id", editingComponent.id);

      if (error) throw error;

      toast.success("Component updated successfully");
      setDialogOpen(false);
      fetchComponents();
    } catch (error) {
      console.error("Error saving component:", error);
      toast.error("Failed to save component");
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
          Components & Mapping
        </h1>
        <p className="text-muted-foreground mt-1">
          Edit descriptions and examples for each thinking component
        </p>
      </div>

      {/* Components Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {components.map((component) => (
          <Card key={component.id} className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Puzzle className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {component.name}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(component)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm text-foreground line-clamp-2">
                  {component.description}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Examples
                </p>
                <p className="text-sm text-foreground line-clamp-2">
                  {component.examples}
                </p>
              </div>
              {component.pdf_url && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs text-success">PDF attached</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Component Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Daily-Life Examples</Label>
              <Textarea
                value={formData.examples}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, examples: e.target.value }))
                }
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComponentsManager;
