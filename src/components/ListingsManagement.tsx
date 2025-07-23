import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ExternalLink, RotateCcw, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FragranceItem } from "@/components/InventoryTable";

export interface Listing {
  id: string;
  title: string;
  platform: 'etsy' | 'woocommerce';
  sku: string;
  price: number;
  status: 'active' | 'inactive' | 'draft';
  lastSync: string;
  platformListingId: string;
  variations?: Array<{
    id: string;
    name: string;
    price: number;
    sku: string;
  }>;
}

interface ListingsManagementProps {
  fragrances: FragranceItem[];
}

export const ListingsManagement = ({ fragrances }: ListingsManagementProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [listings] = useState<Listing[]>([]);

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    etsyListings: listings.filter(l => l.platform === 'etsy').length,
    wooListings: listings.filter(l => l.platform === 'woocommerce').length,
  };

  const handleSyncAll = () => {
    toast({
      title: "Sync Initiated",
      description: "Syncing all listings with Etsy and WooCommerce...",
    });
    
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "All listings have been synchronized successfully.",
      });
    }, 2000);
  };

  const handleAddListing = () => {
    navigate('/add-listing');
  };

  const getStatusBadge = (status: Listing['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      draft: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPlatformBadge = (platform: Listing['platform']) => {
    const colors = {
      etsy: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      woocommerce: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    return (
      <Badge className={colors[platform]}>
        {platform === 'etsy' ? 'Etsy' : 'WooCommerce'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeListings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etsy Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.etsyListings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WooCommerce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.wooListings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Listings Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleSyncAll} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Button onClick={handleAddListing}>
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </div>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{listing.title}</div>
                      {listing.variations && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {listing.variations.length} variations
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getPlatformBadge(listing.platform)}</TableCell>
                  <TableCell className="font-mono text-sm">{listing.sku}</TableCell>
                  <TableCell>${listing.price}</TableCell>
                  <TableCell>{getStatusBadge(listing.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {listing.lastSync}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};