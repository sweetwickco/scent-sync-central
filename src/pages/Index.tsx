import { useState } from "react";
import { InventoryDashboard } from "@/components/InventoryDashboard";
import { InventoryTable, FragranceItem } from "@/components/InventoryTable";
import { FragranceForm } from "@/components/FragranceForm";
import { ListingsManagement } from "@/components/ListingsManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FragranceItem | null>(null);
  
  // Empty inventory initially
  const [inventory, setInventory] = useState<FragranceItem[]>([]);

  const dashboardStats = {
    totalSKUs: inventory.length,
    lowStock: inventory.filter(item => item.status === 'low-stock').length,
    outOfStock: inventory.filter(item => item.status === 'out-of-stock').length,
    lastSyncTime: '15 mins ago',
    etsySyncStatus: 'synced' as const,
    wooSyncStatus: 'synced' as const,
  };

  const handleAddFragrance = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: FragranceItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSaveFragrance = (fragranceData: Omit<FragranceItem, 'id' | 'lastUpdated'>) => {
    if (editingItem) {
      // Update existing item
      setInventory(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...fragranceData, lastUpdated: 'just now' }
          : item
      ));
      toast({
        title: "Fragrance Updated",
        description: `${fragranceData.name} has been updated successfully.`,
      });
    } else {
      // Add new item
      const newItem: FragranceItem = {
        ...fragranceData,
        id: Date.now().toString(),
        lastUpdated: 'just now',
      };
      setInventory(prev => [...prev, newItem]);
      toast({
        title: "Fragrance Added",
        description: `${fragranceData.name} has been added to your inventory.`,
      });
    }
  };

  const handleDeleteFragrance = (id: string) => {
    const item = inventory.find(item => item.id === id);
    setInventory(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Fragrance Deleted",
      description: `${item?.name} has been removed from your inventory.`,
    });
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const status = newStock === 0 
          ? 'out-of-stock' 
          : newStock <= item.lowStockThreshold 
            ? 'low-stock' 
            : 'in-stock';
        
        return {
          ...item,
          currentStock: newStock,
          status: status as 'in-stock' | 'low-stock' | 'out-of-stock',
          lastUpdated: 'just now',
        };
      }
      return item;
    }));

    toast({
      title: "Stock Updated",
      description: "Inventory quantity has been updated and will sync to all platforms.",
    });
  };

  const handleSyncNow = () => {
    toast({
      title: "Sync Initiated",
      description: "Starting inventory sync across all platforms...",
    });
    
    // Mock sync process
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "All platform inventories have been updated successfully.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
            <TabsTrigger value="listings">Listings Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="space-y-8">
            <InventoryDashboard 
              stats={dashboardStats}
              onAddFragrance={handleAddFragrance}
              onSyncNow={handleSyncNow}
            />
            
            <InventoryTable 
              items={inventory}
              onEditItem={handleEditItem}
              onUpdateStock={handleUpdateStock}
            />
          </TabsContent>
          
          <TabsContent value="listings">
            <ListingsManagement />
          </TabsContent>
        </Tabs>

        <FragranceForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveFragrance}
          onDelete={handleDeleteFragrance}
          editingItem={editingItem}
        />
      </div>
    </div>
  );
};

export default Index;
