import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import OctagramChart from "./OctagramChart";

const ProfileChartSection = ({ email }: { email: string }) => {
  const [scores, setScores] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("quiz_submissions")
        .select("component_scores")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data?.component_scores) {
        setScores(data.component_scores);
      }
    };

    load();
  }, [email]);

  if (!scores) return <p>Loading your chart...</p>;

  return <OctagramChart scores={scores} />;
};

export default ProfileChartSection;
