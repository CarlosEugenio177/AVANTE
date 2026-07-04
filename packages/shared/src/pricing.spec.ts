import { describe, it, expect } from 'vitest';
import { calculatePrice } from './pricing';

describe('Pricing Calculations', () => {
  it('should calculate sale price, profit, and markup correctly', () => {
    const cost = 15; // R$ 15,00
    const fixedCostsPercent = 10; // 10%
    const taxPercent = 6; // 6%
    const cardFeePercent = 3; // 3%
    const marginPercent = 30; // 30%

    const result = calculatePrice(cost, fixedCostsPercent, taxPercent, cardFeePercent, marginPercent);

    // Total Cost % = 10 + 6 + 3 + 30 = 49%
    // Sale Price = 15 / (1 - 0.49) = 15 / 0.51 = 29.41176...
    expect(result.salePrice).toBeCloseTo(29.4118, 3);

    // Net Profit = Sale Price * Margin = 29.41176 * 0.30 = 8.8235...
    expect(result.netProfit).toBeCloseTo(8.8235, 3);

    // Markup = ((Sale Price - Cost) / Cost) * 100
    // ((29.4117 - 15) / 15) * 100 = 96.078...
    expect(result.markup).toBeCloseTo(96.0784, 3);

    // Break Even Price = 15 / (1 - (10 + 6 + 3)/100) = 15 / 0.81 = 18.5185...
    // Max Discount = ((Sale Price - Break Even) / Sale Price) * 100
    // ((29.4117 - 18.5185) / 29.4117) * 100 = 37.037...
    expect(result.maxDiscount).toBeCloseTo(37.037, 3);
  });

  it('should throw an error if total costs percentage is 100% or more', () => {
    // 50 + 20 + 10 + 20 = 100%
    expect(() => calculatePrice(10, 50, 20, 10, 20)).toThrow('Total cost percentage cannot be 100% or greater.');
    
    // 50 + 20 + 20 + 20 = 110%
    expect(() => calculatePrice(10, 50, 20, 20, 20)).toThrow('Total cost percentage cannot be 100% or greater.');
  });
});
