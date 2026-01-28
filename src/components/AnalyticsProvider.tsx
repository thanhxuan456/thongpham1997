import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsSettings {
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  gtmId: string | null;
}

// Analytics ID validation patterns
const ANALYTICS_PATTERNS = {
  GA_ID: /^G-[A-Z0-9]{10,12}$/, // Google Analytics 4: G-XXXXXXXXXX
  FB_PIXEL: /^[0-9]{15,16}$/, // Facebook Pixel: 15-16 digits
  GTM_ID: /^GTM-[A-Z0-9]{6,8}$/, // Google Tag Manager: GTM-XXXXXX
};

/**
 * Validates analytics IDs to prevent script injection attacks
 */
function isValidAnalyticsId(id: string | null, type: 'GA' | 'FB' | 'GTM'): boolean {
  if (!id || typeof id !== 'string') return false;
  
  const trimmedId = id.trim();
  
  switch (type) {
    case 'GA':
      return ANALYTICS_PATTERNS.GA_ID.test(trimmedId);
    case 'FB':
      return ANALYTICS_PATTERNS.FB_PIXEL.test(trimmedId);
    case 'GTM':
      return ANALYTICS_PATTERNS.GTM_ID.test(trimmedId);
    default:
      return false;
  }
}

/**
 * Sanitizes analytics ID by removing any potentially dangerous characters
 */
function sanitizeAnalyticsId(id: string): string {
  // Only allow alphanumeric characters and hyphens
  return id.replace(/[^a-zA-Z0-9-]/g, '');
}

/**
 * AnalyticsProvider - Tự động inject Google Analytics, Facebook Pixel và GTM
 * khi admin cấu hình ID trong Settings
 * 
 * Security: All analytics IDs are validated against strict patterns
 * to prevent script injection attacks
 */
const AnalyticsProvider = () => {
  const [settings, setSettings] = useState<AnalyticsSettings>({
    googleAnalyticsId: null,
    facebookPixelId: null,
    gtmId: null,
  });

  useEffect(() => {
    const fetchAnalyticsSettings = async () => {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["GOOGLE_ANALYTICS_ID", "FACEBOOK_PIXEL_ID", "GTM_ID"]);

      if (data) {
        const settingsMap: Record<string, string | null> = {};
        data.forEach((item) => {
          settingsMap[item.key] = item.value;
        });

        setSettings({
          googleAnalyticsId: settingsMap["GOOGLE_ANALYTICS_ID"] || null,
          facebookPixelId: settingsMap["FACEBOOK_PIXEL_ID"] || null,
          gtmId: settingsMap["GTM_ID"] || null,
        });
      }
    };

    fetchAnalyticsSettings();
  }, []);

  // Inject Google Analytics (GA4)
  useEffect(() => {
    if (!settings.googleAnalyticsId) return;

    const gaId = settings.googleAnalyticsId;
    
    // Validate format to prevent script injection
    if (!isValidAnalyticsId(gaId, 'GA')) {
      console.error('Invalid Google Analytics ID format:', gaId);
      return;
    }

    const sanitizedGaId = sanitizeAnalyticsId(gaId);
    
    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${sanitizedGaId}"]`)) {
      return;
    }

    // Load gtag.js
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(sanitizedGaId)}`;
    document.head.appendChild(script);

    // Initialize gtag
    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${sanitizedGaId}', {
        page_title: document.title,
        page_location: window.location.href
      });
    `;
    document.head.appendChild(inlineScript);

    console.log("✅ Google Analytics loaded:", sanitizedGaId);

    return () => {
      script.remove();
      inlineScript.remove();
    };
  }, [settings.googleAnalyticsId]);

  // Inject Facebook Pixel
  useEffect(() => {
    if (!settings.facebookPixelId) return;

    const pixelId = settings.facebookPixelId;
    
    // Validate format to prevent script injection
    if (!isValidAnalyticsId(pixelId, 'FB')) {
      console.error('Invalid Facebook Pixel ID format:', pixelId);
      return;
    }

    const sanitizedPixelId = sanitizeAnalyticsId(pixelId);
    
    // Check if already loaded
    if ((window as any).fbq) {
      return;
    }

    // Facebook Pixel code
    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${sanitizedPixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Add noscript fallback
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${encodeURIComponent(sanitizedPixelId)}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);

    console.log("✅ Facebook Pixel loaded:", sanitizedPixelId);

    return () => {
      script.remove();
      noscript.remove();
    };
  }, [settings.facebookPixelId]);

  // Inject Google Tag Manager
  useEffect(() => {
    if (!settings.gtmId) return;

    const gtmId = settings.gtmId;
    
    // Validate format to prevent script injection
    if (!isValidAnalyticsId(gtmId, 'GTM')) {
      console.error('Invalid GTM ID format:', gtmId);
      return;
    }

    const sanitizedGtmId = sanitizeAnalyticsId(gtmId);
    
    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${sanitizedGtmId}"]`)) {
      return;
    }

    // GTM script
    const script = document.createElement("script");
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${sanitizedGtmId}');
    `;
    document.head.appendChild(script);

    // GTM noscript iframe
    const noscript = document.createElement("noscript");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(sanitizedGtmId)}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    console.log("✅ Google Tag Manager loaded:", sanitizedGtmId);

    return () => {
      script.remove();
      noscript.remove();
    };
  }, [settings.gtmId]);

  return null; // This component only handles script injection
};

export default AnalyticsProvider;

// Helper functions for tracking events
export const trackGAEvent = (eventName: string, params?: Record<string, any>) => {
  if ((window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
};

export const trackFBEvent = (eventName: string, params?: Record<string, any>) => {
  if ((window as any).fbq) {
    (window as any).fbq("track", eventName, params);
  }
};

// Common e-commerce tracking
export const trackPurchase = (orderId: string, value: number, currency: string = "VND") => {
  trackGAEvent("purchase", {
    transaction_id: orderId,
    value,
    currency,
  });
  trackFBEvent("Purchase", {
    value,
    currency,
  });
};

export const trackAddToCart = (itemId: string, itemName: string, value: number) => {
  trackGAEvent("add_to_cart", {
    items: [{ item_id: itemId, item_name: itemName, price: value }],
  });
  trackFBEvent("AddToCart", {
    content_ids: [itemId],
    content_name: itemName,
    value,
    currency: "VND",
  });
};

export const trackViewItem = (itemId: string, itemName: string, value: number) => {
  trackGAEvent("view_item", {
    items: [{ item_id: itemId, item_name: itemName, price: value }],
  });
  trackFBEvent("ViewContent", {
    content_ids: [itemId],
    content_name: itemName,
    value,
    currency: "VND",
  });
};
