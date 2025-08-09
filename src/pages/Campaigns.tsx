import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function Campaigns() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Megaphone className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Marketing Campaigns</CardTitle>
            <CardDescription>Create and manage marketing campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Campaign management coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>Send targeted email campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Email campaigns coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Manage your social media presence</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Social media tools coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}