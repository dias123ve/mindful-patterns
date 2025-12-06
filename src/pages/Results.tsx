import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Component {
  id: string;
  name: string;
  content: {
    description?: string;
    examples?: string;
  };
}

interface Submission {
  id: string;
  user_email: string;
  top_components: string[];        // array of component IDs
  top_component_names: string[];
}

const Results = () => {
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [topComponents, setTopComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const submissionId = sessionStorage.getItem("quiz_submission_id");

    if (!submissionId) {
      toast.error("No quiz results found. Please take the quiz first.");
      navigate("/quiz");
      return;
    }

    try {
      // Fetch submission
      const submissionRes = await supabase
        .from("quiz_submissions")
        .select("*")
        .eq("id", submissionId)
        .single();

      if (submissionRes.error) throw submissionRes.error;
      const sub = submissionRes.data;

      // Fetch components
      const componentsRes = await supabase
        .from("components")
        .select("*");

      if (componentsRes.error) throw componentsRes.error;
      const comps = componentsRes.data || [];

      setSubmission(sub);
      setComponents(comps);

      // Map top components by ID
      const topComps =
        (sub.top_components || [])
          .map((id: string) => comps.find((c: Component) => c.id === id))
          .filter(Boolean);

      setTopComponents(topComps as Component[]);
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
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Your Thinking Profile
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Based on your responses, here are your top patterns.
            </p>
          </div>

          {/* TOP 3 COMPONENTS */}
          <div className="space-y-6 mb-16">
            {topComponents.map((component, index) => (
              <div
                key={component.id}
                className="bg-card rounded-2xl p-6 md:p-8 shadow-soft animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                      {component.name}
                    </h3>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {component.content?.description || "No description provided."}
                    </p>

                    <div className="bg-secondary/50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Examples in Daily Life
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {component.content?.examples || "No examples provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA SECTION */}
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-medium text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Limited Time Offer</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Get Your Personalized Ebook
            </h2>

            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Receive a custom guide with strategies based on your results.
            </p>

            <Link to="/checkout">
              <Button variant="hero" size="xl">
                Get My Ebook
                <Sparkles className="h-5 w-5" />
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground mt-6">
              Instant delivery • Secure payment • 30-day guarantee
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

export default Results;
