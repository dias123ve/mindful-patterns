// src/components/QuizManager.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
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
      const [questionsRes, optionsRes, componentsRes] = await Promise.all([
        supabase.from("quiz_questions").select("*").order("display_order"),
        supabase.from("quiz_question_options").select("*").order("display_order"),
        supabase.from("components").select("id,name,type").order("name"),
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

    if (formData.options.some((o) => !o.option_text.trim())) {
      toast.error("Please fill in all answer options");
      return;
    }

    setSaving(true);
    try {
      if (editingQuestion) {
        // UPDATE QUESTION
        const { error: questionError } = await supabase
          .from("quiz_questions")
          .update({
            question_text: formData.question_text,
            component_id: formData.component_id || null,
            quiz_id: import.meta.env.VITE_QUIZ_ID,
          })
          .eq("id", editingQuestion.id);

        if (questionError) throw questionError;

        // DELETE OLD OPTIONS
        const { error: deleteError } = await supabase
          .from("quiz_question_options")
          .delete()
          .eq("question_id", editingQuestion.id);

        if (deleteError) throw deleteError;

        // INSERT NEW OPTIONS
        const newOptions = formData.options.map((o, index) => ({
          question_id: editingQuestion.id,
          option_text: o.option_text,
          score: o.score,
          display_order: index + 1,
        }));

        const { error: optionsError } = await supabase
          .from("quiz_question_options")
          .insert(newOptions);

        if (optionsError) throw optionsError;

        toast.success("Question updated");
      } else {
        // CREATE NEW QUESTION
        const maxOrder =
          questions.length > 0
            ? Math.max(...questions.map((q) => q.display_order))
            : 0;

        const { data: newQuestion, error: questionError } = await supabase
          .from("quiz_questions")
          .insert({
            question_text: formData.question_text,
            component_id: formData.component_id || null,
            display_order: maxOrder + 1,
            quiz_id: import.meta.env.VITE_QUIZ_ID,
          })
          .select()
          .single();

        if (questionError) throw questionError;
        if (!newQuestion) throw new Error("Insert returned null");

        // INSERT OPTIONS
        const newOptions = formData.options.map((o, index) => ({
          question_id: newQuestion.id,
          option_text: o.option_text,
          score: o.score,
          display_order: index + 1,
        }));

        const { error: optionsError } = await supabase
          .from("quiz_question_options")
          .insert(newOptions);

        if (optionsError) throw optionsError;

        toast.success("Question added");
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
  console.error("🔴 SAVE ERROR FULL:", error);

  // Print all Supabase error details if available
  console.log("Message:", error?.message);
  console.log("Details:", error?.details);
  console.log("Hint:", error?.hint);
  console.log("Code:", error?.code);

  toast.error("Failed to save question");
} finally {

      setSaving(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;

    try {
      await supabase.from("quiz_question_options").delete().eq("question_id", questionId);
      const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);

      if (error) throw error;

      toast.success("Question deleted");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete question");
    }
  };

  const getQuestionOptions = (questionId: string) =>
    options
      .filter((o) => o.question_id === questionId)
      .sort((a, b) => a.display_order - b.display_order);

  const findComponentName = (component_id?: string | null) =>
    components.find((c) => c.id === component_id)?.name || "—";

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
            Manage questions and options
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  No questions yet.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q, i) => {
                const qOpts = getQuestionOptions(q.id);
                return (
                  <TableRow key={q.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{q.question_text}</TableCell>
                    <TableCell>{findComponentName(q.component_id)}</TableCell>
                    <TableCell>
                      {qOpts.map((o) => (
                        <div key={o.id}>
                          • {o.option_text} ({o.score})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(q.id)}
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

      {/* DIALOG */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label>Question Text</Label>
              <Textarea
                rows={3}
                value={formData.question_text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question_text: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Related Component (optional)</Label>
              <select
                value={formData.component_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, component_id: e.target.value }))
                }
                className="border rounded p-2 w-full"
              >
                <option value="">Select…</option>
                {components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Answer Options (5)</Label>
              <div className="space-y-3">
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      className="flex-1"
                      placeholder={`Option ${idx + 1}`}
                      value={opt.option_text}
                      onChange={(e) => {
                        const clone = [...formData.options];
                        clone[idx].option_text = e.target.value;
                        setFormData((prev) => ({ ...prev, options: clone }));
                      }}
                    />
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={opt.score}
                      className="w-20"
                      onChange={(e) => {
                        const clone = [...formData.options];
                        clone[idx].score = Number(e.target.value);
                        setFormData((prev) => ({ ...prev, options: clone }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={saving} onClick={handleSave}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingQuestion ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizManager;
