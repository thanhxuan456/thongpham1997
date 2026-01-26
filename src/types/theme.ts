export interface Theme {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  sales: number;
  features: string[];
  demoUrl?: string;
  author: string;
  lastUpdated: string;
  version: string;
  compatibility: string[];
  // New fields
  screenshots?: string[];
  supportInfo?: {
    documentation: boolean;
    updates: string;
    supportPeriod: string;
  };
  highlights?: string[];
}

export interface CartItem {
  theme: Theme;
  quantity: number;
}
