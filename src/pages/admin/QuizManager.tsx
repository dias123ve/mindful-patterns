// src/components/QuizManager.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  display_order: number;
  is_active: boolean;
  component_id?: string | null;
}

interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  score: number | null;
  display_order: number;
}

interface ComponentRow {
  id: string;
  name: string;
  type: string;
  // other fields ignored
}

const QuizManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formData, setFormData] = useState({
    question_text: "",
    component_id: "",
    options: [
      { option_text: "", score: 1 },
      { option_text: "", score: 2 },
      { option_text: "", score: 3 },
      { option_text: "", score: 4 },
      { option_text: "", score: 5 },
    ],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch questions, options, components in parallel
      const [questionsRes, optionsRes, componentsRes] = await Promise.all([
  supabase.from("quiz_questions").select("*").order("display_order"),
  supabase.from("quiz_question_options").select("*").order("display_order"),
  supabase.from("components").select("id,name,type").order("name"),
]);


console.log("componentsRes", componentsRes);

      
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
      component_id: "",
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

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (question: Question) => {
    const questionOptions = options
      .filter((o) => o.question_id === question.id)
      .sort((a, b) => a.display_order - b.display_order);

    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      component_id: question.component_id || "",
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

    // component selection optional or required? currently allow empty (nullable). If you want required, uncomment below:
    // if (!formData.component_id) { toast.error("Please select a related component"); return; }

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
            component_id: formData.component_id || null,
          })
          .eq("id", editingQuestion.id);

        if (questionError) throw questionError;

        // Delete old options and insert new ones
        const { error: deleteError } = await supabase
          .from("question_options")
          .delete()
          .eq("question_id", editingQuestion.id);

        if (deleteError) throw deleteError;

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
        const maxOrder =
          questions.length > 0
            ? Math.max(...questions.map((q) => q.display_order))
            : 0;

        const { data: newQuestion, error: questionError } = await supabase
          .from("questions")
          .insert({
            question_text: formData.question_text,
            component_id: formData.component_id || null,
            display_order: (maxOrder || 0) + 1,
          })
          .select()
          .single();

        if (questionError) throw questionError;
        if (!newQuestion) throw new Error("Failed to create question");

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
      // optionally delete options first to avoid foreign key constraints
      await supabase.from("quiz_question_options").delete().eq("question_id", questionId);

      const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);

      if (error) throw error;

      toast.success("Question deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const getQuestionOptions = (questionId: string) => {
    return options
      .filter((o) => o.question_id === questionId)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const findComponentName = (component_id?: string | null) => {
    if (!component_id) return "—";
    return components.find((c) => c.id === component_id)?.name || "—";
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
            Create, edit, and delete quiz questions
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Questions Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Options</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No questions yet. Click "Add Question" to create one.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question, index) => {
                const questionOptions = getQuestionOptions(question.id);
                return (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate">{question.question_text}</p>
                    </TableCell>
                    <TableCell>{findComponentName(question.component_id)}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {questionOptions.slice(0, 3).map((opt, i) => (
                          <div key={opt.id}>
                            {i + 1}. {opt.option_text.slice(0, 30)}
                            {opt.option_text.length > 30 && "..."} 
                            <span className="text-primary ml-1">(score: {opt.score})</span>
                          </div>
                        ))}
                        {questionOptions.length > 3 && (
                          <div className="text-muted-foreground">
                            +{questionOptions.length - 3} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(question.id)}
                          className="text-destructive hover:text-destructive"
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

      {/* Add/Edit Question Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={formData.question_text}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    question_text: e.target.value,
                  }))
                }
                placeholder="Enter your question..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Related Component (optional)</Label>
                <select
                  value={formData.component_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, component_id: e.target.value }))
                  }
                  className="mt-1 w-full border rounded p-2 bg-background"
                >
                  <option value="">Select component…</option>
                  {components.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.type ? `(${c.type})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                {/* placeholder to keep grid layout balanced; remove or use for another field */}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label>Answer Options (5 required)</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      value={option.option_text}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index].option_text = e.target.value;
                        setFormData((prev) => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={option.score}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index].score = parseInt(e.target.value) || 1;
                        setFormData((prev) => ({ ...prev, options: newOptions }));
                      }}
                      placeholder="Score"
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Each option requires a score from 1-5
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingQuestion ? "Update Question" : "Add Question"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizManager;
