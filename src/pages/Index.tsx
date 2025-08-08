import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { InventoryDashboard } from "@/components/InventoryDashboard";
import { InventoryTable, FragranceItem } from "@/components/InventoryTable";
import { FragranceForm } from "@/components/FragranceForm";
import { ListingsManagement } from "@/components/ListingsManagement";
import { DesignIdeas } from "@/components/DesignIdeas";
import { ListingsOptimizer } from "@/components/ListingsOptimizer";
import { Planning } from "@/components/Planning";
import { Supplies } from "@/components/Supplies";
import { Products } from "@/components/Products";
import { Production } from "@/components/Production";
import Docs from "@/pages/Docs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FragranceItem | null>(null);
  
  // Empty inventory initially
  const [inventory, setInventory] = useState<FragranceItem[]>([]);

  // Get active tab from URL params, default to "inventory"
  const activeTab = searchParams.get('tab') || 'inventory';

  // Render current view based on active tab
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <div className="space-y-8">
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
          </div>
        );
      case 'listings':
        return <ListingsManagement fragrances={inventory} />;
      case 'listings-optimizer':
        return <ListingsOptimizer />;
      case 'design-ideas':
        return <DesignIdeas />;
      case 'planning':
        return <Planning />;
      case 'supplies':
        return <Supplies />;
      case 'products':
        return <Products />;
      case 'production':
        return <Production />;
      case 'docs':
        return <Docs />;
      default:
        return (
          <div className="space-y-8">
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
          </div>
        );
    }
  };

  const dashboardStats = {
    totalSKUs: inventory.length,
    lowStock: inventory.filter(item => item.status === 'low-stock').length,
    outOfStock: inventory.filter(item => item.status === 'out-of-stock').length,
    lastSyncTime: 'Never',
    etsySyncStatus: 'error' as const,
    wooSyncStatus: 'error' as const,
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Header />
              </div>
            </div>
          </div>
          <main className="flex-1 p-6">
            {renderCurrentView()}
          </main>
        </div>
        
        <FragranceForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveFragrance}
          onDelete={handleDeleteFragrance}
          editingItem={editingItem}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
