import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Calendar, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id: string;
  email: string;
  top_components: string[];
  has_purchased: boolean;
  created_at: string;
}

interface Component {
  component_key: string;
  name: string;
}

const Submissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [submissionsRes, componentsRes] = await Promise.all([
        supabase
          .from("quiz_submissions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("components").select("component_key, name"),
      ]);

      if (submissionsRes.error) throw submissionsRes.error;
      if (componentsRes.error) throw componentsRes.error;

      setSubmissions(submissionsRes.data || []);
      setComponents(componentsRes.data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComponentName = (key: string) => {
    const comp = components.find((c) => c.component_key === key);
    return comp?.name || key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Quiz Submissions
        </h1>
        <p className="text-muted-foreground mt-1">
          View all quiz submissions and purchase status
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No submissions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {submission.email}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(submission.created_at), "PPp")}
                    </div>
                  </div>
                  <Badge
                    variant={submission.has_purchased ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {submission.has_purchased ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Purchased
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Pending
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Top 3 Components
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(submission.top_components || []).map((key, index) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {index + 1}. {getComponentName(key)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
