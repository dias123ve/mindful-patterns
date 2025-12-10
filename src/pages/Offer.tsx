import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

import NowToGoalVisual from "@/components/offer/NowToGoalVisual";
import AboutYourPlan from "@/components/offer/AboutYourPlan";
import OfferSection from "@/components/offer/OfferSection";
import ExplanationSections from "@/components/offer/ExplanationSections";
import HolisticExplanation from "@/components/offer/HolisticExplanation";

interface ComponentData {
  id: string;
  name: string;
  component_key: string;
}

const Offer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [positiveComponents, setPositiveComponents] = useState<ComponentData[]>([]);
  const [negativeComponent, setNegativeComponent] = useState<ComponentData | null>(null);

  // ✅ NEW: store raw scores
  const [componentScores, setComponentScores] = useState<Record<string, number>>({});

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

      // Load from sessionStorage first
      if (componentScoresStr) {
        scores = JSON.parse(componentScoresStr);
      } else {
        // Fallback: load from supabase
        const { data: submission, error: subError } = await supabase
          .from("quiz_submissions")
          .select("component_scores")
          .eq("id", submissionId)
          .single();

        if (subError) throw subError;
        scores = (submission?.component_scores as Record<string, number>) || {};
      }

      // Save the scores to state
      setComponentScores(scores);

      // Load component metadata
      const { data: componentsData, error: compError } = await supabase
        .from("components")
        .select("id, name, component_key");

      if (compError) throw compError;

      // Sort components by score
      const sortedKeys = Object.entries(scores)
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
      toast.error("Failed to load offer.");
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
        <div className="max-w-4xl mx-auto space-y-12">

          {/* NOW → GOAL VISUAL */}
          <NowToGoalVisual
            positiveComponents={positiveComponents}
            negativeComponent={negativeComponent}
            componentScores={componentScores}   // ✅ FIXED: pass scores
          />

          {/* HEADLINE */}
          <div className="text-center fade-up" style={{ animationDelay: "0.08s" }}>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Your personalized plan is ready.
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Built from your strongest patterns and your key challenge.
            </p>
          </div>

          {/* FIRST OFFER */}
          <OfferSection 
            positiveComponents={positiveComponents}
            negativeComponent={negativeComponent}
          />

          {/* OUR GOAL */}
          <AboutYourPlan />

          {/* HOLISTIC EXPLANATIONS */}
          <HolisticExplanation />

          {/* STANDARD EXPLANATIONS */}
          <ExplanationSections />

          {/* SECOND OFFER */}
          <OfferSection 
            positiveComponents={positiveComponents}
            negativeComponent={negativeComponent}
          />

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

export default Offer;
