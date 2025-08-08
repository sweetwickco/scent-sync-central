import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Clock, Trash2, FileUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

interface Doc {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Docs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; docId: string; docTitle: string }>({
    open: false,
    docId: '',
    docTitle: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocs();
    GlobalWorkerOptions.workerSrc = pdfWorker;
  }, []);

  const loadDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setDocs(data || []);
    } catch (error) {
      console.error('Error loading docs:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoc = () => {
    navigate(`/docs/new`);
  };

  const handleOpenDoc = (docId: string) => {
    navigate(`/docs/${docId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      // Delete document tabs first (due to foreign key constraint)
      const { error: tabsError } = await supabase
        .from('document_tabs')
        .delete()
        .eq('document_id', docId);

      if (tabsError) throw tabsError;

      // Delete the document
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (docError) throw docError;

      // Update local state
      setDocs(docs.filter(doc => doc.id !== docId));
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }

    setDeleteDialog({ open: false, docId: '', docTitle: '' });
  };

  const confirmDelete = (docId: string, docTitle: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the document
    setDeleteDialog({ open: true, docId, docTitle });
  };

  // Import PDFs
  const handleImportClick = () => fileInputRef.current?.click();

  const onFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await importPdfFiles(files);
    // reset input to allow re-selecting same file
    e.target.value = "";
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((it: any) => it.str).join(" ");
      text += pageText + "\n\n";
    }
    return text;
  };

  const escapeHtml = (s: string) => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const textToHtml = (text: string) =>
    text
      .split(/\n{2,}/)
      .map(p => `<p>${escapeHtml(p.trim())}</p>`) 
      .join("");

  const importPdfFiles = async (files: FileList) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not signed in", description: "Please log in to import.", variant: "destructive" });
        return;
      }

      let firstDocId: string | null = null;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        toast({ title: "Importing", description: `Reading ${file.name}...` });
        const text = await extractTextFromPdf(file);
        const html = textToHtml(text);
        const title = file.name.replace(/\.[^/.]+$/, "");

        const { data: newDoc, error: docError } = await supabase
          .from('documents')
          .insert({ user_id: user.id, title, content: '' })
          .select()
          .single();

        if (docError) throw docError;

        const { error: tabError } = await supabase
          .from('document_tabs')
          .insert({
            document_id: newDoc.id,
            title: 'Main',
            content: html,
            order_index: 0,
            is_active: true,
          });

        if (tabError) throw tabError;

        if (!firstDocId) firstDocId = newDoc.id;
      }

      toast({ title: "Import complete", description: `Imported ${files.length} PDF${files.length > 1 ? 's' : ''}` });
      await loadDocs();
      if (firstDocId) navigate(`/docs/${firstDocId}`);

    } catch (error) {
      console.error('Import error:', error);
      const message = error instanceof Error ? error.message : 'Failed to import PDF(s)';
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };
  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between px-6 py-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Header />
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">Loading...</div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Header />
              </div>
            </div>
          </div>
          <main className="flex-1 p-6">
            <div className="container mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Documents</h1>
                  <p className="text-muted-foreground">Create and manage your business documents</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={handleImportClick} className="gap-2">
                    <FileUp className="w-4 h-4" /> Import PDF
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={onFilesSelected}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Create New Doc Card */}
                <Card 
                  className="h-64 cursor-pointer border-dashed border-2 hover:border-primary/50 transition-colors group"
                  onClick={handleCreateDoc}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Create New Document</h3>
                    <p className="text-sm text-muted-foreground">Start a new document</p>
                  </CardContent>
                </Card>

                {/* Existing Docs */}
                {docs.map((doc) => (
                  <Card 
                    key={doc.id}
                    className="h-64 cursor-pointer hover:shadow-lg transition-shadow group relative"
                    onClick={() => handleOpenDoc(doc.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(doc.updated_at)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full">
                      <CardTitle className="text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        Click to open and edit this document
                      </p>
                      
                      {/* Delete button at bottom */}
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => confirmDelete(doc.id, doc.title, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.docTitle}"? This action cannot be undone and will also delete all tabs within this document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteDoc(deleteDialog.docId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
