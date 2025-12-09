// ================= QUIZ MANAGER — FINAL FIX (Order Working) =================

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

  // FORM STATE
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

  // ORDER STATE
  const [localOrder, setLocalOrder] = useState<Record<string, number>>({});

  // ========================= FETCH DATA =========================

  const fetchData = async () => {
    setLoading(true);

    try {
      const [questionsRes, optionsRes, componentsRes, qComponentsRes] =
        await Promise.all([
          supabase.from("quiz_questions").select("*"),
          supabase.from("quiz_question_options").select("*"),
          supabase.from("components").select("*").order("name"),
          supabase.from("quiz_question_components").select("*"),
        ]);

      if (questionsRes.error) throw questionsRes.error;

      const qdata = (questionsRes.data || []).map((q: any, idx: number) => ({
        ...q,
        display_order: q.display_order ?? idx + 1,
      }));

      setQuestions(qdata);
      setOptions(optionsRes.data || []);
      setComponents(componentsRes.data || []);
      setQuestionComponents(qComponentsRes.data || []);

      const map: Record<string, number> = {};
      qdata.forEach(q => (map[q.id] = q.display_order));
      setLocalOrder(map);

    } catch (err) {
      console.error("fetchData error:", err);
      toast.error("Failed loading data");
    }

    setLoading(false);
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

  // ========================= OPEN DIALOGS =========================

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (q: Question) => {
    const qOpts = options
      .filter(o => o.question_id === q.id)
      .sort((a, b) => a.display_order - b.display_order);

    const qComps = questionComponents
      .filter(c => c.question_id === q.id)
      .map(c => c.component_id);

    setEditingQuestion(q);
    setSelectedComponents(qComps);

    setFormData({
      question_text: q.question_text,
      category: q.category ?? "",
      options:
        qOpts.length > 0
          ? qOpts.map(o => ({ option_text: o.option_text, score: o.score ?? 0 }))
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
        await supabase.from("quiz_questions").update({
          question_text: formData.question_text,
          category: formData.category || null,
        }).eq("id", editingQuestion.id);

        await supabase.from("quiz_question_options").delete().eq("question_id", editingQuestion.id);
        await supabase.from("quiz_question_components").delete().eq("question_id", editingQuestion.id);
      } else {
        const maxOrder =
          questions.length > 0
            ? Math.max(...questions.map(q => q.display_order ?? 0))
            : 0;

        const { data } = await supabase
          .from("quiz_questions")
          .insert({
            question_text: formData.question_text,
            category: formData.category || null,
            display_order: maxOrder + 1,
          })
          .select()
          .single();

        questionId = data.id;
      }

      if (!questionId) throw new Error("Missing question ID");

      const optsToInsert = formData.options.map((o, i) => ({
        question_id: questionId!,
        option_text: o.option_text,
        score: o.score,
        display_order: i + 1,
      }));
      await supabase.from("quiz_question_options").insert(optsToInsert);

      const compsToInsert = selectedComponents.map(cid => ({
        question_id: questionId!,
        component_id: cid,
      }));
      await supabase.from("quiz_question_components").insert(compsToInsert);

      toast.success(editingQuestion ? "Question updated" : "Question added");
      setDialogOpen(false);
      resetForm();
      fetchData();

    } catch (err) {
      console.error(err);
      toast.error("Failed saving");
    }

    setSaving(false);
  };

  // ========================= DELETE QUESTION =========================

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;

    await supabase.from("quiz_question_options").delete().eq("question_id", id);
    await supabase.from("quiz_question_components").delete().eq("question_id", id);
    await supabase.from("quiz_questions").delete().eq("id", id);

    toast.success("Deleted");
    fetchData();
  };

  // ========================= AUTO-SAVE ORDER (onBlur) =========================

  const handleOrderChange = async (changedId: string, newValue: number) => {
    const raw = newValue;

    if (!raw || isNaN(raw) || raw < 1) {
      toast.error("Invalid order number");
      return;
    }

    // Build array of updated orders
    const arr = questions.map(q => ({
      id: q.id,
      inputOrder: q.id === changedId ? raw : localOrder[q.id] ?? q.display_order,
    }));

    // Sort by new order
    arr.sort((a, b) => a.inputOrder - b.inputOrder);

    // Normalize into 1..N
    const updates = arr.map((item, i) => ({
      id: item.id,
      display_order: i + 1,
    }));

    setSavingOrder(true);
    try {
      await supabase.from("quiz_questions").upsert(updates);
      toast.success("Order updated");
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed updating order");
    }
    setSavingOrder(false);
  };

  // ========================= UI HELPERS =========================

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedQuestions = [...questions].sort(
    (a, b) => a.display_order - b.display_order
  );

  const getOptionList = (id: string) =>
    options
      .filter(o => o.question_id === id)
      .sort((a, b) => a.display_order - b.display_order);

  const getComponentNames = (qid: string) => {
    const ids = questionComponents
      .filter(x => x.question_id === qid)
      .map(x => x.component_id);

    return components
      .filter(c => ids.includes(c.id))
      .map(c => c.name)
      .join(", ");
  };

  // ========================= UI =========================

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quiz Manager</h1>
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
                <TableCell colSpan={7} className="text-center py-6">
                  N
