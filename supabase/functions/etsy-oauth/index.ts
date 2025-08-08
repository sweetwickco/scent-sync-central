import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ETSY_API_KEY = Deno.env.get('ETSY_API_KEY');
const ETSY_API_SECRET = Deno.env.get('ETSY_API_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!ETSY_API_KEY || !ETSY_API_SECRET) {
  console.error('Missing Etsy API credentials');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, state } = await req.json();
    
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

    if (action === 'connect') {
      // Generate OAuth URL
      const state = user.id; // Use user ID as state for verification
      const redirectUri = `${req.headers.get('origin')}/etsy-callback`;
      const scope = 'listings_r listings_w shops_r';
      
      const authUrl = `https://www.etsy.com/oauth/connect?` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `client_id=${ETSY_API_KEY}&` +
        `state=${state}`;

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'callback' && code) {
      // Exchange code for access token
      const tokenResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: ETSY_API_KEY!,
          client_secret: ETSY_API_SECRET!,
          redirect_uri: `${req.headers.get('origin')}/etsy-callback`,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      
      // Get shop information
      const shopResponse = await fetch('https://openapi.etsy.com/v3/application/shops', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'x-api-key': ETSY_API_KEY!,
        },
      });

      if (!shopResponse.ok) {
        throw new Error('Failed to fetch shop information');
      }

      const shopData = await shopResponse.json();
      const shop = shopData.results[0];

      // Calculate expiry date
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

      // Store connection in database
      const { error: insertError } = await supabase
        .from('etsy_connections')
        .upsert({
          user_id: user.id,
          shop_id: shop.shop_id.toString(),
          shop_name: shop.shop_name,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          is_active: true,
          last_sync_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error('Failed to store connection');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          shop: {
            id: shop.shop_id,
            name: shop.shop_name,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in etsy-oauth function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});