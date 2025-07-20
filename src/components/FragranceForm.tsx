import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, Package } from "lucide-react";
import { FragranceItem } from "./InventoryTable";

interface FragranceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fragrance: Omit<FragranceItem, 'id' | 'lastUpdated'>) => void;
  editingItem?: FragranceItem | null;
}

interface ListingConnection {
  id: string;
  platform: 'etsy' | 'woocommerce';
  listingId: string;
  listingName: string;
  variationId?: string;
}

export function FragranceForm({ isOpen, onClose, onSave, editingItem }: FragranceFormProps) {
  const [formData, setFormData] = useState({
    sku: editingItem?.sku || '',
    name: editingItem?.name || '',
    currentStock: editingItem?.currentStock || 0,
    lowStockThreshold: editingItem?.lowStockThreshold || 3,
    description: '',
  });

  const [connections, setConnections] = useState<ListingConnection[]>([
    // Mock data for demo
    {
      id: '1',
      platform: 'etsy',
      listingId: 'ETY123456',
      listingName: 'Vanilla Bean Candle - Multiple Sizes',
      variationId: 'VAR789',
    },
    {
      id: '2',
      platform: 'woocommerce',
      listingId: 'WOO987654',
      listingName: 'Vanilla Bean Scented Candle',
    },
  ]);

  const [newConnection, setNewConnection] = useState({
    platform: 'etsy' as 'etsy' | 'woocommerce',
    listingId: '',
    listingName: '',
    variationId: '',
  });

  const handleSave = () => {
    if (!formData.sku || !formData.name) return;

    const status = formData.currentStock === 0 
      ? 'out-of-stock' 
      : formData.currentStock <= formData.lowStockThreshold 
        ? 'low-stock' 
        : 'in-stock';

    onSave({
      sku: formData.sku,
      name: formData.name,
      currentStock: formData.currentStock,
      lowStockThreshold: formData.lowStockThreshold,
      etsyListings: connections.filter(c => c.platform === 'etsy').length,
      wooListings: connections.filter(c => c.platform === 'woocommerce').length,
      status: status as 'in-stock' | 'low-stock' | 'out-of-stock',
    });

    onClose();
  };

  const addConnection = () => {
    if (!newConnection.listingId || !newConnection.listingName) return;

    setConnections([
      ...connections,
      {
        ...newConnection,
        id: Date.now().toString(),
      },
    ]);

    setNewConnection({
      platform: 'etsy',
      listingId: '',
      listingName: '',
      variationId: '',
    });
  };

  const removeConnection = (id: string) => {
    setConnections(connections.filter(c => c.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {editingItem ? 'Edit Fragrance' : 'Add New Fragrance'}
          </DialogTitle>
          <DialogDescription>
            {editingItem 
              ? 'Update fragrance details and manage platform connections' 
              : 'Create a new fragrance SKU and connect it to your platform listings'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., VAN-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Fragrance Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Vanilla Bean"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Low Stock Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 3 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional notes about this fragrance..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Connections</CardTitle>
              <DialogDescription>
                Connect this fragrance to specific listings on Etsy and WooCommerce
              </DialogDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Connections */}
              {connections.length > 0 && (
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={connection.platform === 'etsy' ? 'default' : 'secondary'}>
                          {connection.platform === 'etsy' ? 'Etsy' : 'WooCommerce'}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{connection.listingName}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {connection.listingId}
                            {connection.variationId && ` • Variation: ${connection.variationId}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConnection(connection.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Add New Connection */}
              <div className="space-y-3">
                <h4 className="font-medium">Add New Connection</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <select
                      value={newConnection.platform}
                      onChange={(e) => setNewConnection({ ...newConnection, platform: e.target.value as 'etsy' | 'woocommerce' })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="etsy">Etsy</option>
                      <option value="woocommerce">WooCommerce</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Listing ID</Label>
                    <Input
                      value={newConnection.listingId}
                      onChange={(e) => setNewConnection({ ...newConnection, listingId: e.target.value })}
                      placeholder="e.g., 123456789"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Listing Name</Label>
                    <Input
                      value={newConnection.listingName}
                      onChange={(e) => setNewConnection({ ...newConnection, listingName: e.target.value })}
                      placeholder="e.g., Vanilla Bean Candle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Variation ID (Optional)</Label>
                    <Input
                      value={newConnection.variationId}
                      onChange={(e) => setNewConnection({ ...newConnection, variationId: e.target.value })}
                      placeholder="For variations/options"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addConnection}
                  disabled={!newConnection.listingId || !newConnection.listingName}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.sku || !formData.name}>
            <Save className="w-4 h-4 mr-2" />
            {editingItem ? 'Update' : 'Create'} Fragrance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
