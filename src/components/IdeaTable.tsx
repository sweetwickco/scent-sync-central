import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Star, Edit2, StarIcon, Save, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IdeaItem {
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

interface IdeaTableProps {
  title: string;
  tableName: "design_ideas" | "new_product_ideas";
  ideas: IdeaItem[];
  onRefresh: () => void;
}

export const IdeaTable = ({ title, tableName, ideas, onRefresh }: IdeaTableProps) => {
  const [showNewRow, setShowNewRow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newIdea, setNewIdea] = useState<NewIdeaForm>({
    name: "",
    product_type: "",
    collection_targeting: "",
    description: ""
  });
  const [editData, setEditData] = useState<NewIdeaForm>({
    name: "",
    product_type: "",
    collection_targeting: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const totalPages = Math.ceil(ideas.length / pageSize);
  const paginatedIdeas = ideas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ is_starred: !currentStarred })
        .eq("id", id);

      if (error) throw error;
      onRefresh();
      toast({
        title: "Success",
        description: `Idea ${!currentStarred ? "starred" : "unstarred"}`,
      });
    } catch (error) {
      console.error("Error updating star:", error);
      toast({
        title: "Error",
        description: "Failed to update idea",
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

  const handleEdit = (idea: IdeaItem) => {
    setEditingId(idea.id);
    setEditData({
      name: idea.name,
      product_type: idea.product_type,
      collection_targeting: idea.collection_targeting || "",
      description: idea.description || ""
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
        .from(tableName)
        .insert({
          name: newIdea.name.trim(),
          product_type: newIdea.product_type.trim(),
          collection_targeting: newIdea.collection_targeting.trim() || null,
          description: newIdea.description.trim() || null,
          user_id: user.user.id,
        });

      if (error) throw error;

      onRefresh();
      setShowNewRow(false);
      toast({
        title: "Success",
        description: "Idea created successfully",
      });
    } catch (error) {
      console.error("Error saving idea:", error);
      toast({
        title: "Error",
        description: "Failed to save idea",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editData.name.trim() || !editData.product_type.trim()) {
      toast({
        title: "Error",
        description: "Name and Product Type are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from(tableName)
        .update({
          name: editData.name.trim(),
          product_type: editData.product_type.trim(),
          collection_targeting: editData.collection_targeting.trim() || null,
          description: editData.description.trim() || null,
        })
        .eq("id", editingId);

      if (error) throw error;

      onRefresh();
      setEditingId(null);
      toast({
        title: "Success",
        description: "Idea updated successfully",
      });
    } catch (error) {
      console.error("Error updating idea:", error);
      toast({
        title: "Error",
        description: "Failed to update idea",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowNewRow(false);
    setEditingId(null);
    setNewIdea({
      name: "",
      product_type: "",
      collection_targeting: "",
      description: ""
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleAddNew}
            variant={tableName === "new_product_ideas" ? "default" : (ideas.length === 0 ? "secondary" : "default")}
            disabled={showNewRow}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Idea
          </Button>
          <Button variant="secondary" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
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
                    placeholder="Describe the concept..."
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
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            
            {ideas.length === 0 && !showNewRow ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">No ideas yet</div>
                  <Button onClick={handleAddNew} variant="secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Idea
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              paginatedIdeas.map((idea) => (
                <TableRow key={idea.id} className="hover:bg-muted/30 transition-colors border-b border-border/30">
                  <TableCell className="font-medium border-r border-border/30">
                    {editingId === idea.id ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="border-none bg-transparent shadow-none focus-visible:ring-0 h-8"
                      />
                    ) : (
                      idea.name
                    )}
                  </TableCell>
                  <TableCell className="border-r border-border/30">
                    {editingId === idea.id ? (
                      <Input
                        value={editData.product_type}
                        onChange={(e) => setEditData(prev => ({ ...prev, product_type: e.target.value }))}
                        className="border-none bg-transparent shadow-none focus-visible:ring-0 h-8"
                      />
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {idea.product_type}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground border-r border-border/30">
                    {editingId === idea.id ? (
                      <Input
                        value={editData.collection_targeting}
                        onChange={(e) => setEditData(prev => ({ ...prev, collection_targeting: e.target.value }))}
                        className="border-none bg-transparent shadow-none focus-visible:ring-0 h-8"
                      />
                    ) : (
                      idea.collection_targeting || "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-md border-r border-border/30">
                    {editingId === idea.id ? (
                      <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        className="border-none bg-transparent shadow-none focus-visible:ring-0 min-h-8 resize-none"
                        rows={1}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {idea.description || "-"}
                      </div>
                    )}
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
                      {editingId === idea.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleUpdate}
                            disabled={saving}
                            className="h-8 w-8 p-0"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(idea)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {ideas.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              entries ({ideas.length} total)
            </span>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};