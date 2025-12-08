import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, Sparkles, Package, BookOpen, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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
        .select("id, name, component_key");

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
      toast.error("Failed to load offer.");
      navigate("/quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSinglePurchase = () => {
    sessionStorage.setItem("purchase_type", "single");
    navigate("/checkout");
  };

  const handleBundlePurchase = () => {
    sessionStorage.setItem("purchase_type", "bundle");
    navigate("/checkout");
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
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Personalized For You</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Your Personalized Growth Blueprint
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Based on your results, here are two options to help you strengthen 
              your strongest patterns while addressing your main challenge.
            </p>
          </div>

          {/* Offer Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            
            {/* Single Ebook Offer */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Fix Your Key Challenge
                  </h3>
                  {negativeComponent && (
                    <p className="text-sm text-muted-foreground">
                      {negativeComponent.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-display font-bold text-foreground">$12</span>
                  <span className="text-lg text-muted-foreground line-through">$30</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A focused guide created specifically for your lowest-scoring component. 
                  Learn practical strategies to overcome this challenge.
                </p>
              </div>

              <Button 
                onClick={handleSinglePurchase} 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                Get the Key Challenge Guide
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Bundle Offer */}
            <div 
              className="relative bg-card rounded-2xl p-6 md:p-8 shadow-medium border-2 border-primary fade-up"
              style={{ animationDelay: "0.12s" }}
            >
              {/* Best Value Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  <Sparkles className="h-3 w-3" />
                  Best Value
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Complete Personalized Bundle
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    3 Tailored Ebooks
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-display font-bold text-foreground">$17</span>
                  <span className="text-lg text-muted-foreground line-through">$50</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  A set of three ebooks tailored to your quiz profile:
                </p>
                <ul className="space-y-2 text-sm">
                  {positiveComponents.map((comp) => (
                    <li key={comp.id} className="flex items-center gap-2 text-green-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>Strength Guide: {comp.name}</span>
                    </li>
                  ))}
                  {negativeComponent && (
                    <li className="flex items-center gap-2 text-amber-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Challenge Guide: {negativeComponent.name}</span>
                    </li>
                  )}
                </ul>
              </div>

              <Button 
                onClick={handleBundlePurchase} 
                variant="hero" 
                size="lg" 
                className="w-full"
              >
                Get the Full Personalized Bundle
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div 
            className="text-center fade-up"
            style={{ animationDelay: "0.24s" }}
          >
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your recommendations are dynamically tailored based on your 
              behavioral pattern profile.
            </p>
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

export default Offer;
