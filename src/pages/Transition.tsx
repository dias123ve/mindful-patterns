import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Sparkles } from "lucide-react";

const Transition = () => {
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
        <div className="max-w-2xl mx-auto">

          {/* MAIN TEXT */}
          <div className="text-center mb-12 fade-up">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 leading-relaxed">
              A personalized path built around your strengths and key challenge.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Your profile shows clear potential to elevate your personal performance 
              and break past your usual limits within the next 60 days.
            </p>
          </div>

          {/* ANIMATION BOX */}
          <div
            className="flex flex-col items-center justify-center gap-4 mb-12 fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <Sparkles className="h-12 w-12 text-primary/40" />
            <span className="text-sm text-muted-foreground">
              Lottie Animation Placeholder
            </span>
          </div>

          {/* CONTINUE BUTTON */}
          <div
            className="text-center fade-up"
            style={{ animationDelay: "0.30s" }}
          >
            <Link to="/offer">
              <Button variant="hero" size="xl" className="min-w-[220px]">
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

export default Transition;
