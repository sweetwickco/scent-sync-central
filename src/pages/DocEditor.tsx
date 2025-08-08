import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocTab {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  order_index: number;
}

interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
}

export default function DocEditor() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [tabs, setTabs] = useState<DocTab[]>([]);
  const [activeTab, setActiveTab] = useState<DocTab | null>(null);
  const [loading, setLoading] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: activeTab?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[600px] p-8',
      },
    },
    onUpdate: ({ editor }) => {
      if (activeTab) {
        saveTabContent(activeTab.id, editor.getHTML());
      }
    },
  });

  // Load document and tabs on mount
  useEffect(() => {
    loadDocument();
  }, [docId]);

  // Update editor content when active tab changes
  useEffect(() => {
    if (editor && activeTab) {
      editor.commands.setContent(activeTab.content);
    }
  }, [activeTab, editor]);

  const loadDocument = async () => {
    if (!docId || docId === 'new') {
      await createNewDocument();
      return;
    }

    try {
      // Load document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .maybeSingle();

      if (docError) throw docError;

      if (!doc) {
        navigate('/docs');
        return;
      }

      setDocument(doc);

      // Load tabs
      const { data: tabsData, error: tabsError } = await supabase
        .from('document_tabs')
        .select('*')
        .eq('document_id', docId)
        .order('order_index');

      if (tabsError) throw tabsError;

      const loadedTabs = tabsData.map(tab => ({
        id: tab.id,
        title: tab.title,
        content: tab.content || '',
        isActive: tab.is_active,
        order_index: tab.order_index,
      }));

      setTabs(loadedTabs);
      
      // Set active tab
      const active = loadedTabs.find(tab => tab.isActive) || loadedTabs[0];
      if (active) {
        setActiveTab(active);
      }

    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewDocument = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create new document
      const { data: newDoc, error: docError } = await supabase
        .from('documents')
        .insert({
          title: 'Untitled Document',
          content: '',
          user_id: user.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create first tab
      const { data: newTab, error: tabError } = await supabase
        .from('document_tabs')
        .insert({
          document_id: newDoc.id,
          title: 'Main',
          content: '<h1>Start writing...</h1><p></p>',
          order_index: 0,
          is_active: true,
        })
        .select()
        .single();

      if (tabError) throw tabError;

      setDocument(newDoc);
      const firstTab = {
        id: newTab.id,
        title: newTab.title,
        content: newTab.content || '',
        isActive: true,
        order_index: 0,
      };
      setTabs([firstTab]);
      setActiveTab(firstTab);

      // Update URL
      navigate(`/docs/${newDoc.id}`, { replace: true });

    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDocumentTitle = async (title: string) => {
    if (!document) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ title })
        .eq('id', document.id);

      if (error) throw error;

      setDocument({ ...document, title });
    } catch (error) {
      console.error('Error saving title:', error);
      toast({
        title: "Error",
        description: "Failed to save title",
        variant: "destructive",
      });
    }
  };

  const saveTabContent = async (tabId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('document_tabs')
        .update({ content })
        .eq('id', tabId);

      if (error) throw error;

      // Update local state
      setTabs(tabs.map(tab => 
        tab.id === tabId ? { ...tab, content } : tab
      ));
      
      if (activeTab?.id === tabId) {
        setActiveTab({ ...activeTab, content });
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleTabClick = async (tab: DocTab) => {
    // Save current tab content before switching
    if (activeTab && editor) {
      await saveTabContent(activeTab.id, editor.getHTML());
    }

    // Update active states in database
    try {
      const { error } = await supabase
        .from('document_tabs')
        .update({ is_active: false })
        .eq('document_id', document?.id);

      if (error) throw error;

      const { error: activeError } = await supabase
        .from('document_tabs')
        .update({ is_active: true })
        .eq('id', tab.id);

      if (activeError) throw activeError;

      // Update local state
      setTabs(tabs.map(t => ({ ...t, isActive: t.id === tab.id })));
      setActiveTab({ ...tab, isActive: true });

    } catch (error) {
      console.error('Error switching tab:', error);
      toast({
        title: "Error",
        description: "Failed to switch tab",
        variant: "destructive",
      });
    }
  };

  const addNewTab = async () => {
    if (!document) return;

    try {
      const { data: newTab, error } = await supabase
        .from('document_tabs')
        .insert({
          document_id: document.id,
          title: 'Untitled Tab',
          content: '<p></p>',
          order_index: tabs.length,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;

      const tabData = {
        id: newTab.id,
        title: newTab.title,
        content: newTab.content || '',
        isActive: false,
        order_index: newTab.order_index,
      };

      setTabs([...tabs, tabData]);
      
      toast({
        title: "Success",
        description: "New tab created",
      });

    } catch (error) {
      console.error('Error creating tab:', error);
      toast({
        title: "Error", 
        description: "Failed to create tab",
        variant: "destructive",
      });
    }
  };

  const formatText = (format: string) => {
    if (!editor) return;

    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'alignLeft':
        editor.chain().focus().setTextAlign('left').run();
        break;
      case 'alignCenter':
        editor.chain().focus().setTextAlign('center').run();
        break;
      case 'alignRight':
        editor.chain().focus().setTextAlign('right').run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
    }
  };

  if (loading) {
    return (
      <SidebarProvider defaultOpen={false}>
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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex">
          {/* Main App Header */}
          <div className="flex-1 flex flex-col">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/docs')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Docs
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Header />
                </div>
              </div>
            </div>

            <div className="flex-1 flex">
              {/* Document Tabs Sidebar */}
              <div className="w-64 bg-background border-r border-border">
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Document tabs</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addNewTab}
                      className="w-full justify-start"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tab
                    </Button>
                  </div>

                  <div className="space-y-1">
                    {tabs.map((tab) => (
                      <Button
                        key={tab.id}
                        variant={tab.isActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleTabClick(tab)}
                        className="w-full justify-start text-left text-xs h-auto py-2 px-3"
                      >
                        <div className="truncate">{tab.title}</div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Editor Area */}
              <div className="flex-1 flex flex-col">
                {/* Document Header */}
                <div className="border-b border-border p-4">
                  <Input
                    value={document?.title || ''}
                    onChange={(e) => {
                      if (document) {
                        setDocument({ ...document, title: e.target.value });
                      }
                    }}
                    onBlur={(e) => saveDocumentTitle(e.target.value)}
                    className="text-lg font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
                    placeholder="Document title"
                  />
                </div>

                {/* Toolbar */}
                <div className="border-b border-border p-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('bold')}
                      className={editor?.isActive('bold') ? 'bg-muted' : ''}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('italic')}
                      className={editor?.isActive('italic') ? 'bg-muted' : ''}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('underline')}
                      className={editor?.isActive('underline') ? 'bg-muted' : ''}
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                    
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('alignLeft')}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('alignCenter')}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('alignRight')}
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                    
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('bulletList')}
                      className={editor?.isActive('bulletList') ? 'bg-muted' : ''}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('orderedList')}
                      className={editor?.isActive('orderedList') ? 'bg-muted' : ''}
                    >
                      <ListOrdered className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-auto">
                  <div className="max-w-4xl mx-auto">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}