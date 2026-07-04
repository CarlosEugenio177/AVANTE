export function calculatePrice(
  cost: number,
  fixedCostsPercent: number,
  taxPercent: number,
  cardFeePercent: number,
  marginPercent: number
): { salePrice: number; netProfit: number; markup: number; maxDiscount: number } {
  const totalCostPercent = fixedCostsPercent + taxPercent + cardFeePercent + marginPercent;
  
  if (totalCostPercent >= 100) {
    throw new Error('Total cost percentage cannot be 100% or greater.');
  }

  const salePrice = cost / (1 - totalCostPercent / 100);
  
  // netProfit = salePrice - cost - (salePrice * (fixedCostsPercent + taxPercent + cardFeePercent)/100)
  // Which is equivalent to salePrice * (marginPercent / 100)
  const netProfit = salePrice * (marginPercent / 100);
  const markup = ((salePrice - cost) / cost) * 100;
  
  // maxDiscount: what percentage of sale price can we drop to reach cost (0 profit)
  const breakEvenPrice = cost / (1 - (fixedCostsPercent + taxPercent + cardFeePercent) / 100);
  const maxDiscount = ((salePrice - breakEvenPrice) / salePrice) * 100;

  return {
    salePrice,
    netProfit,
    markup,
    maxDiscount
  };
}
