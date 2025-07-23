import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Play, Edit2, Save, Loader2, TrendingUp, Target, DollarSign, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  external_id: string;
}

interface AnalysisResults {
  titleAnalysis: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  seoAnalysis: {
    keywordDensity: string;
    missingKeywords: string[];
    recommendedTags: string[];
  };
  pricingAnalysis: {
    competitiveness: string;
    suggestedPrice: number;
    reasoning: string;
  };
  descriptionAnalysis: {
    readabilityScore: number;
    improvements: string[];
    suggestedDescription: string;
  };
  marketResearch: {
    targetAudience: string;
    competitorInsights: string;
    trends: string[];
  };
  overallScore: number;
  priorityActions: string[];
}

export const OptimizeListing = () => {
  const { optimizationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchListings();
    if (optimizationId) {
      fetchOptimization();
    }
  }, [optimizationId]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load listings",
        variant: "destructive",
      });
    }
  };

  const fetchOptimization = async () => {
    if (!optimizationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listing_optimizations')
        .select(`
          *,
          listing:listings(*)
        `)
        .eq('id', optimizationId)
        .single();

      if (error) throw error;
      
      if (data) {
        setSelectedListing(data.listing);
        if (data.analysis_results) {
          setAnalysisResults(data.analysis_results as unknown as AnalysisResults);
        }
        setEditValues({
          title: data.listing.title,
          description: data.listing.description,
          price: data.listing.price,
        });
      }
    } catch (error) {
      console.error('Error fetching optimization:', error);
      toast({
        title: "Error",
        description: "Failed to load optimization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleListingSelect = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setSelectedListing(listing);
      setEditValues({
        title: listing.title,
        description: listing.description,
        price: listing.price,
      });
    }
  };

  const runAnalysis = async () => {
    if (!selectedListing) return;

    setAnalyzing(true);
    try {
      // Create optimization record
      const { data: optimization, error: createError } = await supabase
        .from('listing_optimizations')
        .insert({
          listing_id: selectedListing.id,
          original_data: selectedListing as any,
          status: 'analyzing',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (createError) throw createError;

      // Call AI analysis
      const response = await supabase.functions.invoke('analyze-listing', {
        body: { listingData: selectedListing }
      });

      if (response.error) throw response.error;

      const analysis = response.data.analysis;
      setAnalysisResults(analysis);

      // Update optimization record
      await supabase
        .from('listing_optimizations')
        .update({
          analysis_results: analysis,
          status: 'completed'
        })
        .eq('id', optimization.id);

      toast({
        title: "Analysis Complete",
        description: "Your listing has been analyzed with AI recommendations",
      });

    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: "Analysis Failed", 
        description: "Failed to analyze listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = async (field: string) => {
    if (!selectedListing) return;

    try {
      const updateData = { [field]: editValues[field] };
      
      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', selectedListing.id);

      if (error) throw error;

      setSelectedListing({ ...selectedListing, ...updateData });
      setEditingField(null);
      
      toast({
        title: "Saved",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return "bg-green-50 text-green-700 border-green-200";
    if (score >= 6) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Loading...</h1>
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
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Optimize Listing</h1>
          <p className="text-muted-foreground">AI-powered analysis and optimization recommendations</p>
        </div>
      </div>

      {!selectedListing && !optimizationId && (
        <Card>
          <CardHeader>
            <CardTitle>Select Listing to Optimize</CardTitle>
            <CardDescription>Choose an existing Etsy listing for AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleListingSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a listing" />
              </SelectTrigger>
              <SelectContent>
                {listings.map((listing) => (
                  <SelectItem key={listing.id} value={listing.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{listing.title}</span>
                      <span className="text-muted-foreground ml-2">${listing.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {selectedListing && !analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Analyze</CardTitle>
            <CardDescription>
              Selected: <span className="font-medium">{selectedListing.title}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runAnalysis} disabled={analyzing} className="w-full">
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedListing && analysisResults && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Overall Analysis Score</span>
                <Badge className={getScoreBadge(analysisResults.overallScore)}>
                  {analysisResults.overallScore}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Priority Actions</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysisResults.priorityActions.map((action, index) => (
                      <li key={index}>• {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Title Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Title</span>
                  <Badge className={getScoreBadge(analysisResults.titleAnalysis.score)}>
                    {analysisResults.titleAnalysis.score}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Current Title</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('title')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {editingField === 'title' ? (
                    <div className="space-y-2">
                      <Input
                        value={editValues.title}
                        onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleSave('title')}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{selectedListing.title}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h5 className="font-medium text-sm mb-2">Suggestions</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysisResults.titleAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Pricing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Current Price</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('price')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {editingField === 'price' ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editValues.price}
                        onChange={(e) => setEditValues({ ...editValues, price: parseFloat(e.target.value) })}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleSave('price')}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">${selectedListing.price}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h5 className="font-medium text-sm mb-2">AI Recommendation</h5>
                  <p className="text-lg font-bold text-green-600 mb-2">
                    ${analysisResults.pricingAnalysis.suggestedPrice}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {analysisResults.pricingAnalysis.reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>SEO & Keywords</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Recommended Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {analysisResults.seoAnalysis.recommendedTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="font-medium text-sm mb-2">Missing Keywords</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysisResults.seoAnalysis.missingKeywords.map((keyword, index) => (
                      <li key={index}>• {keyword}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Description</span>
                  <Badge className={getScoreBadge(analysisResults.descriptionAnalysis.readabilityScore)}>
                    {analysisResults.descriptionAnalysis.readabilityScore}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Current Description</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('description')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {editingField === 'description' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editValues.description}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                        rows={6}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleSave('description')}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedListing.description}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <h5 className="font-medium text-sm mb-2">Improvements</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysisResults.descriptionAnalysis.improvements.map((improvement, index) => (
                      <li key={index}>• {improvement}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};