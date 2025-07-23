import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ListingOptimization {
  id: string;
  listing_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  original_data: any;
  analysis_results?: any;
  recommendations?: any;
  listing?: {
    title: string;
    price: number;
  };
}

export const ListingsOptimizer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [optimizations, setOptimizations] = useState<ListingOptimization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptimizations();
  }, []);

  const fetchOptimizations = async () => {
    try {
      const { data, error } = await supabase
        .from('listing_optimizations')
        .select(`
          *,
          listing:listings(title, price)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOptimizations(data || []);
    } catch (error) {
      console.error('Error fetching optimizations:', error);
      toast({
        title: "Error",
        description: "Failed to load optimization history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      analyzing: "default",
      completed: "default",
      failed: "destructive",
    } as const;

    const colors = {
      pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
      analyzing: "text-blue-600 bg-blue-50 border-blue-200",
      completed: "text-green-600 bg-green-50 border-green-200",
      failed: "text-red-600 bg-red-50 border-red-200",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const handleOptimizeListing = () => {
    navigate('/optimize-listing');
  };

  const handleViewOptimization = (optimizationId: string) => {
    navigate(`/optimize-listing/${optimizationId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Listings Optimizer</h1>
            <p className="text-muted-foreground">AI-powered Etsy listing optimization and SEO analysis</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Listings Optimizer</h1>
          <p className="text-muted-foreground">AI-powered Etsy listing optimization and SEO analysis</p>
        </div>
        <Button onClick={handleOptimizeListing} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Optimize Listing
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Optimizations</CardTitle>
            <div className="text-2xl font-bold text-foreground">{optimizations.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <div className="text-2xl font-bold text-green-600">
              {optimizations.filter(opt => opt.status === 'completed').length}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <div className="text-2xl font-bold text-blue-600">
              {optimizations.filter(opt => opt.status === 'analyzing').length}
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Optimizations</CardTitle>
          <CardDescription>
            View your latest listing optimization results and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {optimizations.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No optimizations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start optimizing your Etsy listings with AI-powered analysis and recommendations.
              </p>
              <Button onClick={handleOptimizeListing}>
                <Plus className="h-4 w-4 mr-2" />
                Optimize Your First Listing
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {optimizations.map((optimization) => (
                <div
                  key={optimization.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleViewOptimization(optimization.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getStatusIcon(optimization.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {optimization.listing?.title || 'Untitled Listing'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Created {format(new Date(optimization.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {optimization.listing?.price && (
                      <span className="text-sm font-medium text-foreground">
                        ${optimization.listing.price}
                      </span>
                    )}
                    {getStatusBadge(optimization.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};