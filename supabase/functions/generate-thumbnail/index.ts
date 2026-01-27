import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ThumbnailRequest {
  url: string;
  width?: number;
  height?: number;
}

interface ThumbnailResponse {
  success: boolean;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, width = 1280, height = 800 }: ThumbnailRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Generating thumbnail for:", formattedUrl);

    // Use screenshotone.com API (free tier available)
    // Or use thum.io which has a simple free API
    const screenshotUrl = `https://image.thum.io/get/width/${width}/crop/${height}/noanimate/${formattedUrl}`;
    
    // Try to fetch meta tags from the URL
    let title = "";
    let description = "";
    
    try {
      const pageResponse = await fetch(formattedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
        
        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (descMatch) {
          description = descMatch[1].trim();
        }
        
        // Try og:description if meta description not found
        if (!description) {
          const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          if (ogDescMatch) {
            description = ogDescMatch[1].trim();
          }
        }
      }
    } catch (e) {
      console.log("Could not fetch page metadata:", e);
    }

    const response: ThumbnailResponse = {
      success: true,
      thumbnail_url: screenshotUrl,
      title,
      description,
    };

    console.log("Thumbnail generated successfully");
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error generating thumbnail:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
