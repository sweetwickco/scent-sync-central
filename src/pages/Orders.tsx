import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function Orders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>View and manage all your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Order management system coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Track past orders and fulfillment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Order history coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}