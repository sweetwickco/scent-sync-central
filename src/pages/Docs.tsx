import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Doc {
  id: string;
  title: string;
  lastModified: string;
  preview: string;
}

const mockDocs: Doc[] = [
  {
    id: "1",
    title: "AUGUST to do- Listings goal: 250",
    lastModified: "2 hours ago",
    preview: "All weeks Working on 100 designs, have my pumpkin wax melts/leaves listed by 1st week..."
  },
  {
    id: "2", 
    title: "500 CANDLES",
    lastModified: "1 day ago",
    preview: "Production planning for bulk candle manufacturing..."
  },
  {
    id: "3",
    title: "Christmas Box",
    lastModified: "3 days ago", 
    preview: "Holiday product planning and seasonal inventory..."
  },
  {
    id: "4",
    title: "Random ideas",
    lastModified: "1 week ago",
    preview: "Creative concepts and brainstorming notes..."
  }
];

export default function Docs() {
  const navigate = useNavigate();
  const [docs] = useState<Doc[]>(mockDocs);

  const handleCreateDoc = () => {
    navigate(`/docs/new`);
  };

  const handleOpenDoc = (docId: string) => {
    navigate(`/docs/${docId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
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
                    {doc.lastModified}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {doc.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {doc.preview}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
