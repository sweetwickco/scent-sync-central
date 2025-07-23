import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Search, Filter, MoreHorizontal, Package, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface FragranceItem {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  lowStockThreshold: number;
  etsyListings: number;
  wooListings: number;
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface InventoryTableProps {
  items: FragranceItem[];
  onEditItem: (item: FragranceItem) => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export function InventoryTable({ items, onEditItem, onUpdateStock }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string, stock: number) => {
    switch (status) {
      case 'out-of-stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'low-stock':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Low Stock</Badge>;
      case 'in-stock':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">In Stock</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleStockUpdate = (id: string, currentStock: number, change: number) => {
    const newStock = Math.max(0, currentStock + change);
    onUpdateStock(id, newStock);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Fragrance Inventory
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search fragrances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Items</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("in-stock")}>In Stock</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("low-stock")}>Low Stock</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("out-of-stock")}>Out of Stock</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Fragrance Name</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Etsy Listings</TableHead>
                <TableHead>WooCommerce</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockUpdate(item.id, item.currentStock, -1)}
                        disabled={item.currentStock <= 0}
                        className="h-6 w-6 p-0"
                      >
                        -
                      </Button>
                      <span className="min-w-[2rem] text-center font-medium">{item.currentStock}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockUpdate(item.id, item.currentStock, 1)}
                        className="h-6 w-6 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status, item.currentStock)}</TableCell>
                  <TableCell>
                    <span>{item.etsyListings}</span>
                  </TableCell>
                  <TableCell>
                    <span>{item.wooListings}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEditItem(item)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Fragrance
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Listings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {items.length === 0 ? "No candles in inventory" : "No fragrances found matching your criteria"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}