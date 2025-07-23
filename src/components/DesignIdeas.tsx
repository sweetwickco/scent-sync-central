import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Palette, Star, Calendar } from "lucide-react";

interface DesignIdea {
  id: string;
  title: string;
  description: string;
  category: 'minimalist' | 'vintage' | 'modern' | 'luxury' | 'seasonal';
  priority: 'high' | 'medium' | 'low';
  dateAdded: string;
  inspiration?: string;
}

const mockDesignIdeas: DesignIdea[] = [
  {
    id: '1',
    title: 'Vintage Apothecary Labels',
    description: 'Classic brown kraft paper with vintage typography and ornamental borders. Perfect for rustic and natural scent collections.',
    category: 'vintage',
    priority: 'high',
    dateAdded: '2024-01-15',
    inspiration: 'Old pharmacy bottles'
  },
  {
    id: '2',
    title: 'Minimalist Geometric Design',
    description: 'Clean lines, geometric shapes, and monochromatic color scheme. Focus on typography with subtle accent colors.',
    category: 'minimalist',
    priority: 'medium',
    dateAdded: '2024-01-20',
    inspiration: 'Scandinavian design'
  },
  {
    id: '3',
    title: 'Luxury Gold Foil Collection',
    description: 'Elegant black labels with gold foil accents, premium typography, and subtle texture. High-end aesthetic for premium candles.',
    category: 'luxury',
    priority: 'high',
    dateAdded: '2024-01-25',
    inspiration: 'High-end cosmetics'
  },
  {
    id: '4',
    title: 'Botanical Watercolor Series',
    description: 'Hand-painted watercolor botanical illustrations with script typography. Soft, organic feel for nature-inspired scents.',
    category: 'modern',
    priority: 'medium',
    dateAdded: '2024-02-01',
    inspiration: 'Botanical gardens'
  },
  {
    id: '5',
    title: 'Seasonal Holiday Collection',
    description: 'Festive designs that can be adapted for different holidays - warm autumn colors, winter whites, spring pastels.',
    category: 'seasonal',
    priority: 'low',
    dateAdded: '2024-02-10',
    inspiration: 'Holiday traditions'
  }
];

export const DesignIdeas = () => {
  const getCategoryColor = (category: DesignIdea['category']) => {
    switch (category) {
      case 'minimalist': return 'bg-accent text-accent-foreground';
      case 'vintage': return 'bg-secondary text-secondary-foreground';
      case 'modern': return 'bg-primary/10 text-primary';
      case 'luxury': return 'bg-muted text-muted-foreground';
      case 'seasonal': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: DesignIdea['priority']) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Design Ideas</h2>
          <p className="text-muted-foreground">
            Your collection of candle label design concepts for future implementation
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Idea
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockDesignIdeas.map((idea) => (
          <Card key={idea.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(idea.dateAdded).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className={getPriorityColor(idea.priority)}>
                    {idea.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                {idea.description}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={getCategoryColor(idea.category)}>
                  {idea.category}
                </Badge>
                {idea.inspiration && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Palette className="h-3 w-3" />
                    {idea.inspiration}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Star className="mr-1 h-3 w-3" />
                  Star
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};