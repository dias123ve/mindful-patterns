// ================= QUIZ MANAGER — FINAL (with Normalized Order) =================

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
  const [savingOrder, setSavingOrder] = useState(false);

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

  // LOCAL ORDER MAP: questionId -> input order (number). We'll normalize on save.
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

      // Ensure there's a display_order (fallback to index if missing)
      const qdata = (questionsRes.data || []).map((q: any, idx: number) => ({
        ...q,
        display_order: typeof q.display_order === "number" ? q.display_order : idx + 1,
      }));

      setQuestions(qdata);
      setOptions(optionsRes.data || []);
      setComponents(componentsRes.data || []);
      setQuestionComponents(qComponentsRes.data || []);

      // Initialize localOrder map from fetched questions (keep existing ordering)
      const map: Record<string, number> = {};
      qdata.forEach((q: Question) => {
        map[q.id] = q.display_order ?? 0;
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
    const qOpts = options.filter(o => o.question_id === q.id).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const qComps = questionComponents
      .filter(c => c.question_id === q.id)
      .map(c => c.component_id);

    setEditingQuestion(q);
    setSelectedComponents(qComps);

    setFormData({
      question_text: q.question_text,
      category: q.category || "",
      options: qOpts.length > 0 ? qOpts.map(o => ({ option_text: o.option_text, score: o.score || 0 })) : [
        { option_text: "", score: 1 },
        { option_text: "", score: 2 },
        { option_text: "", score: 3 },
      ],
    });

    setDialogOpen(true);
  };

  // ========================= SAVE =========================

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
      toast.error("Choose at least 1 component (use Assign Components)");
      return;
    }

    setSaving(true);
    try {
      let questionId = editingQuestion?.id;

      if (editingQuestion) {
        // UPDATE QUESTION
        const { error } = await supabase
          .from("quiz_questions")
          .update({
            question_text: formData.question_text,
            category: formData.category || null,
          })
          .eq("id", editingQuestion.id);

        if (error) throw error;

        // DELETE OLD OPTIONS + COMPONENTS (we'll insert fresh)
        const { error: delOptErr } = await supabase
          .from("quiz_question_options")
          .delete()
          .eq("question_id", editingQuestion.id);
        if (delOptErr) throw delOptErr;

        const { error: delCompErr } = await supabase
          .from("quiz_question_components")
          .delete()
          .eq("question_id", editingQuestion.id);
        if (delCompErr) throw delCompErr;
      } else {
        // INSERT NEW QUESTION
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

      if (!questionId) throw new Error("Missing question ID");

      // INSERT OPTIONS
      const newOptions = formData.options.map((o, i) => ({
        question_id: questionId,
        option_text: o.option_text,
        score: o.score,
        display_order: i + 1,
      }));

      const { error: optInsertErr } = await supabase
        .from("quiz_question_options")
        .insert(newOptions);
      if (optInsertErr) throw optInsertErr;

      // INSERT COMPONENTS (relations)
      const newComps = selectedComponents.map(cid => ({
        question_id: questionId!,
        component_id: cid,
      }));

      const { error: compInsertErr } = await supabase
        .from("quiz_question_components")
        .insert(newComps);
      if (compInsertErr) throw compInsertErr;

      toast.success(editingQuestion ? "Question updated" : "Question added");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("handleSave error:", err);
      toast.error("Failed saving");
    } finally {
      setSaving(false);
    }
  };

  // ========================= DELETE =========================

  const handleDelete = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;

    try {
      // delete options
      const { error: delOptsErr } = await supabase
        .from("quiz_question_options")
        .delete()
        .eq("question_id", questionId);
      if (delOptsErr) throw delOptsErr;

      // delete components relations
      const { error: delCompsErr } = await supabase
        .from("quiz_question_components")
        .delete()
        .eq("question_id", questionId);
      if (delCompsErr) throw delCompsErr;

      // delete question
      const { error: delQErr } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", questionId);
      if (delQErr) throw delQErr;

      toast.success("Question deleted");
      fetchData();
    } catch (err) {
      console.error("handleDelete error:", err);
      toast.error("Failed to delete question");
    }
  };

  // ========================= SAVE ORDER (Normalized) =========================
  /**
   * Normalization logic:
   * - Take localOrder map (questionId -> input number)
   * - For any missing entries, use existing display_order or large number
   * - Build array of { id, inputOrder }
   * - Sort ascending by inputOrder, fallback by existing display_order then id
   * - Reassign sequential display_order starting from 1
   * - Upsert to supabase
   */
  const saveOrder = async () => {
    // Validate inputs
    const entries = Object.entries(localOrder);
    if (entries.length === 0) {
      toast.error("No order to save");
      return;
    }

    // Build normalized array
    const arr = questions.map(q => {
      const raw = localOrder[q.id];
      // If user empties input or NaN, fallback to current display_order
      const inputOrder = typeof raw === "number" && !isNaN(raw) ? raw : q.display_order ?? 999999;
      return { id: q.id, inputOrder, currentOrder: q.display_order ?? 999999 };
    });

    // Validate all inputOrder are positive integers
    for (const item of arr) {
      if (!Number.isFinite(item.inputOrder) || item.inputOrder <= 0) {
        toast.error("All orders must be positive numbers (>= 1)");
        return;
      }
    }

    // Sort by inputOrder asc, tie-breaker by currentOrder asc, then id
    arr.sort((a, b) => {
      if (a.inputOrder !== b.inputOrder) return a.inputOrder - b.inputOrder;
      if (a.currentOrder !== b.currentOrder) return a.currentOrder - b.currentOrder;
      return a.id.localeCompare(b.id);
    });

    // Reassign sequential display_order
    const updates = arr.map((item, idx) => ({
      id: item.id,
      display_order: idx + 1,
    }));

    setSavingOrder(true);
    try {
      const { error } = await supabase.from("quiz_questions").upsert(updates);
      if (error) throw error;

      toast.success("Order updated and normalized");
      // Refresh data (this will also reset localOrder)
      await fetchData();
    } catch (err) {
      console.error("saveOrder error:", err);
      toast.error("Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  // ========================= UI HELPERS =========================

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // For display, sort by display_order
  const sortedQuestions = [...questions].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  // Quick helper
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

        <div className="flex items-center gap-2">
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>

          <Button
            variant="outline"
            onClick={saveOrder}
            disabled={savingOrder}
          >
            {savingOrder ? "Saving..." : "Save Order"}
          </Button>
        </div>
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

                    {/* ORDER INPUT */}
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24"
                        value={localOrder[q.id] ?? q.display_order ?? i + 1}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setLocalOrder(prev => ({ ...prev, [q.id]: Number.isNaN(v) ? 0 : v }));
                        }}
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

      {/* DIALOG FORM (Create / Edit) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add Question"}
            </DialogTitle>
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

            {/* ASSIGN COMPONENTS BUTTON (opens separate popup) */}
            <div>
              <Label>Components</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setComponentDialogOpen(true)}>
                  Assign Components
                </Button>
                <div className="text-sm text-muted-foreground">
                  {selectedComponents.length === 0 ? "No components selected" : `${selectedComponents.length} selected`}
                </div>
              </div>
            </div>

            {/* QUESTION TEXT */}
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
                    onClick={() =>
                      setFormData({
                        ...formData,
                        options: formData.options.filter((_, idx) => idx !== i),
                      })
                    }
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingQuestion ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* DIALOG: Assign Components (separate) */}
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
                      prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                    )
                  }
                />
                <div>{c.name}</div>
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
