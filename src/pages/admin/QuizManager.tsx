import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Upload, Layers } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  component_key: string | null;
  display_order: number;
  is_active: boolean;
}

interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  score: number;
  display_order: number;
}

interface Component {
  component_key: string;
  name: string;
  description: string;
}

const QuizManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Question dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    question_text: "",
    component_key: "",
    options: [
      { option_text: "", score: 1 },
      { option_text: "", score: 2 },
      { option_text: "", score: 3 },
      { option_text: "", score: 4 },
      { option_text: "", score: 5 },
    ],
  });

  // Create Component dialog
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [componentSaving, setComponentSaving] = useState(false);
  const [componentFormData, setComponentFormData] = useState({
    component_key: "",
    name: "",
    description: "",
  });

  // Upload PDF dialog
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFormData, setPdfFormData] = useState({
    title: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, optionsRes, componentsRes] = await Promise.all([
        supabase.from("questions").select("*").order("display_order"),
        supabase.from("question_options").select("*").order("display_order"),
        supabase.from("components").select("component_key, name, description").order("display_order"),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (optionsRes.error) throw optionsRes.error;
      if (componentsRes.error) throw componentsRes.error;

      setQuestions(questionsRes.data || []);
      setOptions(optionsRes.data || []);
      setComponents(componentsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load quiz data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: "",
      component_key: "",
      options: [
        { option_text: "", score: 1 },
        { option_text: "", score: 2 },
        { option_text: "", score: 3 },
        { option_text: "", score: 4 },
        { option_text: "", score: 5 },
      ],
    });
    setEditingQuestion(null);
  };

  const openEditDialog = (question: Question) => {
    const questionOptions = options
      .filter((o) => o.question_id === question.id)
      .sort((a, b) => a.display_order - b.display_order);

    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      component_key: question.component_key || "",
      options:
        questionOptions.length > 0
          ? questionOptions.map((o) => ({
              option_text: o.option_text,
              score: o.score || 1,
            }))
          : formData.options,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question_text.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (!formData.component_key) {
      toast.error("Please select a component");
      return;
    }

    const hasEmptyOption = formData.options.some((o) => !o.option_text.trim());
    if (hasEmptyOption) {
      toast.error("Please fill in all options");
      return;
    }

    const hasInvalidScore = formData.options.some((o) => o.score < 1 || o.score > 5);
    if (hasInvalidScore) {
      toast.error("All scores must be between 1 and 5");
      return;
    }

    setSaving(true);
    try {
      if (editingQuestion) {
        // Update existing question
        const { error: questionError } = await supabase
          .from("questions")
          .update({ 
            question_text: formData.question_text,
            component_key: formData.component_key,
          })
          .eq("id", editingQuestion.id);

        if (questionError) throw questionError;

        // Delete old options and insert new ones
        await supabase
          .from("question_options")
          .delete()
          .eq("question_id", editingQuestion.id);

        const newOptions = formData.options.map((o, index) => ({
          question_id: editingQuestion.id,
          option_text: o.option_text,
          score: o.score,
          display_order: index + 1,
        }));

        const { error: optionsError } = await supabase
          .from("question_options")
          .insert(newOptions);

        if (optionsError) throw optionsError;

        toast.success("Question updated successfully");
      } else {
        // Create new question
        const maxOrder = Math.max(...questions.map((q) => q.display_order), 0);

        const { data: newQuestion, error: questionError } = await supabase
          .from("questions")
          .insert({
            question_text: formData.question_text,
            component_key: formData.component_key,
            display_order: maxOrder + 1,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        const newOptions = formData.options.map((o, index) => ({
          question_id: newQuestion.id,
          option_text: o.option_text,
          score: o.score,
          display_order: index + 1,
        }));

        const { error: optionsError } = await supabase
          .from("question_options")
          .insert(newOptions);

        if (optionsError) throw optionsError;

        toast.success("Question added successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast.success("Question deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Create Component handlers
  const resetComponentForm = () => {
    setComponentFormData({
      component_key: "",
      name: "",
      description: "",
    });
  };

  const validateComponentKey = (key: string): boolean => {
    const snakeCaseRegex = /^[a-z][a-z0-9_]*$/;
    return snakeCaseRegex.test(key);
  };

  const handleCreateComponent = async () => {
    if (!componentFormData.component_key.trim()) {
      toast.error("Please enter a component key");
      return;
    }

    if (!validateComponentKey(componentFormData.component_key)) {
      toast.error("Component key must be lowercase snake_case (e.g., my_component)");
      return;
    }

    if (!componentFormData.name.trim()) {
      toast.error("Please enter a component name");
      return;
    }

    // Check for uniqueness
    const existingComponent = components.find(
      (c) => c.component_key === componentFormData.component_key
    );
    if (existingComponent) {
      toast.error("A component with this key already exists");
      return;
    }

    setComponentSaving(true);
    try {
      const maxOrder = Math.max(...components.map((c, i) => i + 1), 0);
      
      // Note: component_key must match the enum - for custom components, 
      // we insert without component_key enum constraint validation on client side
      const { error } = await supabase.from("components").insert({
        component_key: componentFormData.component_key as any,
        name: componentFormData.name,
        description: componentFormData.description || "",
        display_order: maxOrder + 1,
      });

      if (error) throw error;

      toast.success("Component created successfully");
      setComponentDialogOpen(false);
      resetComponentForm();
      fetchData();
    } catch (error: any) {
      console.error("Error creating component:", error);
      if (error.code === "23505") {
        toast.error("A component with this key already exists");
      } else {
        toast.error("Failed to create component");
      }
    } finally {
      setComponentSaving(false);
    }
  };

  // Upload PDF handlers
  const resetPdfForm = () => {
    setPdfFormData({
      title: "",
      file: null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      setPdfFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFormData.file) {
      toast.error("Please select a PDF file");
      return;
    }

    setPdfUploading(true);
    try {
      const fileName = `${Date.now()}-${pdfFormData.file.name}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdf-modules")
        .upload(fileName, pdfFormData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("pdf-modules")
        .getPublicUrl(fileName);

      // Insert metadata into pdf_documents table
      const { error: insertError } = await supabase.from("pdf_documents").insert({
        title: pdfFormData.title || pdfFormData.file.name,
        file_url: urlData.publicUrl,
      });

      if (insertError) throw insertError;

      toast.success("PDF uploaded successfully");
      setPdfDialogOpen(false);
      resetPdfForm();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setPdfUploading(false);
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Quiz Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, or delete quiz questions
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Create Component Dialog */}
          <Dialog open={componentDialogOpen} onOpenChange={(open) => {
            setComponentDialogOpen(open);
            if (!open) resetComponentForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Layers className="h-4 w-4 mr-2" />
                Create Component
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Component</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Component Key</Label>
                  <Input
                    value={componentFormData.component_key}
                    onChange={(e) =>
                      setComponentFormData((prev) => ({
                        ...prev,
                        component_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                      }))
                    }
                    placeholder="e.g., my_component"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lowercase snake_case only (e.g., all_or_nothing)
                  </p>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={componentFormData.name}
                    onChange={(e) =>
                      setComponentFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Component display name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={componentFormData.description}
                    onChange={(e) =>
                      setComponentFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe this component..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setComponentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateComponent} disabled={componentSaving}>
                    {componentSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Component
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Upload PDF Dialog */}
          <Dialog open={pdfDialogOpen} onOpenChange={(open) => {
            setPdfDialogOpen(open);
            if (!open) resetPdfForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload PDF Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>PDF File</Label>
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Title (optional)</Label>
                  <Input
                    value={pdfFormData.title}
                    onChange={(e) =>
                      setPdfFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter PDF title..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If left empty, the filename will be used
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUploadPdf} disabled={pdfUploading || !pdfFormData.file}>
                    {pdfUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Upload PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Question Dialog */}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? "Edit Question" : "Add New Question"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div>
                  <Label>Component</Label>
                  <Select
                    value={formData.component_key}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, component_key: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a component..." />
                    </SelectTrigger>
                    <SelectContent>
                      {components.map((comp) => (
                        <SelectItem key={comp.component_key} value={comp.component_key}>
                          {comp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Question Text</Label>
                  <Input
                    value={formData.question_text}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        question_text: e.target.value,
                      }))
                    }
                    placeholder="Enter your question..."
                    className="mt-1"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Options (5 required)</Label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <Input
                        value={option.option_text}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index].option_text = e.target.value;
                          setFormData((prev) => ({ ...prev, options: newOptions }));
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">
                          Score:
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={option.score}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[index].score = Math.min(5, Math.max(1, parseInt(e.target.value) || 1));
                            setFormData((prev) => ({ ...prev, options: newOptions }));
                          }}
                          className="w-16"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingQuestion ? "Update" : "Create"} Question
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No questions yet. Add your first question to get started.
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => {
            const questionOptions = options
              .filter((o) => o.question_id === question.id)
              .sort((a, b) => a.display_order - b.display_order);
            const component = components.find(
              (c) => c.component_key === question.component_key
            );
            return (
              <Card key={question.id} className="animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Q{question.display_order}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">
                          {question.question_text}
                        </CardTitle>
                        {component && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
                            {component.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(question)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 pl-10">
                    {questionOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between text-sm py-1.5 px-3 bg-secondary/50 rounded-lg"
                      >
                        <span className="text-foreground">{opt.option_text}</span>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                          Score: {opt.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuizManager;
