import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function EtsyCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: "Connection Failed",
          description: "Etsy connection was cancelled or failed.",
          variant: "destructive",
        });
        window.close();
        return;
      }

      if (!code) {
        toast({
          title: "Connection Error",
          description: "No authorization code received from Etsy.",
          variant: "destructive",
        });
        window.close();
        return;
      }

      try {
        // Exchange code for access token
        const { data, error } = await supabase.functions.invoke('etsy-oauth', {
          body: { 
            action: 'callback', 
            code, 
            state 
          }
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          toast({
            title: "Shop Connected!",
            description: `Successfully connected to ${data.shop.name}`,
          });
        }

        // Close the popup window
        window.close();
      } catch (error) {
        console.error('Callback error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to complete Etsy connection.",
          variant: "destructive",
        });
        window.close();
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing Etsy connection...</p>
      </div>
    </div>
  );
}