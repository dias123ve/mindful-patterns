import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { NegativityBar } from "@/components/charts/NegativityBar";

interface ComponentData {
  id: string;
  name: string;
  component_key: string;
  description_positive: string;
  example_positive: string;
  pdf_positive_url: string | null;
  description_negative: string;
  example_negative: string;
  pdf_negative_url: string | null;
}

const Results = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);

  const [componentScores, setComponentScores] = useState<Record<string, number>>({});
  const [positiveComponents, setPositiveComponents] = useState<ComponentData[]>([]);
  const [negativeComponent, setNegativeComponent] = useState<ComponentData | null>(null);

  const [gender, setGender] = useState<"male" | "female">("female");

  useEffect(() => {
    const storedGender = sessionStorage.getItem("gender") as "male" | "female" | null;
    if (storedGender) setGender(storedGender);

    fetchResults();
  }, []);

  const fetchResults = async () => {
    const submissionId = sessionStorage.getItem("quiz_submission_id");
    const componentScoresStr = sessionStorage.getItem("component_scores");

    if (!submissionId) {
      toast.error("No quiz results found. Please take the quiz first.");
      navigate("/quiz");
      return;
    }

    try {
      let scores: Record<string, number> = {};

      if (componentScoresStr) {
        scores = JSON.parse(componentScoresStr);
        setComponentScores(scores);
      } else {
        const { data: submission, error: subError } = await supabase
          .from("quiz_submissions")
          .select("component_scores")
          .eq("id", submissionId)
          .single();

        if (subError) throw subError;

        scores = (submission?.component_scores || {}) as Record<string, number>;
        setComponentScores(scores);
      }

      const { data: componentsData, error: compError } = await supabase
        .from("components")
        .select(
          "id, name, component_key, description_positive, example_positive, pdf_positive_url, description_negative, example_negative, pdf_negative_url"
        );

      if (compError) throw compError;

      const sortedKeys = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => key);

      const sortedComponents = sortedKeys
        .map((key) => componentsData?.find((c) => c.component_key === key))
        .filter(Boolean) as ComponentData[];

      if (sortedComponents.length >= 3) {
        setPositiveComponents(sortedComponents.slice(0, 2));
        setNegativeComponent(sortedComponents[sortedComponents.length - 1]);
      } else if (sortedComponents.length === 2) {
        setPositiveComponents([sortedComponents[0]]);
        setNegativeComponent(sortedComponents[1]);
      } else if (sortedComponents.length === 1) {
        setPositiveComponents([sortedComponents[0]]);
        setNegativeComponent(null);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load results.");
      navigate("/quiz");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allScores = Object.values(componentScores);
  const maxScore = Math.max(...allScores, 1);
  const negativityScore = Math.min(...allScores);

  return (
    <div className="min-h-screen bg-gradient-hero">

      {/* ------------------------------------------------------ */}
      {/* PAGE 1 — SUMMARY                                        */}
      {/* ------------------------------------------------------ */}
      {step === 1 && (
        <main className="container mx-auto px-4 py-14 pb-24">

          {/* Back button */}
          <div className="max-w-3xl mx-auto mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-foreground/80 hover:text-foreground flex items-center gap-1 transition"
            >
              ← Back
            </button>
          </div>

          <div className="max-w-3xl mx-auto text-center">

            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Your Self Insight Summary
            </h1>

            <p className="text-muted-foreground max-w-md mx-auto mb-10">
              A concise overview of your inner patterns based on your quiz responses.
            </p>

            <div className="flex justify-center mb-12">
              <NegativityBar
                score={negativityScore}
                maxScore={maxScore}
                gender={gender}
              />
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold"
              onClick={() => {
                setStep(2);
                setTimeout(
                  () => window.scrollTo({ top: 120, behavior: "smooth" }),
                  50
                );
              }}
            >
              See Your Strengths and Challenges →
            </Button>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------ */}
      {/* PAGE 2 — DEEP DIVE                                      */}
      {/* ------------------------------------------------------ */}
      {step === 2 && (
        <main className="container mx-auto px-4 py-14 pb-24">

          {/* Back to Summary */}
          <div className="max-w-3xl mx-auto mb-4">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-foreground/80 hover:text-foreground flex items-center gap-1 transition"
            >
              ← Back
            </button>
          </div>

          <div className="max-w-3xl mx-auto">

            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-3">
              Deep Dive: Your Components
            </h1>

            <p className="text-muted-foreground max-w-lg mx-auto text-center mb-10">
              See the strengths shaping your progress and the key area that holds the greatest growth potential.
            </p>

            {/* STRENGTHS */}
            {positiveComponents.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Your Strengths
                  </h2>
                </div>

                <div className="space-y-6">
                  {positiveComponents.map((component, index) => (
                    <div
                      key={component.id}
                      className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border-l-4 border-green-500 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                        {component.name}
                      </h3>

                      <p className="text-foreground mb-4 leading-relaxed">
                        {component.description_positive}
                      </p>

                      <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          Examples in Daily Life
                        </h4>

                        <p className="text-sm text-muted-foreground">
                          {component.example_positive}
                        </p>
                      </div>

                      {component.pdf_positive_url && (
                        <a
                          href={component.pdf_positive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          <Download className="h-4 w-4" />
                          Download Strength Guide
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* MAIN CHALLENGE */}
            {negativeComponent && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Your Main Challenge
                  </h2>
                </div>

                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border-l-4 border-amber-500 animate-fade-in-up">
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                    {negativeComponent.name}
                  </h3>

                  <p className="text-foreground mb-4 leading-relaxed">
                    {negativeComponent.description_negative}
                  </p>

                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                      How This Shows Up
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      {negativeComponent.example_negative}
                    </p>
                  </div>

                  {negativeComponent.pdf_negative_url && (
                    <a
                      href={negativeComponent.pdf_negative_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                    >
                      <Download className="h-4 w-4" />
                      Download Improvement Guide
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* CONTINUE */}
            <div className="text-center mt-12">
              <Button
                size="lg"
                className="w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold"
                onClick={() => navigate("/transition")}
              >
                Continue →
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Results;
