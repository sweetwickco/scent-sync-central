import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Performance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Track your revenue and growth</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Performance metrics coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Monitor where customers come from</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Traffic analytics coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Track your sales conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Conversion metrics coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}