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
  question_text: string;
  component_key: string | null;
  display_order: number;
}

interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  score: number;
  display_order: number;
}

const Quiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string; score: number }>>({});
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      const [questionsRes, optionsRes] = await Promise.all([
        supabase
          .from("questions")
          .select("*")
          .eq("is_active", true)
          .order("display_order"),
        supabase.from("question_options").select("*").order("display_order"),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (optionsRes.error) throw optionsRes.error;

      setQuestions(questionsRes.data || []);
      setOptions(optionsRes.data || []);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = options.filter(
    (o) => o.question_id === currentQuestion?.id
  );
  const progress = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const handleSelectOption = (optionId: string, score: number) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { optionId, score },
    }));

    // Delay then move to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowEmailCapture(true);
      }
    }, 300);
  };

  const calculateScores = () => {
    const scores: Record<string, number> = {};
    
    // For each answered question, add the score to the component
    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer && question.component_key) {
        scores[question.component_key] = (scores[question.component_key] || 0) + answer.score;
      }
    });

    // Get top 3 components by score
    const sortedComponents = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);

    return { scores, topComponents: sortedComponents };
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);

    try {
      const { scores, topComponents } = calculateScores();

      const { data, error } = await supabase
        .from("quiz_submissions")
        .insert({
          email: email.trim().toLowerCase(),
          answers: answers,
          component_scores: scores,
          top_components: topComponents as ("all_or_nothing" | "overgeneralization" | "mental_filter" | "disqualifying_positive" | "jumping_conclusions" | "magnification" | "emotional_reasoning" | "should_statements" | "labeling" | "personalization")[],
        })
        .select()
        .single();

      if (error) throw error;

      // Store submission ID for results page
      sessionStorage.setItem("quiz_submission_id", data.id);
      navigate("/results");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* Header */}
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

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <Progress value={showEmailCapture ? 100 : progress} className="h-2" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-xl mx-auto">
          {!showEmailCapture ? (
            <div className="animate-fade-in" key={currentQuestionIndex}>
              {/* Question */}
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-relaxed">
                  {currentQuestion?.question_text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentOptions.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      handleSelectOption(option.id, option.score)
                    }
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                      answers[currentQuestion?.id]?.optionId === option.id
                        ? "border-primary bg-primary/10 shadow-soft"
                        : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className="text-foreground">{option.option_text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-success" />
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-4">
                Your results are ready!
              </h2>

              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Enter your email to see your personalized thinking profile and
                receive exclusive insights.
              </p>

              <div className="max-w-sm mx-auto space-y-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-center text-lg"
                  disabled={submitting}
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
                      See My Results
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  We respect your privacy. No spam, ever.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
