import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ETSY_API_KEY = Deno.env.get('ETSY_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shopId } = await req.json();
    
    // Get user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get the Etsy connection
    const { data: connection, error: connectionError } = await supabase
      .from('etsy_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      throw new Error('No active Etsy connection found');
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const expiresAt = new Date(connection.expires_at);
    
    let accessToken = connection.access_token;
    
    if (now >= expiresAt) {
      // Refresh the token
      const refreshResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: ETSY_API_KEY!,
          refresh_token: connection.refresh_token,
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh access token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;
      
      // Update the connection with new token
      const newExpiresAt = new Date(Date.now() + (refreshData.expires_in * 1000));
      await supabase
        .from('etsy_connections')
        .update({
          access_token: accessToken,
          refresh_token: refreshData.refresh_token,
          expires_at: newExpiresAt.toISOString(),
        })
        .eq('id', connection.id);
    }

    // Fetch shop listings
    const listingsResponse = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/active`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': ETSY_API_KEY!,
        },
      }
    );

    if (!listingsResponse.ok) {
      const errorText = await listingsResponse.text();
      console.error('Failed to fetch listings:', errorText);
      throw new Error('Failed to fetch shop listings');
    }

    const listingsData = await listingsResponse.json();

    // Get or create platform record for Etsy
    let { data: platform, error: platformError } = await supabase
      .from('platforms')
      .select('*')
      .eq('type', 'etsy')
      .single();

    if (platformError && platformError.code === 'PGRST116') {
      // Platform doesn't exist, create it
      const { data: newPlatform, error: createError } = await supabase
        .from('platforms')
        .insert({
          name: 'Etsy',
          type: 'etsy',
          api_endpoint: 'https://openapi.etsy.com/v3',
          is_active: true,
        })
        .select()
        .single();

      if (createError) throw createError;
      platform = newPlatform;
    } else if (platformError) {
      throw platformError;
    }

    // Sync listings to database
    const syncedListings = [];
    
    for (const listing of listingsData.results) {
      try {
        // Check if fragrance exists, create if not
        let { data: fragrance, error: fragranceError } = await supabase
          .from('fragrances')
          .select('*')
          .eq('sku', listing.listing_id.toString())
          .single();

        if (fragranceError && fragranceError.code === 'PGRST116') {
          // Fragrance doesn't exist, create it
          const { data: newFragrance, error: createFragranceError } = await supabase
            .from('fragrances')
            .insert({
              sku: listing.listing_id.toString(),
              name: listing.title,
              description: listing.description || '',
              price: parseFloat(listing.price.amount) / listing.price.divisor,
              current_stock: listing.quantity,
              low_stock_threshold: 10,
            })
            .select()
            .single();

          if (createFragranceError) {
            console.error('Error creating fragrance:', createFragranceError);
            continue;
          }
          fragrance = newFragrance;
        } else if (fragranceError) {
          console.error('Error fetching fragrance:', fragranceError);
          continue;
        }

        // Upsert listing
        const { error: listingError } = await supabase
          .from('listings')
          .upsert({
            fragrance_id: fragrance.id,
            platform_id: platform.id,
            title: listing.title,
            description: listing.description || '',
            price: parseFloat(listing.price.amount) / listing.price.divisor,
            quantity: listing.quantity,
            status: listing.state === 'active' ? 'active' : 'inactive',
            etsy_listing_id: listing.listing_id.toString(),
            url: listing.url,
            last_synced_at: new Date().toISOString(),
          });

        if (listingError) {
          console.error('Error upserting listing:', listingError);
          continue;
        }

        syncedListings.push({
          id: listing.listing_id,
          title: listing.title,
          price: parseFloat(listing.price.amount) / listing.price.divisor,
        });
      } catch (error) {
        console.error('Error processing listing:', listing.listing_id, error);
        continue;
      }
    }

    console.log(`Successfully synced ${syncedListings.length} listings`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        syncedCount: syncedListings.length,
        listings: syncedListings 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in etsy-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});