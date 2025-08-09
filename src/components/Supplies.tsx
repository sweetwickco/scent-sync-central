import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Package, Store, DollarSign, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SupplyCategory {
  id: string;
  name: string;
  created_at: string;
}

interface Supply {
  id: string;
  category_id: string;
  name: string;
  vendor?: string;
  price?: number;
  unit: string;
  created_at: string;
}

interface SupplyCategoryWithSupplies extends SupplyCategory {
  supplies: Supply[];
}

export const Supplies = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<SupplyCategoryWithSupplies[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSupplyDialogOpen, setIsSupplyDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<SupplyCategory | null>(null);

  // Form state
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [supplyForm, setSupplyForm] = useState({
    name: '',
    vendor: '',
    price: '',
    unit: '',
    category_id: ''
  });

  useEffect(() => {
    fetchCategoriesWithSupplies();
  }, []);

  const fetchCategoriesWithSupplies = async () => {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('supply_categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      toast({
        title: "Error fetching categories",
        description: categoriesError.message,
        variant: "destructive",
      });
      return;
    }

    const categoriesWithSupplies = await Promise.all(
      (categoriesData || []).map(async (category) => {
        const { data: suppliesData } = await supabase
          .from('supplies')
          .select('*')
          .eq('category_id', category.id)
          .order('name');

        return {
          ...category,
          supplies: suppliesData || []
        };
      })
    );

    setCategories(categoriesWithSupplies);
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) return;

    const { error } = await supabase
      .from('supply_categories')
      .insert({ name: categoryForm.name.trim(), user_id: user?.id! });

    if (error) {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Category created",
        description: `${categoryForm.name} has been added.`,
      });
      setCategoryForm({ name: '' });
      setIsCategoryDialogOpen(false);
      fetchCategoriesWithSupplies();
    }
  };

  const handleCreateSupply = async () => {
    if (!supplyForm.name.trim() || !supplyForm.unit.trim() || !supplyForm.category_id) return;

    const { error } = await supabase
      .from('supplies')
      .insert({
        name: supplyForm.name.trim(),
        vendor: supplyForm.vendor.trim() || null,
        price: supplyForm.price ? parseFloat(supplyForm.price) : null,
        unit: supplyForm.unit.trim(),
        category_id: supplyForm.category_id,
        user_id: user?.id!
      });

    if (error) {
      toast({
        title: "Error creating supply",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Supply created",
        description: `${supplyForm.name} has been added.`,
      });
      resetSupplyForm();
      setIsSupplyDialogOpen(false);
      fetchCategoriesWithSupplies();
    }
  };

  const handleEditSupply = (supply: Supply) => {
    setEditingSupply(supply);
    setSupplyForm({
      name: supply.name,
      vendor: supply.vendor || '',
      price: supply.price?.toString() || '',
      unit: supply.unit,
      category_id: supply.category_id
    });
    setIsSupplyDialogOpen(true);
  };

  const handleUpdateSupply = async () => {
    if (!editingSupply || !supplyForm.name.trim() || !supplyForm.unit.trim()) return;

    const { error } = await supabase
      .from('supplies')
      .update({
        name: supplyForm.name.trim(),
        vendor: supplyForm.vendor.trim() || null,
        price: supplyForm.price ? parseFloat(supplyForm.price) : null,
        unit: supplyForm.unit.trim(),
        category_id: supplyForm.category_id
      })
      .eq('id', editingSupply.id);

    if (error) {
      toast({
        title: "Error updating supply",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Supply updated",
        description: `${supplyForm.name} has been updated.`,
      });
      resetSupplyForm();
      setEditingSupply(null);
      setIsSupplyDialogOpen(false);
      fetchCategoriesWithSupplies();
    }
  };

  const handleDeleteSupply = async (supply: Supply) => {
    const { error } = await supabase
      .from('supplies')
      .delete()
      .eq('id', supply.id);

    if (error) {
      toast({
        title: "Error deleting supply",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Supply deleted",
        description: `${supply.name} has been removed.`,
      });
      fetchCategoriesWithSupplies();
    }
  };

  const resetSupplyForm = () => {
    setSupplyForm({
      name: '',
      vendor: '',
      price: '',
      unit: '',
      category_id: ''
    });
  };

  const openSupplyDialog = (categoryId?: string) => {
    resetSupplyForm();
    setEditingSupply(null);
    if (categoryId) {
      setSupplyForm(prev => ({ ...prev, category_id: categoryId }));
    }
    setIsSupplyDialogOpen(true);
  };

  const handleDeleteCategory = async (category: SupplyCategory) => {
    // First check if category has supplies
    if (categories.find(c => c.id === category.id)?.supplies.length! > 0) {
      toast({
        title: "Cannot delete category",
        description: "Please delete all supplies in this category first.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('supply_categories')
      .delete()
      .eq('id', category.id);

    if (error) {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Category deleted",
        description: `${category.name} has been removed.`,
      });
      setCategoryToDelete(null);
      fetchCategoriesWithSupplies();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supplies Management</h2>
          <p className="text-muted-foreground">Organize and track your supplies by category</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Supply Category</DialogTitle>
                <DialogDescription>
                  Create a new category to organize your supplies.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ name: e.target.value })}
                    placeholder="e.g., Wax, Wicks, Fragrances"
                  />
                </div>
                
                <Button onClick={handleCreateCategory} className="w-full">
                  Create Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSupplyDialogOpen} onOpenChange={setIsSupplyDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openSupplyDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supply
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSupply ? 'Edit Supply' : 'Add New Supply'}
                </DialogTitle>
                <DialogDescription>
                  {editingSupply ? 'Update supply information.' : 'Add a new supply item to your inventory.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supply-name">Supply Name</Label>
                    <Input
                      id="supply-name"
                      value={supplyForm.name}
                      onChange={(e) => setSupplyForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Soy Wax"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supply-unit">Unit</Label>
                    <Input
                      id="supply-unit"
                      value={supplyForm.unit}
                      onChange={(e) => setSupplyForm(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., lbs, oz, each"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supply-vendor">Vendor (Optional)</Label>
                    <Input
                      id="supply-vendor"
                      value={supplyForm.vendor}
                      onChange={(e) => setSupplyForm(prev => ({ ...prev, vendor: e.target.value }))}
                      placeholder="e.g., ABC Supplies"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supply-price">Price per Unit (Optional)</Label>
                    <Input
                      id="supply-price"
                      type="number"
                      step="0.01"
                      value={supplyForm.price}
                      onChange={(e) => setSupplyForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="supply-category">Category</Label>
                  <select
                    id="supply-category"
                    value={supplyForm.category_id}
                    onChange={(e) => setSupplyForm(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button 
                  onClick={editingSupply ? handleUpdateSupply : handleCreateSupply} 
                  className="w-full"
                >
                  {editingSupply ? 'Update Supply' : 'Add Supply'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {category.name}
                  </CardTitle>
                  <CardDescription>
                    {category.supplies.length} supplies in this category
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openSupplyDialog(category.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supply
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCategoryToDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{category.name}"? This action cannot be undone.
                          {category.supplies.length > 0 && (
                            <span className="block mt-2 text-destructive font-medium">
                              This category contains {category.supplies.length} supplies. Please delete all supplies first.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteCategory(category)}
                          disabled={category.supplies.length > 0}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {category.supplies.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No supplies in this category yet.</p>
                  <p className="text-sm">Click "Add Supply" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.supplies.map((supply) => (
                    <div key={supply.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{supply.name}</h4>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSupply(supply)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupply(supply)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {supply.vendor && (
                          <div className="flex items-center gap-2">
                            <Store className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Vendor:</span>
                            <span>{supply.vendor}</span>
                          </div>
                        )}
                        
                        {supply.price && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Price:</span>
                            <span>${supply.price.toFixed(2)}</span>
                            <Badge variant="outline">{supply.unit}</Badge>
                          </div>
                        )}
                        
                        {!supply.price && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{supply.unit}</Badge>
                          </div>
                        )}
                      </div>
                      
                      {supply.vendor && supply.price && (
                        <Separator className="my-3" />
                      )}
                      
                      {supply.vendor && supply.price && (
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Quick reorder info available</span>
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {categories.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No supply categories yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating categories to organize your supplies
              </p>
              <Button onClick={() => setIsCategoryDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};