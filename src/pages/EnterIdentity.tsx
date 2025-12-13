import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "name" | "email";

const EnterIdentity = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // Guard
  // ======================
  useEffect(() => {
    const submissionId = sessionStorage.getItem("quiz_submission_id");
    if (!submissionId) {
      navigate("/quiz");
    }
  }, [navigate]);

  // ======================
  // Handlers
  // ======================
  const handleNameContinue = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    sessionStorage.setItem("user_name", name.trim());
    setStep("email");
  };

  const handleEmailContinue = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);

    const submissionId = sessionStorage.getItem("quiz_submission_id");
    if (!submissionId) {
      navigate("/quiz");
      return;
    }

    const { error } = await supabase
      .from("quiz_submissions")
      .update({
        name: name.trim(),
        email: email.trim(),
      })
      .eq("id", submissionId);

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Failed to save your data");
      return;
    }

    navigate("/results");
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card p-6 rounded-2xl shadow">
        {step === "name" && (
          <>
            <h2 className="text-xl font-semibold mb-2">
              Almost there
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your name to personalize your result
            </p>

            <Input
              autoFocus
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4"
            />

            <Button className="w-full" onClick={handleNameContinue}>
              Continue
            </Button>
          </>
        )}

        {step === "email" && (
          <>
            <h2 className="text-xl font-semibold mb-2">
              Where should we send your result?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              We’ll send your personalized result to this email
            </p>

            <Input
              autoFocus
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />

            <Button
              className="w-full"
              onClick={handleEmailContinue}
              disabled={loading}
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EnterIdentity;
