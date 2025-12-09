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
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

// TYPES
interface Question {
  id: string;
  question_text: string;
  category: string | null;
  display_order: number;
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

interface QuestionComponent {
  id?: string;
  question_id: string;
  component_id: string;
}

const QuizManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [questionComponents, setQuestionComponents] = useState<QuestionComponent[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // 🔥 STATE FORM
  const [formData, setFormData] = useState({
    question_text: "",
    category: "",
    options: [
      { option_text: "", score: 1 },
      { option_text: "", score: 2 },
      { option_text: "", score: 3 },
    ],
  });

  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  // LOCAL ORDER MAP
  const [localOrder, setLocalOrder] = useState<Record<string, number>>({});

  // ========================= FETCH DATA =========================

  const fetchData = async () => {
    setLoading(true);

    try {
      const [questionsRes, optionsRes, componentsRes, qComponentsRes] =
        await Promise.all([
          supabase.from("quiz_questions").select("*"),
          supabase.from("quiz_question_options").select("*"),
          supabase.from("components").select("id,name,component_key").order("name"),
          supabase.from("quiz_question_components").select("*"),
        ]);

      if (questionsRes.error) throw questionsRes.error;
      if (optionsRes.error) throw optionsRes.error;
      if (componentsRes.error) throw componentsRes.error;
      if (qComponentsRes.error) throw qComponentsRes.error;

      // Ensure display_order exists
      const sorted = (questionsRes.data || []).sort(
        (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
      );

      setQuestions(sorted);
      setOptions(optionsRes.data || []);
      setComponents(componentsRes.data || []);
      setQuestionComponents(qComponentsRes.data || []);

      // Init local order
      const map: Record<string, number> = {};
      sorted.forEach(q => {
        map[q.id] = q.display_order ?? 1;
      });
      setLocalOrder(map);
    } catch (err) {
      console.error("fetchData error:", err);
      toast.error("Failed loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ========================= RESET FORM =========================
  const resetForm = () => {
    setFormData({
      question_text: "",
      category: "",
      options: [
        { option_text: "", score: 1 },
        { option_text: "", score: 2 },
        { option_text: "", score: 3 },
      ],
    });
    setSelectedComponents([]);
    setEditingQuestion(null);
  };

  // OPEN CREATE
  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // OPEN EDIT
  const openEditDialog = (q: Question) => {
    const qOpts = options
      .filter(o => o.question_id === q.id)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    const qComps = questionComponents
      .filter(c => c.question_id === q.id)
      .map(c => c.component_id);

    setEditingQuestion(q);
    setSelectedComponents(qComps);

    setFormData({
      question_text: q.question_text,
      category: q.category || "",
      options:
        qOpts.length > 0
          ? qOpts.map(o => ({
              option_text: o.option_text,
              score: o.score || 0,
            }))
          : [
              { option_text: "", score: 1 },
              { option_text: "", score: 2 },
              { option_text: "", score: 3 },
            ],
    });

    setDialogOpen(true);
  };

  // ========================= SAVE QUESTION =========================

  const handleSave = async () => {
    if (!formData.question_text.trim()) {
      toast.error("Write a question");
      return;
    }

    if (formData.options.some(o => !o.option_text.trim())) {
      toast.error("Fill all option text");
      return;
    }

    if (selectedComponents.length === 0) {
      toast.error("Choose at least 1 component");
      return;
    }

    setSaving(true);

    try {
      let questionId = editingQuestion?.id;

      if (editingQuestion) {
        const { error } = await supabase
          .from("quiz_questions")
          .update({
            question_text: formData.question_text,
            category: formData.category || null,
          })
          .eq("id", editingQuestion.id);
        if (error) throw error;

        await supabase.from("quiz_question_options").delete().eq("question_id", editingQuestion.id);
        await supabase.from("quiz_question_components").delete().eq("question_id", editingQuestion.id);
      } else {
        const maxOrder = questions.length
          ? Math.max(...questions.map(q => q.display_order ?? 0))
          : 0;

        const { data, error } = await supabase
          .from("quiz_questions")
          .insert({
            question_text: formData.question_text,
            category: formData.category || null,
            display_order: maxOrder + 1,
          })
          .select()
          .single();

        if (error) throw error;
        questionId = data.id;
      }

      if (!questionId) return;

      // Insert options
      const newOptions = formData.options.map((o, i) => ({
        question_id: questionId!,
        option_text: o.option_text,
        score: o.score,
        display_order: i + 1,
      }));

      await supabase.from("quiz_question_options").insert(newOptions);

      // Insert components
      const newComps = selectedComponents.map(cid => ({
        question_id: questionId!,
        component_id: cid,
      }));
      await supabase.from("quiz_question_components").insert(newComps);

      toast.success(editingQuestion ? "Question updated" : "Question added");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed saving");
    } finally {
      setSaving(false);
    }
  };

  // ========================= DELETE QUESTION =========================

  const handleDelete = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;

    try {
      await supabase.from("quiz_question_options").delete().eq("question_id", questionId);
      await supabase.from("quiz_question_components").delete().eq("question_id", questionId);
      await supabase.from("quiz_questions").delete().eq("id", questionId);

      toast.success("Deleted");
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed deleting");
    }
  };

  // ========================= AUTO-SAVE ORDER ON BLUR =========================

  const handleOrderChange = async (changedId: string) => {
    const raw = localOrder[changedId];

    if (!raw || raw <= 0) {
      toast.error("Order must be >= 1");
      return;
    }

    // Build sort array
    const arr = questions.map(q => ({
      id: q.id,
      inputOrder: localOrder[q.id] ?? q.display_order,
      currentOrder: q.display_order,
    }));

    // Sort
    arr.sort((a, b) => {
      if (a.inputOrder !== b.inputOrder) return a.inputOrder - b.inputOrder;
      return a.currentOrder - b.currentOrder;
    });

    // Normalize => 1,2,3,...
    const updates = arr.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
    }));

    try {
      const { error } = await supabase.from("quiz_questions").upsert(updates);
      if (error) throw error;

      toast.success("Order updated");

      await fetchData();
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Failed updating order");
    }
  };

  // ========================= UI =========================

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedQuestions = [...questions].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  const getOptionList = (id: string) =>
    options.filter(o => o.question_id === id).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const getComponentNames = (qid: string) => {
    const compIds = questionComponents
      .filter(x => x.question_id === qid)
      .map(x => x.component_id);

    return components
      .filter(c => compIds.includes(c.id))
      .map(c => c.name)
      .join(", ");
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quiz Manager</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" /> Add Question
        </Button>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Components</TableHead>
              <TableHead>Options</TableHead>
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
                const opts = getOptionList(q.id);
                return (
                  <TableRow key={q.id}>
                    <TableCell>{i + 1}</TableCell>

                    {/* ORDER INPUT (auto save onBlur) */}
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24"
                        value={localOrder[q.id] ?? q.display_order}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setLocalOrder(prev => ({ ...prev, [q.id]: v }));
                        }}
                        onBlur={() => handleOrderChange(q.id)}
                      />
                    </TableCell>

                    <TableCell className="max-w-xs truncate">{q.question_text}</TableCell>
                    <TableCell>{q.category || "—"}</TableCell>
                    <TableCell>{getComponentNames(q.id) || "—"}</TableCell>
                    <TableCell>
                      {opts.slice(0, 3).map(o => (
                        <div key={o.id} className="text-xs">• {o.option_text} ({o.score})</div>
                      ))}
                      {opts.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{opts.length - 3} more
                        </div>
                      )}
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

