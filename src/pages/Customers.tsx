import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Database</CardTitle>
            <CardDescription>Manage your customer information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Customer management coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Understand your customer behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Customer analytics coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
            <CardDescription>Message and support your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Customer communication tools coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}