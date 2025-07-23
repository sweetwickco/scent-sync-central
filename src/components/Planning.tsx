import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { NewPlanPage } from "./NewPlanPage";

interface Plan {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  ai_generated_plan?: any;
  fields_data?: any;
}

interface PlanTask {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  completed: boolean;
  order_index: number;
}

interface TodoTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

export const Planning = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [todoTasks, setTodoTasks] = useState<TodoTask[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([]);
  const [showNewPlanPage, setShowNewPlanPage] = useState(false);

  useEffect(() => {
    if (!showNewPlanPage) {
      fetchPlans();
      fetchTodoTasks();
    }
  }, [showNewPlanPage]);

  if (showNewPlanPage) {
    return (
      <NewPlanPage 
        onBack={() => {
          setShowNewPlanPage(false);
          fetchPlans();
          fetchTodoTasks();
        }} 
      />
    );
  }

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching plans",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPlans((data || []) as Plan[]);
    }
  };

  const fetchTodoTasks = async () => {
    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching todo tasks",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTodoTasks(data || []);
    }
  };

  const fetchPlanTasks = async (planId: string) => {
    const { data, error } = await supabase
      .from('plan_tasks')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index');

    if (error) {
      toast({
        title: "Error fetching plan tasks",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPlanTasks(data || []);
    }
  };


  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('todo_tasks')
      .update({ completed })
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchTodoTasks();
    }
  };

  const selectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    fetchPlanTasks(plan.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Planning</h2>
          <p className="text-muted-foreground">Plan new initiatives with AI-powered insights</p>
        </div>
        <Button onClick={() => setShowNewPlanPage(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Plans List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Plans</CardTitle>
            <CardDescription>Click on a plan to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-muted transition-colors ${
                      selectedPlan?.id === plan.id ? 'border-primary bg-muted' : ''
                    }`}
                    onClick={() => selectPlan(plan)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{plan.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {plan.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            plan.status === 'active' ? 'default' :
                            plan.status === 'completed' ? 'secondary' :
                            'outline'
                          }>
                            {plan.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(plan.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Todo Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Todo Tasks
            </CardTitle>
            <CardDescription>Tasks from your plans</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {todoTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded ${
                      task.completed ? 'opacity-60 bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => toggleTask(task.id, !!checked)}
                      />
                      <div className="flex-1">
                        <h5 className={`font-medium text-sm ${
                          task.completed ? 'line-through' : ''
                        }`}>
                          {task.title}
                        </h5>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Plan Details */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {selectedPlan.title}
            </CardTitle>
            <CardDescription>{selectedPlan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedPlan.fields_data && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded">
                  <div>
                    <Label className="text-sm font-medium">Goal</Label>
                    <p className="text-sm">{selectedPlan.fields_data.goal}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Timeline</Label>
                    <p className="text-sm">{selectedPlan.fields_data.timeline}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Budget</Label>
                    <p className="text-sm">{selectedPlan.fields_data.budget}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Target Audience</Label>
                    <p className="text-sm">{selectedPlan.fields_data.target_audience}</p>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-3">Plan Tasks</h4>
                <div className="space-y-2">
                  {planTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded ${
                        task.completed ? 'opacity-60 bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <h5 className={`font-medium text-sm ${
                            task.completed ? 'line-through' : ''
                          }`}>
                            {task.title}
                          </h5>
                          {task.description && (
                            <p className="text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};