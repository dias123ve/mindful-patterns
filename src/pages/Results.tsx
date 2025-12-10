import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Brain,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import OctagonChart from "@/components/OctagonChart";

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
  const [componentScores, setComponentScores] = useState<
    Record<string, number>
  >({});
  const [positiveComponents, setPositiveComponents] = useState<ComponentData[]>(
    []
  );
  const [negativeComponent, setNegativeComponent] =
    useState<ComponentData | null>(null);

  useEffect(() => {
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

      // Try loading from sessionStorage
      if (componentScoresStr) {
        scores = JSON.parse(componentScoresStr);
        setComponentScores(scores);
      } else {
        // Fallback to database
        const { data: submission, error: subError } = await supabase
          .from("quiz_submissions")
          .select("component_scores")
          .eq("id", submissionId)
          .single();

        if (subError) throw subError;

        scores = (submission?.component_scores ||
          {}) as Record<string, number>;
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
        setNegativeComponent(
          sortedComponents[sortedComponents.length - 1]
        );
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* HEADER */}
      <header className="container mx-auto px-4 py-6">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">
            MindProfile
          </span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-8 pb-16">
        <div className="max-w-3xl mx-auto">

          {/* NEW HEADER WITH CHART */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Your Self Profile
            </h1>

            <p className="text-muted-foreground max-w-md mx-auto">
              Based on your responses, here are your patterns.
            </p>

            {/* OCTAGON CHART */}
            <div className="max-w-md mx-auto mt-10">
              <OctagonChart
                scores={componentScores}
                labels={[
                  "self_identity",
                  "self_esteem",
                  "self_compassion",
                  "emotional_sensitivity",
                  "motivation",
                  "self_awareness",
                  "values_clarity",
                  "direction_focus",
                ]}
              />
            </div>
          </div>

          {/* HIGHEST SCORES */}
          {positiveComponents.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Your Highest Scores
                </h2>
              </div>

              <div className="space-y-6">
                {positiveComponents.map((component, index) => (
                  <div
                    key={component.id}
                    className="bg-card rounded-2xl p-6 md:p-8 shadow-soft animate-fade-in-up border-l-4 border-green-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-display font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                          {component.name}
                        </h3>

                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {component.description_positive ||
                            "No description provided."}
                        </p>

                        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-green-600" />
                            Examples in Daily Life
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {component.example_positive ||
                              "No examples provided."}
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
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* LOWEST SCORE */}
          {negativeComponent && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Your Lowest Score
                </h2>
              </div>

              <div
                className="bg-card rounded-2xl p-6 md:p-8 shadow-soft animate-fade-in-up border-l-4 border-amber-500"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                      {negativeComponent.name}
                    </h3>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {negativeComponent.description_negative ||
                        "No description provided."}
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-amber-600" />
                        How This Shows Up
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {negativeComponent.example_negative ||
                          "No examples provided."}
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
                </div>
              </div>
            </section>
          )}

          {/* CONTINUE BUTTON */}
          <div className="text-center animate-fade-in-up mt-12">
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold"
              onClick={() => navigate("/transition")}
            >
              Continue
            </Button>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MindProfile. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Results;
