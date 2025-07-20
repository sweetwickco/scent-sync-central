import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";

interface DashboardStats {
  totalSKUs: number;
  lowStock: number;
  outOfStock: number;
  lastSyncTime: string;
  etsySyncStatus: 'synced' | 'syncing' | 'error';
  wooSyncStatus: 'synced' | 'syncing' | 'error';
}

interface InventoryDashboardProps {
  stats: DashboardStats;
  onAddFragrance: () => void;
  onSyncNow: () => void;
}

export function InventoryDashboard({ stats, onAddFragrance, onSyncNow }: InventoryDashboardProps) {
  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" />Synced</Badge>;
      case 'syncing':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20"><Clock className="w-3 h-3 mr-1" />Syncing</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your candle inventory across Etsy and WooCommerce</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onSyncNow} variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Sync Now
          </Button>
          <Button onClick={onAddFragrance}>
            <Plus className="w-4 h-4 mr-2" />
            Add Fragrance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSKUs}</div>
            <p className="text-xs text-muted-foreground">Active fragrance SKUs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">≤ 3 units remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-foreground">{stats.lastSyncTime}</div>
            <p className="text-xs text-muted-foreground">All platforms</p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Sync Status</CardTitle>
          <CardDescription>Monitor synchronization status across your sales channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Etsy</h4>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              {getSyncStatusBadge(stats.etsySyncStatus)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">WooCommerce</h4>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              {getSyncStatusBadge(stats.wooSyncStatus)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}