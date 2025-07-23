import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Package2, DollarSign, ArrowRight, Calculator, Minus, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProductCategory {
  id: string;
  name: string;
  created_at: string;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
}

interface ProductCategoryWithProducts extends ProductCategory {
  products: Product[];
  productCount: number;
  avgCogs: number;
  cogsRange: { min: number; max: number };
}

interface Supply {
  id: string;
  name: string;
  price?: number;
  unit: string;
}

interface ProductSupply {
  id: string;
  product_id: string;
  supply_id: string;
  quantity: number;
  unit: string;
  supply: Supply;
}

export const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ProductCategoryWithProducts[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryWithProducts | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSupplies, setProductSupplies] = useState<ProductSupply[]>([]);
  const [availableSupplies, setAvailableSupplies] = useState<Supply[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSupplyDialogOpen, setIsSupplyDialogOpen] = useState(false);

  // Form state
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [productForm, setProductForm] = useState({ name: '', category_id: '' });
  const [supplyForm, setSupplyForm] = useState({
    supply_id: '',
    quantity: '',
    unit: ''
  });

  useEffect(() => {
    fetchCategoriesWithProducts();
    fetchAvailableSupplies();
  }, []);

  const fetchCategoriesWithProducts = async () => {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('product_categories')
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

    const categoriesWithProducts = await Promise.all(
      (categoriesData || []).map(async (category) => {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', category.id)
          .order('name');

        // Calculate COGS for each product
        const products = productsData || [];
        const cogsData = await Promise.all(
          products.map(async (product) => {
            const { data: cogs } = await supabase
              .rpc('calculate_product_cogs', { product_uuid: product.id });
            return cogs || 0;
          })
        );

        const avgCogs = cogsData.length > 0 ? cogsData.reduce((a, b) => a + b, 0) / cogsData.length : 0;
        const minCogs = cogsData.length > 0 ? Math.min(...cogsData) : 0;
        const maxCogs = cogsData.length > 0 ? Math.max(...cogsData) : 0;

        return {
          ...category,
          products,
          productCount: products.length,
          avgCogs,
          cogsRange: { min: minCogs, max: maxCogs }
        };
      })
    );

    setCategories(categoriesWithProducts);
  };

  const fetchAvailableSupplies = async () => {
    const { data, error } = await supabase
      .from('supplies')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error fetching supplies",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAvailableSupplies(data || []);
    }
  };

  const fetchProductSupplies = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_supplies')
      .select(`
        *,
        supply:supplies(*)
      `)
      .eq('product_id', productId);

    if (error) {
      toast({
        title: "Error fetching product supplies",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProductSupplies(data || []);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim() || !user) return;

    const { error } = await supabase
      .from('product_categories')
      .insert({ name: categoryForm.name.trim(), user_id: user.id });

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
      fetchCategoriesWithProducts();
    }
  };

  const handleCreateProduct = async () => {
    if (!productForm.name.trim() || !productForm.category_id || !user) return;

    const { error } = await supabase
      .from('products')
      .insert({
        name: productForm.name.trim(),
        category_id: productForm.category_id,
        user_id: user.id
      });

    if (error) {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Product created",
        description: `${productForm.name} has been added.`,
      });
      setProductForm({ name: '', category_id: '' });
      setIsProductDialogOpen(false);
      fetchCategoriesWithProducts();
      if (selectedCategory) {
        const updatedCategory = categories.find(c => c.id === selectedCategory.id);
        if (updatedCategory) {
          setSelectedCategory(updatedCategory);
        }
      }
    }
  };

  const handleAddSupply = async () => {
    if (!supplyForm.supply_id || !supplyForm.quantity || !supplyForm.unit || !selectedProduct) return;

    const { error } = await supabase
      .from('product_supplies')
      .insert({
        product_id: selectedProduct.id,
        supply_id: supplyForm.supply_id,
        quantity: parseFloat(supplyForm.quantity),
        unit: supplyForm.unit.trim()
      });

    if (error) {
      toast({
        title: "Error adding supply",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Supply added",
        description: "Supply has been added to the product.",
      });
      setSupplyForm({ supply_id: '', quantity: '', unit: '' });
      setIsSupplyDialogOpen(false);
      fetchProductSupplies(selectedProduct.id);
      fetchCategoriesWithProducts();
    }
  };

  const handleRemoveSupply = async (supplyId: string) => {
    const { error } = await supabase
      .from('product_supplies')
      .delete()
      .eq('id', supplyId);

    if (error) {
      toast({
        title: "Error removing supply",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Supply removed",
        description: "Supply has been removed from the product.",
      });
      if (selectedProduct) {
        fetchProductSupplies(selectedProduct.id);
      }
      fetchCategoriesWithProducts();
    }
  };

  const calculateProductCogs = (supplies: ProductSupply[]): number => {
    return supplies.reduce((total, ps) => {
      const price = ps.supply.price || 0;
      return total + (price * ps.quantity);
    }, 0);
  };

  const openProductDialog = (categoryId?: string) => {
    setProductForm({ name: '', category_id: categoryId || '' });
    setIsProductDialogOpen(true);
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    fetchProductSupplies(product.id);
  };

  const goBackToCategory = () => {
    setSelectedProduct(null);
    setProductSupplies([]);
  };

  if (selectedProduct) {
    const currentCogs = calculateProductCogs(productSupplies);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={goBackToCategory}>
              ← Back to {selectedCategory?.name}
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{selectedProduct.name}</h2>
              <p className="text-muted-foreground">Manage supplies and calculate COGS</p>
            </div>
          </div>
          <Dialog open={isSupplyDialogOpen} onOpenChange={setIsSupplyDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supply
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Supply to Product</DialogTitle>
                <DialogDescription>
                  Add a supply item with dosage to this product's recipe.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supply-select">Supply</Label>
                  <select
                    id="supply-select"
                    value={supplyForm.supply_id}
                    onChange={(e) => setSupplyForm(prev => ({ ...prev, supply_id: e.target.value }))}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select a supply</option>
                    {availableSupplies.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.name} ({supply.unit})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={supplyForm.quantity}
                      onChange={(e) => setSupplyForm(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={supplyForm.unit}
                      onChange={(e) => setSupplyForm(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="oz, lbs, each"
                    />
                  </div>
                </div>
                
                <Button onClick={handleAddSupply} className="w-full">
                  Add Supply
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package2 className="h-5 w-5" />
                  Product Recipe
                </CardTitle>
                <CardDescription>
                  Supplies and dosages for {selectedProduct.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productSupplies.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Package2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No supplies added yet.</p>
                    <p className="text-sm">Add supplies to calculate COGS.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productSupplies.map((ps) => (
                      <div key={ps.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <h4 className="font-medium">{ps.supply.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {ps.quantity} {ps.unit}
                            {ps.supply.price && (
                              <span className="ml-2">
                                @ ${ps.supply.price.toFixed(2)}/{ps.supply.unit}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {ps.supply.price && (
                            <Badge variant="secondary">
                              ${(ps.quantity * ps.supply.price).toFixed(2)}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSupply(ps.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      ${currentCogs.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total COGS per unit</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Supplies with pricing:</span>
                      <span>
                        {productSupplies.filter(ps => ps.supply.price).length} of {productSupplies.length}
                      </span>
                    </div>
                    
                    {productSupplies.filter(ps => !ps.supply.price).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <p>Note: Some supplies don't have pricing set.</p>
                        <p>Update supply prices for accurate COGS.</p>
                      </div>
                    )}
                  </div>
                  
                  {currentCogs > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <h5 className="font-medium">Suggested Pricing:</h5>
                        <div className="flex justify-between">
                          <span>2x markup:</span>
                          <span className="font-medium">${(currentCogs * 2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>3x markup:</span>
                          <span className="font-medium">${(currentCogs * 3).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>4x markup:</span>
                          <span className="font-medium">${(currentCogs * 4).toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedCategory(null)}>
              ← Back to Categories
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{selectedCategory.name}</h2>
              <p className="text-muted-foreground">
                {selectedCategory.productCount} products in this category
              </p>
            </div>
          </div>
          <Button onClick={() => openProductDialog(selectedCategory.id)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCategory.products.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{product.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectProduct(product)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Created {new Date(product.created_at).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => selectProduct(product)}
                >
                  Manage Recipe <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCategory.products.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first product to this category
              </p>
              <Button onClick={() => openProductDialog(selectedCategory.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Product
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product in the {selectedCategory.name} category.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Vanilla Soy Candle"
                />
              </div>
              
              <Button onClick={handleCreateProduct} className="w-full">
                Create Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground">Organize products by category and manage recipes</p>
        </div>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Product Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your products.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  placeholder="e.g., Candles, Wax Melts, Diffusers"
                />
              </div>
              
              <Button onClick={handleCreateCategory} className="w-full">
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No product categories yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating categories to organize your products
            </p>
            <Button onClick={() => setIsCategoryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCategory(category)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package2 className="h-5 w-5" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Products:</span>
                    <Badge variant="secondary">{category.productCount}</Badge>
                  </div>
                  
                  {category.productCount > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg COGS:</span>
                        <span className="font-medium">${category.avgCogs.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">COGS Range:</span>
                        <span className="text-sm">
                          ${category.cogsRange.min.toFixed(2)} - ${category.cogsRange.max.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <Button variant="outline" className="w-full mt-4">
                    View Products <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};