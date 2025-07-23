import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";
import { FragranceItem } from "@/components/InventoryTable";

interface ListingFormData {
  title: string;
  description: string;
  platform: 'etsy' | 'woocommerce' | '';
  price: string;
  fragrance_id: string;
  sku: string;
  variations: Array<{
    id: string;
    name: string;
    price: string;
    fragrance_id: string;
    sku: string;
  }>;
  tags: string[];
  category: string;
  images: string[];
}

interface AddListingFormProps {
  fragrances: FragranceItem[];
  onSave: (data: ListingFormData) => void;
  onCancel: () => void;
}

export function AddListingForm({ fragrances, onSave, onCancel }: AddListingFormProps) {
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    platform: '',
    price: '',
    fragrance_id: '',
    sku: '',
    variations: [],
    tags: [],
    category: '',
    images: []
  });

  const [newTag, setNewTag] = useState('');
  const [newVariation, setNewVariation] = useState({
    name: '',
    price: '',
    fragrance_id: '',
    sku: ''
  });

  // Auto-complete SKU when fragrance is selected
  useEffect(() => {
    if (formData.fragrance_id) {
      const selectedFragrance = fragrances.find(f => f.id === formData.fragrance_id);
      if (selectedFragrance) {
        setFormData(prev => ({
          ...prev,
          sku: selectedFragrance.sku
        }));
      }
    }
  }, [formData.fragrance_id, fragrances]);

  const handleFragranceSelect = (fragranceId: string) => {
    setFormData(prev => ({
      ...prev,
      fragrance_id: fragranceId
    }));
  };

  const handleVariationFragranceSelect = (fragranceId: string) => {
    const selectedFragrance = fragrances.find(f => f.id === fragranceId);
    if (selectedFragrance) {
      setNewVariation(prev => ({
        ...prev,
        fragrance_id: fragranceId,
        sku: selectedFragrance.sku
      }));
    }
  };

  const addVariation = () => {
    if (newVariation.name && newVariation.price && newVariation.fragrance_id) {
      setFormData(prev => ({
        ...prev,
        variations: [...prev.variations, {
          ...newVariation,
          id: Date.now().toString()
        }]
      }));
      setNewVariation({ name: '', price: '', fragrance_id: '', sku: '' });
    }
  };

  const removeVariation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter(v => v.id !== id)
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getFragranceName = (id: string) => {
    return fragrances.find(f => f.id === id)?.name || '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Listing Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Vanilla Bean Candle - 8oz"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of your product..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value: 'etsy' | 'woocommerce') => 
                setFormData(prev => ({ ...prev, platform: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="etsy">Etsy</SelectItem>
                  <SelectItem value="woocommerce">WooCommerce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="24.99"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, category: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candles">Candles</SelectItem>
                <SelectItem value="home-fragrance">Home Fragrance</SelectItem>
                <SelectItem value="aromatherapy">Aromatherapy</SelectItem>
                <SelectItem value="gifts">Gifts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fragrance Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Fragrance Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fragrance">Select Fragrance</Label>
            <Select value={formData.fragrance_id} onValueChange={handleFragranceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a fragrance from your inventory" />
              </SelectTrigger>
              <SelectContent>
                {fragrances.map((fragrance) => (
                  <SelectItem key={fragrance.id} value={fragrance.id}>
                    {fragrance.name} ({fragrance.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.fragrance_id && (
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Auto-filled)</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="SKU will auto-fill"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Product Variations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.variations.length > 0 && (
            <div className="space-y-2">
              {formData.variations.map((variation) => (
                <div key={variation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{variation.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getFragranceName(variation.fragrance_id)} ({variation.sku}) - ${variation.price}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariation(variation.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Separator />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Variation Name</Label>
              <Input
                value={newVariation.name}
                onChange={(e) => setNewVariation(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Large Size"
              />
            </div>

            <div className="space-y-2">
              <Label>Fragrance</Label>
              <Select value={newVariation.fragrance_id} onValueChange={handleVariationFragranceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fragrance" />
                </SelectTrigger>
                <SelectContent>
                  {fragrances.map((fragrance) => (
                    <SelectItem key={fragrance.id} value={fragrance.id}>
                      {fragrance.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={newVariation.price}
                onChange={(e) => setNewVariation(prev => ({ ...prev, price: e.target.value }))}
                placeholder="29.99"
              />
            </div>

            <div className="space-y-2">
              <Label className="invisible">Add</Label>
              <Button type="button" onClick={addVariation} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Variation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags & Keywords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag}>
              Add Tag
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Listing
        </Button>
      </div>
    </form>
  );
}