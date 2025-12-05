import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EnterEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to results page - email capture is now handled in Quiz.tsx
    const submissionId = sessionStorage.getItem("quiz_submission_id");
    if (submissionId) {
      navigate("/results");
    } else {
      navigate("/quiz");
    }
  }, [navigate]);

  return null;
};

export default EnterEmail;
