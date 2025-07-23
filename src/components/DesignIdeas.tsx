import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Star, Edit2, StarIcon } from "lucide-react";
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

export const DesignIdeas = () => {
  const [designIdeas, setDesignIdeas] = useState<DesignIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDesignIdeas();
  }, []);

  const fetchDesignIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('design_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesignIdeas(data || []);
    } catch (error) {
      console.error('Error fetching design ideas:', error);
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
        .from('design_ideas')
        .update({ is_starred: !currentStarred })
        .eq('id', id);

      if (error) throw error;

      setDesignIdeas(ideas => 
        ideas.map(idea => 
          idea.id === id ? { ...idea, is_starred: !currentStarred } : idea
        )
      );

      toast({
        title: "Success",
        description: `Design idea ${!currentStarred ? 'starred' : 'unstarred'}`,
      });
    } catch (error) {
      console.error('Error updating star:', error);
      toast({
        title: "Error",
        description: "Failed to update design idea",
        variant: "destructive",
      });
    }
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Idea
        </Button>
      </div>

      {designIdeas.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <div className="text-muted-foreground mb-4">No design ideas yet</div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Design Idea
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Product Type</TableHead>
                <TableHead className="font-semibold">Collection/Targeting</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold text-center w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designIdeas.map((idea) => (
                <TableRow key={idea.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{idea.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {idea.product_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {idea.collection_targeting || '-'}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate text-sm text-muted-foreground">
                      {idea.description || '-'}
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};