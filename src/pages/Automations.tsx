import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function Automations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Automations</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Automation</CardTitle>
            <CardDescription>Automate repetitive business tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Workflow automation coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Automation</CardTitle>
            <CardDescription>Set up automated email sequences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Email automation coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Get notified when stock runs low</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Inventory automation coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}