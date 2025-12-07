"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

type Question = {
  id: string;
  quiz_id: string | null;
  question_text: string;
};

type QuestionOption = {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
};

export default function QuestionManager({ quizId }: { quizId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [optionInputs, setOptionInputs] = useState<
    { id?: string; option_text: string; is_correct: boolean }[]
  >([]);

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  async function fetchQuestions() {
    setLoading(true);

    const { data: qData, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true });

    if (error) {
      toast.error("Load questions failed: " + error.message);
      setLoading(false);
      return;
    }

    setQuestions(qData || []);

    // Fetch options
    const { data: oData, error: oError } = await supabase
      .from("quiz_question_options")
      .select("*")
      .order("display_order", { ascending: true });

    if (oError) {
      toast.error("Load options failed: " + oError.message);
      setLoading(false);
      return;
    }

    setOptions(oData || []);
    setLoading(false);
  }

  function startEdit(question: Question) {
    setEditingQuestion(question);
    setQuestionText(question.question_text);

    const related = options.filter((o) => o.question_id === question.id);

    setOptionInputs(
      related.map((o) => ({
        id: o.id,
        option_text: o.option_text,
        is_correct: o.is_correct,
      }))
    );
  }

  function newQuestionForm() {
    setEditingQuestion(null);
    setQuestionText("");
    setOptionInputs([
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ]);
  }

  function updateOptionInput(index: number, key: string, value: any) {
    const copy = [...optionInputs];
    (copy as any)[index][key] = value;
    setOptionInputs(copy);
  }

  function addOption() {
    setOptionInputs([
      ...optionInputs,
      { option_text: "", is_correct: false },
    ]);
  }

  function removeOption(index: number) {
    setOptionInputs(optionInputs.filter((_, i) => i !== index));
  }

  async function saveQuestion() {
    if (!questionText.trim()) {
      toast.error("Question cannot be empty");
      return;
    }

    if (optionInputs.length === 0) {
      toast.error("At least one option required");
      return;
    }

    let questionId = editingQuestion?.id;

    // -----------------------------
    // INSERT OR UPDATE QUESTION
    // -----------------------------
    if (editingQuestion) {
      const { error } = await supabase
        .from("quiz_questions")
        .update({ question_text: questionText })
        .eq("id", questionId);

      if (error) {
        toast.error("Update question failed: " + error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("quiz_questions")
        .insert([{ quiz_id: quizId, question_text: questionText }])
        .select("*")
        .single();

      if (error) {
        toast.error("Insert question failed: " + error.message);
        return;
      }

      questionId = data.id;
    }

    // ------------------------------------
    // DELETE OLD OPTIONS (ONLY WHEN EDIT)
    // ------------------------------------
    if (editingQuestion) {
      const { error } = await supabase
        .from("quiz_question_options")
        .delete()
        .eq("question_id", questionId);

      if (error) {
        toast.error("Delete old options failed: " + error.message);
        return;
      }
    }

    // -----------------------------
    // INSERT NEW OPTIONS
    // -----------------------------
    const optionsToInsert = optionInputs.map((op, i) => ({
      question_id: questionId!,
      option_text: op.option_text,
      is_correct: op.is_correct,
      display_order: i + 1,
    }));

    const { error: optErr } = await supabase
      .from("quiz_question_options")
      .insert(optionsToInsert);

    if (optErr) {
      toast.error("Insert options failed: " + optErr.message);
      return;
    }

    toast.success("Saved!");

    // reload everything
    fetchQuestions();
    newQuestionForm();
  }

  // -----------------------------------
  // DELETE QUESTION
  // -----------------------------------
  async function deleteQuestion(questionId: string) {
    // delete options first
    const { error: optErr } = await supabase
      .from("quiz_question_options")
      .delete()
      .eq("question_id", questionId);

    if (optErr) {
      toast.error("Delete options failed: " + optErr.message);
      return;
    }

    // delete question
    const { error: qErr } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("id", questionId);

    if (qErr) {
      toast.error("Delete question failed: " + qErr.message);
      return;
    }

    toast.success("Deleted");
    fetchQuestions();
  }

  return (
    <div className="p-4">
      <Button onClick={newQuestionForm}>New Question</Button>

      <div className="mt-4">
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Question text"
        />

        <div className="mt-4 space-y-2">
          {optionInputs.map((op, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={op.option_text}
                onChange={(e) =>
                  updateOptionInput(i, "option_text", e.target.value)
                }
                placeholder={`Option ${i + 1}`}
              />
              <input
                type="checkbox"
                checked={op.is_correct}
                onChange={(e) =>
                  updateOptionInput(i, "is_correct", e.target.checked)
                }
              />
              <Button
                variant="destructive"
                onClick={() => removeOption(i)}
              >
                X
              </Button>
            </div>
          ))}
        </div>

        <Button className="mt-2" onClick={addOption}>
          Add Option
        </Button>

        <Button className="mt-4 w-full" onClick={saveQuestion}>
          Save Question
        </Button>
      </div>

      <hr className="my-6" />

      <h2 className="text-xl font-bold mb-2">Questions</h2>

      {questions.map((q) => (
        <div key={q.id} className="border p-3 mb-2">
          <p>{q.question_text}</p>

          <div className="mt-2 flex gap-2">
            <Button onClick={() => startEdit(q)}>Edit</Button>
            <Button variant="destructive" onClick={() => deleteQuestion(q.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
