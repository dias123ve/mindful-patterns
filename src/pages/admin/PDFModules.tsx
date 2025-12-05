import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Upload, Trash2, Loader2, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface PdfDocument {
  id: string;
  title: string;
  file_name: string | null;
  file_url: string;
  created_at: string;
}

const PDFModules = () => {
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const { data, error } = await supabase
        .from("pdf_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPdfs(data || []);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      toast.error("Failed to load PDFs");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be less than 20MB");
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!formData.file) {
      toast.error("Please select a PDF file");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${formData.file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("pdf-modules")
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("pdf-modules")
        .getPublicUrl(fileName);

      // Insert metadata into pdf_documents table
      const { error: insertError } = await supabase.from("pdf_documents").insert({
        title: formData.title || formData.file.name,
        file_name: formData.file.name,
        file_url: urlData.publicUrl,
      });

      if (insertError) throw insertError;

      toast.success("PDF uploaded successfully");
      setDialogOpen(false);
      resetForm();
      fetchPdfs();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (pdf: PdfDocument) => {
    if (!confirm("Are you sure you want to delete this PDF? This will also remove it from any assigned components.")) {
      return;
    }

    try {
      // Extract file path from URL
      const urlParts = pdf.file_url.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage.from("pdf-modules").remove([fileName]);

      // Delete from database (cascade will handle component_pdfs)
      const { error } = await supabase
        .from("pdf_documents")
        .delete()
        .eq("id", pdf.id);

      if (error) throw error;

      toast.success("PDF deleted successfully");
      fetchPdfs();
    } catch (error) {
      console.error("Error deleting PDF:", error);
      toast.error("Failed to delete PDF");
    }
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            PDF Modules
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage PDF files for ebook delivery
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload PDF
        </Button>
      </div>

      {/* PDF Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pdfs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No PDFs uploaded yet. Click "Upload PDF" to add one.
                </TableCell>
              </TableRow>
            ) : (
              pdfs.map((pdf) => (
                <TableRow key={pdf.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="truncate max-w-xs">
                        {pdf.file_name || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{pdf.title || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(pdf.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <a
                        href={pdf.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" title="View/Download">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(pdf)}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload PDF</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>PDF File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max file size: 20MB
              </p>
            </div>

            <div>
              <Label>Title (optional)</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter a title for this PDF"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !formData.file}>
                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDFModules;
