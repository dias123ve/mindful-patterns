import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Mail, Calendar, CheckCircle2, Clock, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Submission {
  id: string;
  email: string;
  top_components: string[];
  component_scores: Record<string, number>;
  answers: any[];
  has_purchased: boolean;
  created_at: string;
}

interface Component {
  component_key: string;
  name: string;
}

interface ComponentPdf {
  component_id: string;
  pdf_id: string;
}

interface PdfDocument {
  id: string;
  title: string;
  file_name: string | null;
  file_url: string;
}

interface ComponentWithId {
  id: string;
  component_key: string;
  name: string;
}

const Submissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [components, setComponents] = useState<ComponentWithId[]>([]);
  const [componentPdfs, setComponentPdfs] = useState<ComponentPdf[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [submissionsRes, componentsRes, componentPdfsRes, pdfsRes] = await Promise.all([
        supabase
          .from("quiz_submissions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("components").select("id, component_key, name"),
        supabase.from("component_pdfs").select("*"),
        supabase.from("pdf_documents").select("*"),
      ]);

      if (submissionsRes.error) throw submissionsRes.error;
      if (componentsRes.error) throw componentsRes.error;
      if (componentPdfsRes.error) throw componentPdfsRes.error;
      if (pdfsRes.error) throw pdfsRes.error;

      // Cast submissions data to handle Json types
      const submissionsData = (submissionsRes.data || []).map((s) => ({
        ...s,
        component_scores: (s.component_scores || {}) as Record<string, number>,
        answers: (s.answers || []) as any[],
      }));

      setSubmissions(submissionsData);
      setComponents(componentsRes.data || []);
      setComponentPdfs(componentPdfsRes.data || []);
      setPdfs(pdfsRes.data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const getComponentName = (key: string) => {
    const comp = components.find((c) => c.component_key === key);
    return comp?.name || key;
  };

  const getComponentPdfs = (componentKey: string) => {
    const component = components.find((c) => c.component_key === componentKey);
    if (!component) return [];

    const pdfIds = componentPdfs
      .filter((cp) => cp.component_id === component.id)
      .map((cp) => cp.pdf_id);

    return pdfs.filter((pdf) => pdfIds.includes(pdf.id));
  };

  const getTotalScore = (submission: Submission) => {
    if (!submission.component_scores) return 0;
    return Object.values(submission.component_scores).reduce((sum, score) => sum + score, 0);
  };

  const openDetailDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setDetailDialogOpen(true);
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

      {/* Submissions Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>Total Score</TableHead>
              <TableHead>Top Components</TableHead>
              <TableHead>Assigned PDFs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => {
                // Get PDFs for the user's top components
                const assignedPdfs = (submission.top_components || [])
                  .flatMap((key) => getComponentPdfs(key));
                const uniquePdfs = [...new Map(assignedPdfs.map(p => [p.id, p])).values()];

                return (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{submission.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getTotalScore(submission)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(submission.top_components || []).slice(0, 2).map((key, index) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {index + 1}. {getComponentName(key).slice(0, 15)}
                            {getComponentName(key).length > 15 && "..."}
                          </Badge>
                        ))}
                        {(submission.top_components || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{submission.top_components.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {uniquePdfs.length > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {uniquePdfs.length} PDF{uniquePdfs.length !== 1 && "s"}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={submission.has_purchased ? "default" : "secondary"}
                        className="flex items-center gap-1 w-fit"
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
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(submission.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetailDialog(submission)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  User Information
                </h3>
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{selectedSubmission.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span>{format(new Date(selectedSubmission.created_at), "PPp")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={selectedSubmission.has_purchased ? "default" : "secondary"}>
                      {selectedSubmission.has_purchased ? "Purchased" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Component Scores
                </h3>
                <div className="bg-secondary/50 rounded-lg p-4">
                  {selectedSubmission.component_scores && 
                   Object.keys(selectedSubmission.component_scores).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(selectedSubmission.component_scores)
                        .sort(([, a], [, b]) => b - a)
                        .map(([key, score]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span>{getComponentName(key)}</span>
                            <Badge variant="outline">{score}</Badge>
                          </div>
                        ))}
                      <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total Score</span>
                        <span>{getTotalScore(selectedSubmission)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No scores recorded</p>
                  )}
                </div>
              </div>

              {/* Top Components */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Top Components
                </h3>
                <div className="bg-secondary/50 rounded-lg p-4">
                  {(selectedSubmission.top_components || []).length > 0 ? (
                    <div className="space-y-2">
                      {selectedSubmission.top_components.map((key, index) => (
                        <div key={key} className="flex items-center gap-2">
                          <Badge className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                            {index + 1}
                          </Badge>
                          <span>{getComponentName(key)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No components matched</p>
                  )}
                </div>
              </div>

              {/* Assigned PDFs */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Assigned PDFs
                </h3>
                <div className="bg-secondary/50 rounded-lg p-4">
                  {(() => {
                    const assignedPdfs = (selectedSubmission.top_components || [])
                      .flatMap((key) => getComponentPdfs(key));
                    const uniquePdfs = [...new Map(assignedPdfs.map(p => [p.id, p])).values()];

                    if (uniquePdfs.length === 0) {
                      return <p className="text-muted-foreground">No PDFs assigned</p>;
                    }

                    return (
                      <div className="space-y-2">
                        {uniquePdfs.map((pdf) => (
                          <div key={pdf.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span>{pdf.title || pdf.file_name || "Untitled"}</span>
                            </div>
                            <a
                              href={pdf.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-sm hover:underline"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Quiz Answers
                </h3>
                <div className="bg-secondary/50 rounded-lg p-4">
                  {selectedSubmission.answers && 
                   Array.isArray(selectedSubmission.answers) && 
                   selectedSubmission.answers.length > 0 ? (
                    <div className="space-y-2 text-sm">
                      {selectedSubmission.answers.map((answer: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-muted-foreground">Q{index + 1}</span>
                          <span>{JSON.stringify(answer)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No answers recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Submissions;
