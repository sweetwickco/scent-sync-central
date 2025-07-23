import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle, Clock, Target, ChevronDown, ChevronRight } from "lucide-react";
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

interface PlanWithTasks {
  plan: Plan;
  tasks: PlanTask[];
  isExpanded?: boolean;
}

export const Planning = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [todoTasks, setTodoTasks] = useState<TodoTask[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([]);
  const [showNewPlanPage, setShowNewPlanPage] = useState(false);
  const [plansWithTasks, setPlansWithTasks] = useState<PlanWithTasks[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!showNewPlanPage) {
      fetchPlans();
      fetchTodoTasks();
      fetchPlansWithTasks();
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

  const fetchPlansWithTasks = async () => {
    const { data: plansData, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (plansError) {
      toast({
        title: "Error fetching plans",
        description: plansError.message,
        variant: "destructive",
      });
      return;
    }

    const plansWithTasksData: PlanWithTasks[] = [];

    for (const plan of plansData || []) {
      const { data: tasksData, error: tasksError } = await supabase
        .from('plan_tasks')
        .select('*')
        .eq('plan_id', plan.id)
        .order('order_index');

      if (!tasksError) {
        plansWithTasksData.push({
          plan: plan as Plan,
          tasks: tasksData || [],
        });
      }
    }

    setPlansWithTasks(plansWithTasksData);
  };

  const togglePlanExpansion = (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  // Helper function to safely render content that might be an object or string
  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return content;
    } else if (typeof content === 'object' && content !== null) {
      // If it's an object, convert it to readable text
      return Object.entries(content).map(([key, value]) => `${key}: ${value}`).join('\n\n');
    }
    return String(content);
  };

  const togglePlanTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('plan_tasks')
      .update({ completed })
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchPlansWithTasks();
    }
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

        {/* Plan Tasks Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Plan Tasks
            </CardTitle>
            <CardDescription>Tasks organized by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {plansWithTasks.map((planWithTasks) => (
                  <div key={planWithTasks.plan.id} className="border rounded">
                    {/* Plan Overview Box */}
                    <div
                      className="p-3 cursor-pointer hover:bg-muted transition-colors flex items-center justify-between"
                      onClick={() => togglePlanExpansion(planWithTasks.plan.id)}
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">
                          {planWithTasks.plan.title}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {planWithTasks.tasks.length} tasks
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {planWithTasks.tasks.filter(t => t.completed).length}/{planWithTasks.tasks.length}
                        </Badge>
                        {expandedPlans.has(planWithTasks.plan.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Task List */}
                    {expandedPlans.has(planWithTasks.plan.id) && (
                      <div className="border-t bg-muted/30">
                        <div className="p-2 space-y-1">
                          {planWithTasks.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-2 rounded text-xs ${
                                task.completed ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={(checked) => togglePlanTask(task.id, !!checked)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <p className={`font-medium ${
                                    task.completed ? 'line-through' : ''
                                  }`}>
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-muted-foreground line-clamp-2 mt-1">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
            <div className="space-y-6">
              {/* Plan Input Fields */}
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
              
              {/* AI Generated Plan Content */}
              {selectedPlan.ai_generated_plan && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">AI Strategy & Analysis</h3>
                  
                  {/* Plan Summary */}
                  {selectedPlan.ai_generated_plan.planSummary && (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Plan Summary
                      </h4>
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {renderContent(selectedPlan.ai_generated_plan.planSummary)}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Timeline Breakdown */}
                    {selectedPlan.ai_generated_plan.timelineBreakdown && (
                      <div className="bg-card p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Timeline Breakdown
                        </h4>
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {renderContent(selectedPlan.ai_generated_plan.timelineBreakdown)}
                        </div>
                      </div>
                    )}

                    {/* Marketing Strategy */}
                    {selectedPlan.ai_generated_plan.marketingStrategy && (
                      <div className="bg-card p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2 text-primary">Marketing Strategy</h4>
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {renderContent(selectedPlan.ai_generated_plan.marketingStrategy)}
                        </div>
                      </div>
                    )}

                    {/* Operational Considerations */}
                    {selectedPlan.ai_generated_plan.operationalConsiderations && (
                      <div className="bg-card p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2 text-primary">Operational Considerations</h4>
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {renderContent(selectedPlan.ai_generated_plan.operationalConsiderations)}
                        </div>
                      </div>
                    )}

                    {/* Risks & Constraints */}
                    {selectedPlan.ai_generated_plan.risksConstraints && (
                      <div className="bg-card p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2 text-primary">Risks & Constraints</h4>
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {renderContent(selectedPlan.ai_generated_plan.risksConstraints)}
                        </div>
                      </div>
                    )}

                    {/* Key Metrics */}
                    {selectedPlan.ai_generated_plan.keyMetrics && (
                      <div className="bg-card p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2 text-primary">Key Metrics</h4>
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {renderContent(selectedPlan.ai_generated_plan.keyMetrics)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <Separator />
              
              {/* Plan Tasks */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Plan Tasks
                </h4>
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