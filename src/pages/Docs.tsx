import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    loadDocs();
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
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Documents</h1>
                <p className="text-muted-foreground">Create and manage your business documents</p>
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
                    className="h-64 cursor-pointer hover:shadow-lg transition-shadow group"
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
                    <CardContent>
                      <CardTitle className="text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        Click to open and edit this document
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
