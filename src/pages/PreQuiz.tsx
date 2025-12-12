import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const PreQuiz = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const gender = params.get("gender") || "male";

  const handleContinue = () => {
    navigate(`/quiz?gender=${gender}`);
  };

  return (
    <div className="min-h-screen bg-background px-4 flex flex-col">

      {/* Header with Logo + Text */}
      <div className="container mx-auto py-6 flex items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">MindProfile</span>
        </div>
      </div>

      {/* Center Card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 max-w-md w-full fade-up text-center">

          {/* Header */}
          <h2 className="text-xl font-display font-bold text-foreground mb-3">
            Before you continue, a quick note
          </h2>

          {/* Body */}
          <p className="text-muted-foreground leading-relaxed mb-8">
            Choose what feels accurate for you right now, not what you think the ideal answer should be.
          </p>

          {/* Button */}
          <Button
            size="lg"
            className="w-full flex items-center justify-center gap-2 text-base py-6"
            onClick={handleContinue}
          >
            Continue →
          </Button>
        </div>
      </div>

    </div>
  );
};

export default PreQuiz;
