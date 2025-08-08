import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';

interface DocTab {
  id: string;
  title: string;
  isActive: boolean;
}

const mockTabs: DocTab[] = [
  { id: "main", title: "To Do August", isActive: true },
  { id: "tab1", title: "500 CANDLES", isActive: false },
  { id: "tab2", title: "Christmas Box", isActive: false },
  { id: "tab3", title: "Random ideas", isActive: false },
  { id: "tab4", title: "Pumpkin Wax melts", isActive: false },
  { id: "tab5", title: "Leaves Wax melts", isActive: false },
  { id: "tab6", title: "July Purchases", isActive: false },
  { id: "tab7", title: "Website/software", isActive: false },
  { id: "tab8", title: "August Purchases", isActive: false },
  { id: "tab9", title: "Clamshell Wax melts", isActive: false },
];

const defaultContent = `
<h1>AUGUST to do- Listings goal: 250</h1>
<p><strong>All weeks</strong></p>
<p>Working on 100 designs, have my pumpkin wax melts/leaves listed by 1st week</p>

<p><strong>Week 1 of August</strong></p>
<p>Order bulk fragrances, sample inventory from alibaba</p>

<p><strong>Week 2</strong></p>
<p>Order jars, gift box from alibaba, working on 12 candle designs/project</p>

<p><strong>Rest of August</strong></p>
<p>Order the rest of inventory by EOM</p>

<p><strong>Need overall-</strong></p>
<p>Thank you/review cards</p>
<p>Branded packaging</p>
<p>TAKE PIC OF MYSELF FOR BRANDING</p>
<p>Trustworthy mood listing video</p>

<p><strong>To Do:</strong></p>
<p>Finish carmens order</p>
<p>Start on jazmine tattoo candle</p>
<p>Drop off orders tomorrow</p>
<p>Add more listings</p>
<p>Update the fragrance design</p>
<p>Work on my 5 main projects</p>
`;

export default function DocEditor() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<DocTab[]>(mockTabs);
  const [docTitle, setDocTitle] = useState("LAST QUARTER Plan");

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: defaultContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[600px] p-8',
      },
    },
  });

  const handleTabClick = (tabId: string) => {
    setTabs(tabs.map(tab => ({ ...tab, isActive: tab.id === tabId })));
  };

  const addNewTab = () => {
    const newTab: DocTab = {
      id: `tab-${Date.now()}`,
      title: "Untitled",
      isActive: false,
    };
    setTabs([...tabs, newTab]);
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar - Document Tabs */}
      <div className="w-64 bg-background border-r border-border">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/docs')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Docs
          </Button>
          
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
                onClick={() => handleTabClick(tab.id)}
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
        {/* Header */}
        <div className="border-b border-border p-4">
          <Input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
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
  );
}