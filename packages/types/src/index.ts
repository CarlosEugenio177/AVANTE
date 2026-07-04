export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  cost: number;
  salePrice: number;
  margin: number;
  code: string;
  notes: string | null;
  createdAt: Date;
  userId: string;
}

export interface PriceCalculation {
  id: string;
  productId: string;
  cost: number;
  fixedCostsPercent: number;
  taxPercent: number;
  cardFeePercent: number;
  retailMargin: number;
  wholesaleMargin: number;
  promotionMargin: number;
  retailPrice: number;
  wholesalePrice: number;
  promotionPrice: number;
  maxDiscount: number;
  netProfit: number;
  markup: number;
  createdAt: Date;
  userId: string;
}
