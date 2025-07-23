import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, CheckCircle, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    timeline: '',
    budget: '',
    target_audience: '',
    description: ''
  });

  useEffect(() => {
    fetchPlans();
    fetchTodoTasks();
  }, []);

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

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: { 
          formData,
          context: 'fragrance business planning'
        }
      });

      if (error) {
        throw error;
      }

      setGeneratedTasks(data.tasks || []);
      setSelectedTaskIds(new Set(data.tasks?.map((_: any, index: number) => index) || []));
    } catch (error) {
      toast({
        title: "Error generating plan",
        description: "Failed to generate AI plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .insert({
        title: formData.title,
        description: formData.description,
        fields_data: formData,
        ai_generated_plan: generatedTasks,
        status: 'draft',
        user_id: user?.id!
      })
      .select()
      .single();

    if (planError) {
      toast({
        title: "Error saving plan",
        description: planError.message,
        variant: "destructive",
      });
      return;
    }

    // Save selected tasks
    const tasksToAdd = Array.from(selectedTaskIds).map(index => {
      const task = generatedTasks[index];
      return {
        plan_id: planData.id,
        title: task.title,
        description: task.description,
        order_index: index,
        completed: false
      };
    });

    if (tasksToAdd.length > 0) {
      const { error: tasksError } = await supabase
        .from('plan_tasks')
        .insert(tasksToAdd);

      if (tasksError) {
        toast({
          title: "Error saving tasks",
          description: tasksError.message,
          variant: "destructive",
        });
        return;
      }

      // Add selected tasks to todo list
      const todoTasksToAdd = tasksToAdd.map(task => ({
        title: task.title,
        description: task.description,
        completed: false,
        user_id: user?.id!
      }));

      await supabase
        .from('todo_tasks')
        .insert(todoTasksToAdd);
    }

    toast({
      title: "Plan created successfully",
      description: `${formData.title} has been saved with ${tasksToAdd.length} tasks.`,
    });

    setIsCreateDialogOpen(false);
    resetForm();
    fetchPlans();
    fetchTodoTasks();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      goal: '',
      timeline: '',
      budget: '',
      target_audience: '',
      description: ''
    });
    setGeneratedTasks([]);
    setSelectedTaskIds(new Set());
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Business Plan</DialogTitle>
              <DialogDescription>
                Fill out the details below and AI will generate a detailed action plan for you.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Plan Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Launch New Candle Collection"
                  />
                </div>
                <div>
                  <Label htmlFor="goal">Main Goal</Label>
                  <Input
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                    placeholder="e.g., Increase revenue by 25%"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="e.g., 3 months"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g., $5,000"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., Young professionals aged 25-35"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your plan in detail, what you want to accomplish, challenges you expect, etc."
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={generatePlan} 
                disabled={isGenerating || !formData.title || !formData.description}
                className="w-full"
              >
                {isGenerating ? "Generating Plan..." : "Generate AI Plan"}
              </Button>
              
              {generatedTasks.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Generated Action Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    Select the tasks you want to add to your todo list:
                  </p>
                  
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2">
                      {generatedTasks.map((task, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                          <Checkbox
                            checked={selectedTaskIds.has(index)}
                            onCheckedChange={(checked) => {
                              const newSelectedIds = new Set(selectedTaskIds);
                              if (checked) {
                                newSelectedIds.add(index);
                              } else {
                                newSelectedIds.delete(index);
                              }
                              setSelectedTaskIds(newSelectedIds);
                            }}
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{task.title}</h5>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Button onClick={savePlan} className="w-full">
                    Save Plan & Add {selectedTaskIds.size} Tasks to Todo
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
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