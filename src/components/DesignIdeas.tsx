import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { IdeaTable } from "./IdeaTable";

interface IdeaItem {
  id: string;
  name: string;
  product_type: string;
  collection_targeting: string | null;
  description: string | null;
  is_starred: boolean;
  created_at: string;
}

export const DesignIdeas = () => {
  const [newProductIdeas, setNewProductIdeas] = useState<IdeaItem[]>([]);
  const [designIdeas, setDesignIdeas] = useState<IdeaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllIdeas();
  }, []);

  const fetchAllIdeas = async () => {
    try {
      const [newProductResponse, designResponse] = await Promise.all([
        supabase
          .from("new_product_ideas")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("design_ideas")
          .select("*")
          .order("created_at", { ascending: false })
      ]);

      if (newProductResponse.error) throw newProductResponse.error;
      if (designResponse.error) throw designResponse.error;

      setNewProductIdeas(newProductResponse.data || []);
      setDesignIdeas(designResponse.data || []);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading ideas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      <IdeaTable
        title="New Product Ideas"
        tableName="new_product_ideas"
        ideas={newProductIdeas}
        onRefresh={fetchAllIdeas}
      />
      
      <IdeaTable
        title="Design Ideas"
        tableName="design_ideas"
        ideas={designIdeas}
        onRefresh={fetchAllIdeas}
      />
    </div>
  );
};