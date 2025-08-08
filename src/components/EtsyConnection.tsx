import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, ExternalLink, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EtsyConnection {
  id: string;
  shop_id: string;
  shop_name: string;
  is_active: boolean;
  last_sync_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export const EtsyConnection = () => {
  const { toast } = useToast();
  const [connection, setConnection] = useState<EtsyConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('etsy_connections')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setConnection(data);
    } catch (error) {
      console.error('Error checking Etsy connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateConnection = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('etsy-oauth', {
        body: { action: 'connect' }
      });

      if (error) throw error;

      if (data.authUrl) {
        // Open the OAuth URL in a new window
        const popup = window.open(
          data.authUrl,
          'etsy-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for the popup to close
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if connection was successful
            setTimeout(() => {
              checkConnection();
            }, 1000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error initiating Etsy connection:', error);
      toast({
        title: "Connection Error",
        description: "Failed to initiate Etsy connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectShop = async () => {
    if (!connection) return;

    try {
      const { error } = await supabase
        .from('etsy_connections')
        .update({ is_active: false })
        .eq('id', connection.id);

      if (error) throw error;

      setConnection(null);
      toast({
        title: "Shop Disconnected",
        description: "Your Etsy shop has been disconnected successfully.",
      });
    } catch (error) {
      console.error('Error disconnecting shop:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect shop. Please try again.",
        variant: "destructive",
      });
    }
  };

  const syncShop = async () => {
    if (!connection) return;

    try {
      const { error } = await supabase.functions.invoke('etsy-sync', {
        body: { shopId: connection.shop_id }
      });

      if (error) throw error;

      // Update last sync time
      await supabase
        .from('etsy_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', connection.id);

      setConnection(prev => prev ? { ...prev, last_sync_at: new Date().toISOString() } : null);

      toast({
        title: "Sync Complete",
        description: "Your shop data has been synchronized successfully.",
      });
    } catch (error) {
      console.error('Error syncing shop:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync shop data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isTokenExpiring = () => {
    if (!connection?.expires_at) return false;
    const expiryDate = new Date(connection.expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Etsy Shop Connection
        </CardTitle>
        <CardDescription>
          Connect your Etsy shop to sync listings and enable optimization features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection ? (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold flex items-center gap-2">
                  {connection.shop_name}
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Shop ID: {connection.shop_id}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={syncShop}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Sync
              </Button>
            </div>

            {isTokenExpiring() && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Your connection expires soon. Please reconnect to maintain access.
                </span>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Connected:</span>
                <p className="font-medium">
                  {format(new Date(connection.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Sync:</span>
                <p className="font-medium">
                  {connection.last_sync_at 
                    ? format(new Date(connection.last_sync_at), 'MMM d, yyyy')
                    : 'Never'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(`https://www.etsy.com/shop/${connection.shop_name}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Shop
              </Button>
              <Button variant="destructive" size="sm" onClick={disconnectShop}>
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Etsy Shop</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Etsy shop to start optimizing your listings with AI-powered insights.
            </p>
            <Button onClick={initiateConnection} disabled={connecting}>
              {connecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 mr-2" />
                  Connect Etsy Shop
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};