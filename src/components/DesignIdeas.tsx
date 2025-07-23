import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Star, Edit2, StarIcon, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DesignIdea {
  id: string;
  name: string;
  product_type: string;
  collection_targeting: string | null;
  description: string | null;
  is_starred: boolean;
  created_at: string;
}

interface NewIdeaForm {
  name: string;
  product_type: string;
  collection_targeting: string;
  description: string;
}

export const DesignIdeas = () => {
  const [designIdeas, setDesignIdeas] = useState<DesignIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRow, setShowNewRow] = useState(false);
  const [newIdea, setNewIdea] = useState<NewIdeaForm>({
    name: "",
    product_type: "",
    collection_targeting: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDesignIdeas();
  }, []);

  const fetchDesignIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("design_ideas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesignIdeas(data || []);
    } catch (error) {
      console.error("Error fetching design ideas:", error);
      toast({
        title: "Error",
        description: "Failed to fetch design ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const { error } = await supabase
        .from("design_ideas")
        .update({ is_starred: !currentStarred })
        .eq("id", id);

      if (error) throw error;

      setDesignIdeas(ideas => 
        ideas.map(idea => 
          idea.id === id ? { ...idea, is_starred: !currentStarred } : idea
        )
      );

      toast({
        title: "Success",
        description: `Design idea ${!currentStarred ? "starred" : "unstarred"}`,
      });
    } catch (error) {
      console.error("Error updating star:", error);
      toast({
        title: "Error",
        description: "Failed to update design idea",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setShowNewRow(true);
    setNewIdea({
      name: "",
      product_type: "",
      collection_targeting: "",
      description: ""
    });
  };

  const handleSave = async () => {
    if (!newIdea.name.trim() || !newIdea.product_type.trim()) {
      toast({
        title: "Error",
        description: "Name and Product Type are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("design_ideas")
        .insert({
          name: newIdea.name.trim(),
          product_type: newIdea.product_type.trim(),
          collection_targeting: newIdea.collection_targeting.trim() || null,
          description: newIdea.description.trim() || null,
          user_id: user.user.id,
        });

      if (error) throw error;

      await fetchDesignIdeas();
      setShowNewRow(false);
      toast({
        title: "Success",
        description: "Design idea created successfully",
      });
    } catch (error) {
      console.error("Error saving design idea:", error);
      toast({
        title: "Error",
        description: "Failed to save design idea",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowNewRow(false);
    setNewIdea({
      name: "",
      product_type: "",
      collection_targeting: "",
      description: ""
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Design Ideas</h2>
            <p className="text-muted-foreground">
              Your collection of candle label design concepts for future implementation
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading design ideas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Design Ideas</h2>
          <p className="text-muted-foreground">
            Your collection of candle label design concepts for future implementation
          </p>
        </div>
        <Button 
          onClick={handleAddNew}
          variant={designIdeas.length === 0 ? "secondary" : "default"}
          disabled={showNewRow}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Idea
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold border-r border-border/50">Name</TableHead>
              <TableHead className="font-semibold border-r border-border/50">Product Type</TableHead>
              <TableHead className="font-semibold border-r border-border/50">Collection/Targeting</TableHead>
              <TableHead className="font-semibold border-r border-border/50">Description</TableHead>
              <TableHead className="font-semibold text-center w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showNewRow && (
              <TableRow className="bg-accent/20 animate-in fade-in duration-300 border-b-2 border-primary/20">
                <TableCell className="border-r border-border/30 p-2">
                  <Input
                    value={newIdea.name}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter idea name..."
                    className="border-none bg-transparent shadow-none focus-visible:ring-0 h-8"
                    autoFocus
                  />
                </TableCell>
                <TableCell className="border-r border-border/30 p-2">
                  <Input
                    value={newIdea.product_type}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, product_type: e.target.value }))}
                    placeholder="e.g. Candle, Wax Melt..."
                    className="border-none bg-transparent shadow-none focus-visible:ring-0 h-8"
                  />
                </TableCell>
                <TableCell className="border-r border-border/30 p-2">
                  <Input
                    value={newIdea.collection_targeting}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, collection_targeting: e.target.value }))}
                    placeholder="e.g. Holiday, Premium..."
                    className="border-none bg-transparent shadow-none focus-visible:ring-0 h-8"
                  />
                </TableCell>
                <TableCell className="border-r border-border/30 p-2">
                  <Textarea
                    value={newIdea.description}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the design concept..."
                    className="border-none bg-transparent shadow-none focus-visible:ring-0 min-h-8 resize-none"
                    rows={1}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="h-8 w-8 p-0"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={saving}
                      className="h-8 w-8 p-0 text-muted-foreground"
                    >
                      ✕
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            
            {designIdeas.length === 0 && !showNewRow ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">No design ideas yet</div>
                  <Button onClick={handleAddNew} variant="secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Design Idea
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              designIdeas.map((idea) => (
                <TableRow key={idea.id} className="hover:bg-muted/30 transition-colors border-b border-border/30">
                  <TableCell className="font-medium border-r border-border/30">{idea.name}</TableCell>
                  <TableCell className="border-r border-border/30">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {idea.product_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground border-r border-border/30">
                    {idea.collection_targeting || "-"}
                  </TableCell>
                  <TableCell className="max-w-md border-r border-border/30">
                    <div className="text-sm text-muted-foreground">
                      {idea.description || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(idea.id, idea.is_starred)}
                        className="h-8 w-8 p-0"
                      >
                        {idea.is_starred ? (
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};