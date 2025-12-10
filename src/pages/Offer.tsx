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

  const [componentScores, setComponentScores] = useState<Record<string, number>>({});

  // ----------------------------------------------------
  // 🔥 DISCOUNT TIMER LOGIC
  // ----------------------------------------------------

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    let start = sessionStorage.getItem("offer_start_time");

    if (!start) {
      start = Date.now().toString();
      sessionStorage.setItem("offer_start_time", start);
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - Number(start)) / 1000);
      const remaining = 600 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ----------------------------------------------------
  // 🔥 FETCH RESULTS FROM DB / SESSION
  // ----------------------------------------------------

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

      if (componentScoresStr) {
        scores = JSON.parse(componentScoresStr);
      } else {
        const { data: submission, error: subError } = await supabase
          .from("quiz_submissions")
          .select("component_scores")
          .eq("id", submissionId)
          .single();

        if (subError) throw subError;
        scores = (submission?.component_scores as Record<string, number>) || {};
      }

      // Normalize underscore → hyphen
      const normalizedScores: Record<string, number> = {};
      Object.entries(scores).forEach(([key, value]) => {
        normalizedScores[key.replace(/_/g, "-")] = value;
      });

      setComponentScores(normalizedScores);

      // Load metadata
      const { data: componentsData, error: compError } = await supabase
        .from("components")
        .select("id, name, component_key");

      if (compError) throw compError;

      const sortedKeys = Object.entries(normalizedScores)
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

  // ----------------------------------------------------
  // 🔥 PAGE RENDER
  // ----------------------------------------------------

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

      {/* 🔥 FLOATING DISCOUNT BAR */}
      {timeLeft > 0 && (
        <div className="
          fixed top-0 left-0 w-full z-50 
          bg-white/95 backdrop-blur 
          border-b border-border 
          px-4 py-3
        ">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Discount is reserved for:{" "}
              <span className="text-green-600 font-semibold">
                {formatTime(timeLeft)}
              </span>
            </span>

            <button
              onClick={() => {
                const el = document.getElementById("offer-block");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow"
            >
              Get Started Now
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="container mx-auto px-4 py-24 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">

          <NowToGoalVisual
            positiveComponents={positiveComponents}
            negativeComponent={negativeComponent}
            componentScores={componentScores}
          />

          <div className="text-center fade-up" style={{ animationDelay: "0.08s" }}>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Your personalized plan is ready.
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Built from your strongest patterns and your key challenge.
            </p>
          </div>

          {/* FIRST OFFER */}
          <div id="offer-block">
            <OfferSection
              positiveComponents={positiveComponents}
              negativeComponent={negativeComponent}
            />
          </div>

          <AboutYourPlan />
          <HolisticExplanation />
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
