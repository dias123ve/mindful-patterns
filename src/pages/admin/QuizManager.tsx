import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  display_order: number;
  is_active: boolean;
}

interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  component_key: string;
  display_order: number;
}

interface Component {
  component_key: string;
  name: string;
}

const COMPONENT_KEYS = [
  "all_or_nothing",
  "overgeneralization",
  "mental_filter",
  "disqualifying_positive",
  "jumping_conclusions",
  "magnification",
  "emotional_reasoning",
  "should_statements",
  "labeling",
  "personalization",
];

const QuizManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    question_text: "",
    options: [
      { option_text: "", component_key: "all_or_nothing" },
      { option_text: "", component_key: "overgeneralization" },
      { option_text: "", component_key: "mental_filter" },
      { option_text: "", component_key: "disqualifying_positive" },
      { option_text: "", component_key: "jumping_conclusions" },
    ],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, optionsRes, componentsRes] = await Promise.all([
        supabase.from("questions").select("*").order("display_order"),
        supabase.from("question_options").select("*").order("display_order"),
        supabase.from("components").select("component_key, name").order("display_order"),
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
      options: [
        { option_text: "", component_key: "all_or_nothing" },
        { option_text: "", component_key: "overgeneralization" },
        { option_text: "", component_key: "mental_filter" },
        { option_text: "", component_key: "disqualifying_positive" },
        { option_text: "", component_key: "jumping_conclusions" },
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
      options:
        questionOptions.length > 0
          ? questionOptions.map((o) => ({
              option_text: o.option_text,
              component_key: o.component_key,
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

    const hasEmptyOption = formData.options.some((o) => !o.option_text.trim());
    if (hasEmptyOption) {
      toast.error("Please fill in all options");
      return;
    }

    try {
      if (editingQuestion) {
        // Update existing question
        const { error: questionError } = await supabase
          .from("questions")
          .update({ question_text: formData.question_text })
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
          component_key: o.component_key as "all_or_nothing" | "overgeneralization" | "mental_filter" | "disqualifying_positive" | "jumping_conclusions" | "magnification" | "emotional_reasoning" | "should_statements" | "labeling" | "personalization",
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
            display_order: maxOrder + 1,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        const newOptions = formData.options.map((o, index) => ({
          question_id: newQuestion.id,
          option_text: o.option_text,
          component_key: o.component_key as "all_or_nothing" | "overgeneralization" | "mental_filter" | "disqualifying_positive" | "jumping_conclusions" | "magnification" | "emotional_reasoning" | "should_statements" | "labeling" | "personalization",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Quiz Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, or delete quiz questions
          </p>
        </div>

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
                  <div key={index} className="flex gap-3">
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
                    <Select
                      value={option.component_key}
                      onValueChange={(value) => {
                        const newOptions = [...formData.options];
                        newOptions[index].component_key = value;
                        setFormData((prev) => ({ ...prev, options: newOptions }));
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
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
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingQuestion ? "Update" : "Create"} Question
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
          questions.map((question, index) => {
            const questionOptions = options.filter(
              (o) => o.question_id === question.id
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
                      <CardTitle className="text-base font-medium">
                        {question.question_text}
                      </CardTitle>
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
                    {questionOptions.map((opt) => {
                      const comp = components.find(
                        (c) => c.component_key === opt.component_key
                      );
                      return (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between text-sm py-1.5 px-3 bg-secondary/50 rounded-lg"
                        >
                          <span className="text-foreground">{opt.option_text}</span>
                          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                            {comp?.name || opt.component_key}
                          </span>
                        </div>
                      );
                    })}
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
