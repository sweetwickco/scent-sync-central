import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Sparkles, Brain, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface NewPlanPageProps {
  onBack: () => void;
}

export const NewPlanPage = ({ onBack }: NewPlanPageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'form' | 'generating' | 'results'>('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
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

  const sweetWickPrompt = `You are a strategic planning assistant for Sweet Wick — a premium, handmade candle and wax melt brand known for its clean-burning ingredients and hyper-niched, visually striking labels. Sweet Wick thrives on attention-grabbing designs targeted to specific themes, seasonal events, fandoms, and lifestyle niches. The brand sells through Etsy and a custom website, using platform ads and keyword optimization to drive discovery.

Your job is to turn the user's inputs into a complete, clear, and achievable **plan of action**. The user might be planning a seasonal promotion, launching a new collection, increasing sales, prepping inventory, or experimenting with a new audience — your response must adjust to the inputs accordingly.

Brand Context:
- Candle labels are the centerpiece of Sweet Wick's strategy. Each product is designed around a theme and scent combination.
- Products are hand-poured and made-to-order, with scent batching influencing production planning.
- Sales channels include Etsy and a branded site, with heavy emphasis on conversion-driven visuals and seasonal keywords.
- The business is run lean, so strategies should prioritize impact with limited resources.
- Wax melt bundles are being positioned as a recurring/repeat-purchase product.
- Visuals, emotional resonance, and keyword alignment drive both organic and paid performance.

Target Audience (unless overridden by user input):
- Primarily women aged 25–45 in the U.S.
- Emotionally driven shoppers who purchase based on label relatability, giftability, seasonal themes, and novelty.

Instructions:
Use the following user-provided inputs to craft a tailored plan:
- Plan Title: {title}
- Main Goal: {goal}
- Timeline: {timeline}
- Budget: {budget}
- Target Audience: {target_audience}
- Detailed Description: {description}

Your plan must include:
1. **Plan Summary** – a concise 2-3 sentence overview, referencing the user's goal.
2. **Timeline Breakdown** – week-by-week or phase-by-phase actions based on the timeline.
3. **Marketing Strategy** – align with the goal and audience; include both organic and paid suggestions if relevant.
4. **Operational Considerations** – fulfillment, batching, label prep, scent supply, etc.
5. **Risks or Constraints** – possible bottlenecks or limitations to account for.
6. **Key Metrics** – how to track progress and measure success.
7. **Step-by-Step Task List** – generate a clear, ordered checklist of action items to execute this plan efficiently. Each task should be written clearly enough to drop into a to-do list.

Tone should be modern, practical, and encouraging — never corporate or overly technical.

Optimize every plan for Sweet Wick's real-world workflow: lean team, evolving product catalog, strong visuals, keyword-first thinking, and scalable marketing wins.`;

  const generatePlan = async () => {
    setIsGenerating(true);
    setCurrentStep('generating');
    
    try {
      const customPrompt = sweetWickPrompt
        .replace('{title}', formData.title)
        .replace('{goal}', formData.goal)
        .replace('{timeline}', formData.timeline)
        .replace('{budget}', formData.budget)
        .replace('{target_audience}', formData.target_audience)
        .replace('{description}', formData.description);

      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: { 
          formData,
          customPrompt,
          context: 'Sweet Wick candle business planning'
        }
      });

      if (error) {
        throw error;
      }

      setGeneratedPlan(data);
      setSelectedTaskIds(new Set(data.tasks?.map((_: any, index: number) => index) || [])); 
      setCurrentStep('results');
    } catch (error) {
      toast({
        title: "Error generating plan",
        description: "Failed to generate AI plan. Please try again.",
        variant: "destructive",
      });
      setCurrentStep('form');
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
        ai_generated_plan: generatedPlan,
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
      const task = generatedPlan.tasks[index];
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

    onBack();
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
    setGeneratedPlan(null);
    setSelectedTaskIds(new Set());
    setCurrentStep('form');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Planning
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Plan</h2>
          <p className="text-muted-foreground">
            {currentStep === 'form' && "Let's build a strategic plan tailored for Sweet Wick"}
            {currentStep === 'generating' && "AI is crafting your personalized Sweet Wick strategy..."}
            {currentStep === 'results' && "Review your generated plan and select tasks for your action list"}
          </p>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-8">
          {currentStep === 'form' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Sweet Wick Strategy Assistant</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  This AI planner is trained specifically for Sweet Wick's business model: premium handmade candles with hyper-niched labels, 
                  Etsy and website sales, and lean operations focused on maximum impact.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-base font-medium">Plan Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Fall Halloween Collection Launch"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="goal" className="text-base font-medium">Main Goal</Label>
                  <Input
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                    placeholder="e.g., Generate $15K in Halloween sales"
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="timeline" className="text-base font-medium">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="e.g., 8 weeks (Aug-Oct)"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="budget" className="text-base font-medium">Budget</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g., $2,500 for ads & supplies"
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="target_audience" className="text-base font-medium">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., Halloween enthusiasts, gothic aesthetic lovers, seasonal gifters"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to use Sweet Wick's default audience (women 25-45, emotionally-driven shoppers)
                </p>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-base font-medium">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your vision: specific themes, scent ideas, label concepts, challenges you expect, what success looks like..."
                  rows={5}
                  className="mt-2"
                />
              </div>
              
              <Button 
                onClick={generatePlan} 
                disabled={isGenerating || !formData.title || !formData.description}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Generate Sweet Wick Strategy
              </Button>
            </div>
          )}

          {currentStep === 'generating' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                <Wand2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
              </div>
              
              <div className="w-full max-w-sm bg-secondary rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/60 h-3 rounded-full animate-pulse transition-all duration-1000" 
                     style={{ width: '75%' }}></div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Crafting your Sweet Wick strategy...</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing market trends, seasonal opportunities, and your unique brand positioning
                </p>
              </div>
            </div>
          )}

          {currentStep === 'results' && generatedPlan && (
            <div className="grid grid-cols-3 gap-8">
              {/* Main Plan Details - Left Side */}
              <div className="col-span-2 space-y-6">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Your Sweet Wick Strategy
                    </h3>
                    <Button variant="outline" onClick={() => setCurrentStep('form')}>
                      Edit & Regenerate
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground">Title:</span>
                      <p className="font-medium">{formData.title}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground">Goal:</span>
                      <p className="font-medium">{formData.goal}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground">Timeline:</span>
                      <p className="font-medium">{formData.timeline}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground">Budget:</span>
                      <p className="font-medium">{formData.budget}</p>
                    </div>
                    {formData.target_audience && (
                      <div className="col-span-2 space-y-1">
                        <span className="font-medium text-muted-foreground">Target Audience:</span>
                        <p className="font-medium">{formData.target_audience}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Details Sections */}
                <div className="space-y-6">
                  {generatedPlan.planSummary && (
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2 text-primary">Plan Summary</h4>
                      <p className="text-sm leading-relaxed">{generatedPlan.planSummary}</p>
                    </div>
                  )}

                  {generatedPlan.timelineBreakdown && (
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2 text-primary">Timeline Breakdown</h4>
                      <div className="text-sm leading-relaxed whitespace-pre-line">{renderContent(generatedPlan.timelineBreakdown)}</div>
                    </div>
                  )}

                  {generatedPlan.marketingStrategy && (
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2 text-primary">Marketing Strategy</h4>
                      <div className="text-sm leading-relaxed whitespace-pre-line">{renderContent(generatedPlan.marketingStrategy)}</div>
                    </div>
                  )}

                  {generatedPlan.operationalConsiderations && (
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2 text-primary">Operational Considerations</h4>
                      <div className="text-sm leading-relaxed whitespace-pre-line">{renderContent(generatedPlan.operationalConsiderations)}</div>
                    </div>
                  )}

                  {generatedPlan.risksConstraints && (
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2 text-primary">Risks & Constraints</h4>
                      <div className="text-sm leading-relaxed whitespace-pre-line">{renderContent(generatedPlan.risksConstraints)}</div>
                    </div>
                  )}

                  {generatedPlan.keyMetrics && (
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2 text-primary">Key Metrics</h4>
                      <div className="text-sm leading-relaxed whitespace-pre-line">{renderContent(generatedPlan.keyMetrics)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Items - Right Side */}
              <div className="space-y-4">
                <div className="bg-card border rounded-lg">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold">Action Items</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select tasks to add to your todo list
                    </p>
                  </div>
                  
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-3">
                      {generatedPlan.tasks?.map((task: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors">
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
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <h5 className="font-medium text-sm">{task.title}</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t space-y-3">
                    <Button variant="outline" onClick={generatePlan} disabled={isGenerating} className="w-full">
                      {isGenerating ? "Regenerating..." : "Regenerate Strategy"}
                    </Button>
                    <Button onClick={savePlan} className="w-full" size="lg">
                      Save Plan & Add {selectedTaskIds.size} Tasks
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};