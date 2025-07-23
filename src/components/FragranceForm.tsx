import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Save, Package, ArrowLeft } from "lucide-react";
import { FragranceItem } from "./InventoryTable";

interface FragranceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fragrance: Omit<FragranceItem, 'id' | 'lastUpdated'>) => void;
  onDelete: (id: string) => void;
  editingItem?: FragranceItem | null;
}

export function FragranceForm({ isOpen, onClose, onSave, onDelete, editingItem }: FragranceFormProps) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    currentStock: 0,
    lowStockThreshold: 3,
    description: '',
  });

  const [platforms, setPlatforms] = useState({
    etsy: false,
    woocommerce: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        sku: editingItem.sku,
        name: editingItem.name,
        currentStock: editingItem.currentStock,
        lowStockThreshold: editingItem.lowStockThreshold,
        description: '',
      });
      setPlatforms({
        etsy: editingItem.etsyListings > 0,
        woocommerce: editingItem.wooListings > 0,
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        currentStock: 0,
        lowStockThreshold: 3,
        description: '',
      });
      setPlatforms({
        etsy: false,
        woocommerce: false,
      });
    }
    setShowDeleteConfirm(false);
  }, [editingItem, isOpen]);

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
      etsyListings: platforms.etsy ? 1 : 0,
      wooListings: platforms.woocommerce ? 1 : 0,
      status: status as 'in-stock' | 'low-stock' | 'out-of-stock',
    });

    onClose();
  };

  const handleDelete = () => {
    if (editingItem) {
      onDelete(editingItem.id);
      onClose();
    }
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
          {showDeleteConfirm ? (
            /* Delete Confirmation */
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Trash2 className="w-12 h-12 text-destructive mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Delete Fragrance</h3>
                    <p className="text-muted-foreground">
                      Are you sure you want to delete "{editingItem?.name}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
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
                    Select which platforms this fragrance should be listed on
                  </DialogDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Etsy</Label>
                        <p className="text-xs text-muted-foreground">List this fragrance on Etsy marketplace</p>
                      </div>
                      <Switch
                        checked={platforms.etsy}
                        onCheckedChange={(checked) => setPlatforms({ ...platforms, etsy: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">WooCommerce</Label>
                        <p className="text-xs text-muted-foreground">List this fragrance on WooCommerce store</p>
                      </div>
                      <Switch
                        checked={platforms.woocommerce}
                        onCheckedChange={(checked) => setPlatforms({ ...platforms, woocommerce: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          {showDeleteConfirm ? (
            <>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Yes, Delete
              </Button>
            </>
          ) : (
            <>
              {editingItem && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mr-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.sku || !formData.name}>
                <Save className="w-4 h-4 mr-2" />
                {editingItem ? 'Update' : 'Create'} Fragrance
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
