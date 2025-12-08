import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import RisingPathAnimation from "@/components/animations/RisingPathAnimation";

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
  const [positiveComponents, setPositiveComponents] = useState<ComponentData[]>([]);
  const [negativeComponent, setNegativeComponent] = useState<ComponentData | null>(null);

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
      let componentScores: Record<string, number> = {};
      
      if (componentScoresStr) {
        componentScores = JSON.parse(componentScoresStr);
      } else {
        const { data: submission, error: subError } = await supabase
          .from("quiz_submissions")
          .select("component_scores")
          .eq("id", submissionId)
          .single();

        if (subError) throw subError;
        componentScores = (submission?.component_scores as Record<string, number>) || {};
      }

      const { data: componentsData, error: compError } = await supabase
        .from("components")
        .select("id, name, component_key, description_positive, example_positive, pdf_positive_url, description_negative, example_negative, pdf_negative_url");

      if (compError) throw compError;

      const sortedKeys = Object.entries(componentScores)
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => key);

      const sortedComponents = sortedKeys
        .map(key => componentsData?.find(c => c.component_key === key))
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

  return (
    <div className="min-h-screen bg-gradient-hero">
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
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Your Personal Result
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              A personalized path based on your strengths and your key challenge.
              Your results show clear potential to elevate your personal performance 
              and break past your usual limits within the next 60 days.
            </p>
          </div>

          {/* Top Strengths */}
          {positiveComponents.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Top Strengths
                </h2>
              </div>

              <div className="space-y-5">
                {positiveComponents.map((component, index) => (
                  <div
                    key={component.id}
                    className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in-up border-l-4 border-green-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-display font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                          {component.name}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {component.description_positive || 
                            "This strength helps you maintain focus and make progress toward your goals consistently."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Key Challenge */}
          {negativeComponent && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Key Challenge
                </h2>
              </div>

              <div
                className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in-up border-l-4 border-amber-500"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                      {negativeComponent.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {negativeComponent.description_negative || 
                        "This pattern may create friction in certain situations, but with awareness it can be transformed into a growth opportunity."}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Animation Section */}
          <section className="mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                Visualizing Your Growth Path
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                This animation represents how your current patterns can become more 
                aligned and focused over time.
              </p>
            </div>
            <RisingPathAnimation />
          </section>

          {/* Continue Button */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/offer">
              <Button variant="hero" size="xl" className="min-w-[200px]">
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
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