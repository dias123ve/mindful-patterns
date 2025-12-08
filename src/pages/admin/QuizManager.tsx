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
  category: string | null;
  component_key: string | null;
  display_order: number;
  is_active: boolean;
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
  component_key: string;
}

const QuizManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
   const [editDialogOpen, setEditDialogOpen] = useState(false);

const [formData, setFormData] = useState({
  question_text: "",
  category: "",
  component_key: "",
  options: [
    { option_text: "", score: 1 },
    { option_text: "", score: 2 },
    { option_text: "", score: 3 },
  ],
});

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const [questionsRes, optionsRes, componentsRes] = await Promise.all([
      supabase
        .from("quiz_questions")
        .select("*")
        .order("display_order", { ascending: true }),

      supabase
        .from("quiz_question_options")
        .select("*")
        .order("display_order", { ascending: true }),

      supabase
        .from("components")
        .select("id, name, component_key")
        .order("name", { ascending: true }),
    ]);

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
      category: "",
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
      category: question.category || "",
      component_key: question.component_key || "",
      options:
        questionOptions.length > 0
          ? questionOptions.map((o) => ({
              option_text: o.option_text,
              score: o.score !== null && o.score !== undefined ? o.score : 0,
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
        // Update question
        const { error: questionError } = await supabase
          .from("quiz_questions")
          .update({
            question_text: formData.question_text,
            category: formData.category || null,
            component_key: formData.component_key || null,
          })
          .eq("id", editingQuestion.id);
        if (questionError) throw questionError;

        // Delete existing options
        const { error: deleteError } = await supabase
          .from("quiz_question_options")
          .delete()
          .eq("question_id", editingQuestion.id);
        if (deleteError) throw deleteError;

        // Insert new options
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
        // Insert new question
        const maxOrder =
          questions.length > 0
            ? Math.max(...questions.map((q) => q.display_order ?? 0))
            : 0;

        const { data: newQuestion, error: questionError } = await supabase
          .from("quiz_questions")
          .insert({
            question_text: formData.question_text,
            category: formData.category || null,
            component_key: formData.component_key || null,
            display_order: maxOrder + 1,
          })
          .select()
          .single();
        if (questionError) throw questionError;
        if (!newQuestion) throw new Error("Insert returned null");

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
    } catch (error) {
      console.error("SAVE ERROR:", error);
      toast.error("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;

    try {
      await supabase
        .from("quiz_question_options")
        .delete()
        .eq("question_id", questionId);

      const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", questionId);
      if (error) throw error;

      toast.success("Question deleted");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleChangeOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from("quiz_questions")
        .update({ display_order: newOrder })
        .eq("id", id);
      if (error) throw error;

      setQuestions((prev) =>
        prev
          .map((q) => (q.id === id ? { ...q, display_order: newOrder } : q))
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      );

      toast.success("Order updated");
    } catch (err) {
      console.error("update order error:", err);
      toast.error("Failed to update order");
    }
  };

  const getQuestionOptions = (questionId: string) =>
    options
      .filter((o) => o.question_id === questionId)
      .sort((a, b) => a.display_order - b.display_order);

  const findComponentName = (componentKey?: string | null) =>
    components.find((c) => c.component_key === componentKey)?.name || "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedQuestions = [...questions].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  No questions yet.
                </TableCell>
              </TableRow>
            ) : (
              sortedQuestions.map((q, i) => {
                const qOpts = getQuestionOptions(q.id);
                return (
                  <TableRow key={q.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{q.question_text}</p>
                    </TableCell>
                    <TableCell>{q.category || "—"}</TableCell>
                    <TableCell>{findComponentName(q.component_key)}</TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        {qOpts.slice(0, 3).map((o) => (
                          <div key={o.id} className="truncate">
                            • {o.option_text} ({o.score})
                          </div>
                        ))}
                        {qOpts.length > 3 && (
                          <div className="text-muted-foreground">
                            +{qOpts.length - 3} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-20">
                      <input
                        type="number"
                        value={q.display_order ?? ""}
                        onChange={(e) =>
                          handleChangeOrder(q.id, Number(e.target.value))
                        }
                        className="w-16 border rounded px-2 py-1 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(q)}
                        >
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

  {/* ==================== FORM QUESTION ===================== */}

<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
    </DialogHeader>

    <div className="grid gap-4 py-4">

      {/* CATEGORY + COMPONENTS DROPDOWN */}
      <div className="grid grid-cols-2 gap-4">

        {/* CATEGORY */}
        <div>
          <Label>Category</Label>
          <Input
            value={questionCategory}
            onChange={(e) => setQuestionCategory(e.target.value)}
            placeholder="e.g. mindset, behavior, growth"
          />
        </div>

        {/* COMPONENT DROPDOWN */}
        <div>
          <Label>Key (Component)</Label>
          <select
            value={questionKey}
            onChange={(e) => setQuestionKey(e.target.value)}
            className="block w-full border rounded-md px-3 py-2"
          >
            <option value="">-- pilih komponen --</option>

            {components.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* QUESTION TEXT */}
      <div>
        <Label>Question</Label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Tuliskan pertanyaan..."
        />
      </div>

      {/* OPTIONS */}
      <div>
        <Label>Options</Label>

        {options.map((opt, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <Input
              value={opt}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <Button
              variant="outline"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
            >
              Hapus
            </Button>
          </div>
        ))}

        <Button className="mt-2" onClick={addOption}>
          + Tambah opsi
        </Button>
      </div>
    </div>

    {/* SAVE BUTTON */}
    <DialogFooter>
      <Button onClick={handleSave}>
        {editingQuestion ? "Save Changes" : "Add Question"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


    </div>
  );
};

export default QuizManager;
