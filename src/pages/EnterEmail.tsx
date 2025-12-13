import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EnterEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const submissionId = sessionStorage.getItem("quiz_submission_id");
    const email = sessionStorage.getItem("user_email"); // ambil email yg diinput user

    if (!submissionId) {
      navigate("/quiz");
      return;
    }

    if (!email) {
      navigate("/enter-email-form");
      return;
    }

    const updateEmail = async () => {
      const { error } = await supabase
        .from("quiz_submissions")
        .update({ email })
        .eq("id", submissionId);

      if (error) {
        console.error(error);
        toast.error("Failed to save email");
        navigate("/enter-email-form");
      } else {
        navigate("/results");
      }
    };

    updateEmail();
  }, [navigate]);

  return null;
};

export default EnterEmail;
