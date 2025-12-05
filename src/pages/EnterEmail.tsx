import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const EnterEmail = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("collected_emails").insert([{ email }]);

    if (error) {
      console.error(error);
      toast.error("Failed to save email.");
    } else {
      toast.success("Email saved!");
      navigate("/results");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="bg-card shadow-lg rounded-3xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-display font-bold text-center mb-4">
          Enter Your Email
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          We’ll send your personalized report and exclusive insights.
        </p>

        <Input
          type="email"
          placeholder="your@email.com"
          className="mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Your email is safe and never shared.
        </p>
      </div>
    </div>
  );
};

export default EnterEmail;