      {/* DIALOG FORM */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">

            {/* CATEGORY */}
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. mindset, behavior, growth"
              />
            </div>

            {/* COMPONENTS */}
            <div>
              <Label>Components</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setComponentDialogOpen(true)}>
                  Assign Components
                </Button>
                <div className="text-sm text-muted-foreground">
                  {selectedComponents.length === 0
                    ? "No components selected"
                    : `${selectedComponents.length} selected`}
                </div>
              </div>
            </div>

            {/* QUESTION */}
            <div>
              <Label>Question</Label>
              <Textarea
                value={formData.question_text}
                onChange={e => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Tuliskan pertanyaan..."
              />
            </div>

            {/* OPTIONS */}
            <div>
              <Label>Options</Label>
              {formData.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mt-2">
                  <Input
                    value={opt.option_text}
                    onChange={(e) => {
                      const copy = [...formData.options];
                      copy[i].option_text = e.target.value;
                      setFormData({ ...formData, options: copy });
                    }}
                    placeholder={`Option ${i + 1}`}
                  />

                  <Input
                    type="number"
                    className="w-20"
                    value={opt.score}
                    onChange={(e) => {
                      const copy = [...formData.options];
                      copy[i].score = Number(e.target.value);
                      setFormData({ ...formData, options: copy });
                    }}
                  />

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        options: formData.options.filter((_, idx) => idx !== i),
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                className="mt-2"
                onClick={() =>
                  setFormData({
                    ...formData,
                    options: [
                      ...formData.options,
                      { option_text: "", score: formData.options.length + 1 },
                    ],
                  })
                }
              >
                + Add Option
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : editingQuestion ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ASSIGN COMPONENTS */}
      <Dialog open={componentDialogOpen} onOpenChange={setComponentDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Components</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            {components.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedComponents.includes(c.id)}
                  onChange={() =>
                    setSelectedComponents(prev =>
                      prev.includes(c.id)
                        ? prev.filter(x => x !== c.id)
                        : [...prev, c.id]
                    )
                  }
                />
                {c.name}
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setComponentDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizManager;
