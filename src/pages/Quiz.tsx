import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowRight, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  display_order: number;
  is_active: boolean;
}

interface Option {
  id: string;
  question_id: string;
  option_text: string;
  score: number | null;
  display_order: number;
}

interface QuestionComponentRel {
  question_id: string;
  component_id: string;
}

interface ComponentRow {
  id: string;
  component_key: string;
}

const Quiz = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [componentRels, setComponentRels] = useState<QuestionComponentRel[]>([]);
  const [components, setComponents] = useState<ComponentRow[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string; score: number }>>({});

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, []);

  // ========================= FETCH QUIZ DATA =========================
  const fetchQuizData = async () => {
    try {
      // 1. Get active quiz
      const { data: quiz, error: quizErr } = await supabase
        .from("quizzes")
        .select("id")
        .eq("is_active", true)
        .single();

      if (quizErr) throw quizErr;
      if (!quiz) {
        setLoading(false);
        return;
      }

      // 2. Get questions
      const { data: qData, error: qErr } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (qErr) throw qErr;

      if (!qData || qData.length === 0) {
        setQuestions([]);
        setOptions([]);
        setLoading(false);
        return;
      }

      const questionIds = qData.map((q) => q.id);

      // 3. Get options
      const { data: oData, error: oErr } = await supabase
        .from("quiz_question_options")
        .select("*")
        .in("question_id", questionIds)
        .order("display_order", { ascending: true });

      if (oErr) throw oErr;

      // 4. Get question → component relations
      const { data: rels, error: relErr } = await supabase
        .from("quiz_question_components")
        .select("question_id, component_id");

      if (relErr) throw relErr;

      // 5. Get components table
      const { data: comps, error: compErr } = await supabase
        .from("components")
        .select("id, component_key");

      if (compErr) throw compErr;

      setQuestions(qData);
      setOptions(oData || []);
      setComponentRels(rels || []);
      setComponents(comps || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  // ========================= SELECT OPTION =========================
  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = options.filter((o) => o.question_id === currentQuestion?.id);

  const progress = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const handleSelectOption = (optionId: string, score: number) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { optionId, score },
    }));

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowEmailCapture(true);
      }
    }, 250);
  };

  // ========================= SCORE CALCULATION =========================
  const calculateScores = () => {
    const scores: Record<string, number> = {};

    questions.forEach((q) => {
      const ans = answers[q.id];
      if (!ans) return;

      // ambil semua component_id terkait question
      const rels = componentRels.filter((r) => r.question_id === q.id);

      rels.forEach((rel) => {
        const comp = components.find((c) => c.id === rel.component_id);
        if (!comp) return;

        const key = comp.component_key;
        if (!key) return;

        scores[key] = (scores[key] || 0) + ans.score;
      });
    });

    const sortedComponents = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([key]) => key);

    return { scores, sortedComponents };
  };

  // ========================= SUBMIT QUIZ =========================
  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Enter your email");
      return;
    }

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      toast.error("Email is invalid");
      return;
    }

    setSubmitting(true);

    try {
      const { scores, sortedComponents } = calculateScores();
      const topComponents = sortedComponents.slice(0, 3);

      const { data, error } = await supabase
        .from("quiz_submissions")
        .insert({
          email: email.trim().toLowerCase(),
          answers,
          component_scores: scores,
          top_components: topComponents,
        })
        .select()
        .single();

      if (error) throw error;

      sessionStorage.setItem("quiz_submission_id", data.id);
      sessionStorage.setItem("component_scores", JSON.stringify(scores));
      navigate("/results");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================= UI =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No quiz questions available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="text-lg font-display font-semibold text-foreground">
              MindProfile
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {showEmailCapture
              ? "Almost done!"
              : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 mb-8">
        <Progress value={showEmailCapture ? 100 : progress} className="h-2" />
      </div>

      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-xl mx-auto">
          {!showEmailCapture ? (
            <div key={currentQuestionIndex} className="animate-fade-in">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
                  {currentQuestion?.question_text}
                </h2>
              </div>

              <div className="space-y-3">
                {currentOptions.map((opt, i) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id, opt.score || 0)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      answers[currentQuestion.id]?.optionId === opt.id
                        ? "border-primary bg-primary/10 shadow-soft"
                        : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {opt.option_text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-success" />
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-semibold mb-4">
                Your results are ready!
              </h2>

              <p className="text-muted-foreground mb-8">
                Enter your email to see your personalized thinking profile.
              </p>

              <div className="max-w-sm mx-auto space-y-4">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="h-12 text-center text-lg"
                />

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      See My Results <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">No spam. Ever.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
