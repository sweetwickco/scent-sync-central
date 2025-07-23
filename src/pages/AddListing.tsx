import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { AddListingForm } from "@/components/AddListingForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FragranceItem } from "@/components/InventoryTable";

// This would normally come from props or context, but for now using mock data
// In a real app, you'd get this from a global state or API
const mockFragrances: FragranceItem[] = [];

const AddListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveListing = (listingData: any) => {
    console.log('Saving listing:', listingData);
    toast({
      title: "Listing Created",
      description: "Your listing has been created successfully.",
    });
    
    // Navigate back to listings management
    navigate("/?tab=listings");
  };

  const handleCancel = () => {
    navigate("/?tab=listings");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        {/* Back button and header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Listing</h1>
            <p className="text-muted-foreground">Create a new product listing for Etsy or WooCommerce</p>
          </div>
        </div>

        {/* Add listing form */}
        <AddListingForm
          fragrances={mockFragrances}
          onSave={handleSaveListing}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AddListing;