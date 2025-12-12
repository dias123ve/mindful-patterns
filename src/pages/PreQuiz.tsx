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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card rounded-2xl shadow-lg border border-border p-8 max-w-md w-full fade-up text-center">
        
        {/* Icon */}
        <div className="mx-auto mb-4">
          <Brain className="h-10 w-10 text-primary mx-auto" />
        </div>

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
  );
};

export default PreQuiz;
