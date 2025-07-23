import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Factory, Calculator, Play, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category_id: string;
  product_categories: {
    name: string;
  };
}

interface ProductionBatch {
  id: string;
  product_id: string;
  batch_size: number;
  calculated_supplies: any;
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
  products: Product;
}

interface Supply {
  id: string;
  name: string;
  unit: string;
  price?: number;
}

interface ProductSupply {
  supply_id: string;
  quantity: number;
  unit: string;
  supplies: Supply;
}

export const Production = () => {
  const { toast } = useToast();
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [batchSize, setBatchSize] = useState('');
  const [calculatedSupplies, setCalculatedSupplies] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, []);

  const fetchBatches = async () => {
    const { data, error } = await supabase
      .from('production_batches')
      .select(`
        *,
        products!inner(
          *,
          product_categories(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching batches",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBatches(data || []);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(name)
      `)
      .order('name');

    if (error) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const calculateBatch = async () => {
    if (!selectedProduct || !batchSize || parseInt(batchSize) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a product and enter a valid batch size.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      // Fetch product supplies
      const { data: productSupplies, error: suppliesError } = await supabase
        .from('product_supplies')
        .select(`
          *,
          supplies(*)
        `)
        .eq('product_id', selectedProduct);

      if (suppliesError) {
        throw suppliesError;
      }

      if (!productSupplies || productSupplies.length === 0) {
        toast({
          title: "No recipe found",
          description: "This product doesn't have any supplies configured. Please add supplies to the product first.",
          variant: "destructive",
        });
        return;
      }

      // Calculate required amounts
      const batchSizeNum = parseInt(batchSize);
      const calculations = productSupplies.map((ps: any) => ({
        supply_id: ps.supply_id,
        supply_name: ps.supplies.name,
        unit_amount: ps.quantity,
        unit: ps.unit,
        total_needed: ps.quantity * batchSizeNum,
        price_per_unit: ps.supplies.price || 0,
        total_cost: (ps.supplies.price || 0) * ps.quantity * batchSizeNum
      }));

      setCalculatedSupplies(calculations);
    } catch (error: any) {
      toast({
        title: "Error calculating batch",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const saveBatch = async () => {
    if (!selectedProduct || !batchSize || calculatedSupplies.length === 0) return;

    const { error } = await supabase
      .from('production_batches')
      .insert({
        product_id: selectedProduct,
        batch_size: parseInt(batchSize),
        calculated_supplies: calculatedSupplies,
        status: 'planned'
      });

    if (error) {
      toast({
        title: "Error saving batch",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Batch saved",
        description: "Production batch has been saved successfully.",
      });
      resetForm();
      setIsDialogOpen(false);
      fetchBatches();
    }
  };

  const updateBatchStatus = async (batchId: string, status: 'planned' | 'in_progress' | 'completed') => {
    const { error } = await supabase
      .from('production_batches')
      .update({ status })
      .eq('id', batchId);

    if (error) {
      toast({
        title: "Error updating batch",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Batch status changed to ${status}.`,
      });
      fetchBatches();
    }
  };

  const resetForm = () => {
    setSelectedProduct('');
    setBatchSize('');
    setCalculatedSupplies([]);
  };

  const getTotalCost = (supplies: any[]): number => {
    return supplies.reduce((total, supply) => total + (supply.total_cost || 0), 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'planned':
        return 'outline';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production Management</h2>
          <p className="text-muted-foreground">Calculate batch requirements and track production</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Production Batch</DialogTitle>
              <DialogDescription>
                Calculate exact material requirements for your production batch.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-select">Product</Label>
                  <select
                    id="product-select"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.product_categories?.name})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="batch-size">Batch Size (units)</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    placeholder="e.g., 50"
                    min="1"
                  />
                </div>
              </div>
              
              <Button 
                onClick={calculateBatch}
                disabled={isCalculating || !selectedProduct || !batchSize}
                className="w-full"
              >
                {isCalculating ? "Calculating..." : "Calculate Requirements"}
              </Button>
              
              {calculatedSupplies.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h4 className="font-semibold">Material Requirements</h4>
                  
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2">
                      {calculatedSupplies.map((supply, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium">{supply.supply_name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {supply.unit_amount} {supply.unit} per unit × {batchSize} units
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {supply.total_needed.toFixed(2)} {supply.unit}
                              </div>
                              {supply.price_per_unit > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  ${supply.total_cost.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span className="font-semibold">Total Batch Cost:</span>
                    <span className="font-bold text-lg">
                      ${getTotalCost(calculatedSupplies).toFixed(2)}
                    </span>
                  </div>
                  
                  <Button onClick={saveBatch} className="w-full">
                    Save Production Batch
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {batches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Factory className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No production batches yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first production batch to get started
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Batch
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{batch.products.name}</CardTitle>
                      <CardDescription>
                        {batch.products.product_categories?.name}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(batch.status)} className="flex items-center gap-1">
                      {getStatusIcon(batch.status)}
                      {batch.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Batch Size:</span>
                      <Badge variant="outline">{batch.batch_size} units</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold">
                        ${getTotalCost(batch.calculated_supplies || []).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cost per Unit:</span>
                      <span className="text-sm">
                        ${(getTotalCost(batch.calculated_supplies || []) / batch.batch_size).toFixed(2)}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Materials ({(batch.calculated_supplies || []).length}):</h5>
                      <ScrollArea className="max-h-24">
                        <div className="space-y-1">
                          {(batch.calculated_supplies || []).map((supply: any, index: number) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              {supply.supply_name}: {supply.total_needed.toFixed(2)} {supply.unit}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      {batch.status === 'planned' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBatchStatus(batch.id, 'in_progress')}
                          className="flex-1"
                        >
                          Start
                        </Button>
                      )}
                      
                      {batch.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateBatchStatus(batch.id, 'completed')}
                          className="flex-1"
                        >
                          Complete
                        </Button>
                      )}
                      
                      {batch.status === 'completed' && (
                        <div className="flex-1 text-center text-sm text-muted-foreground py-1">
                          Completed {new Date(batch.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};