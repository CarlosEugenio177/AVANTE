import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculatePrice } from '@avante/shared';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

export default function Calculator() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [cost, setCost] = useState(15);
  const [fixedCosts, setFixedCosts] = useState(10);
  const [tax, setTax] = useState(6);
  const [cardFee, setCardFee] = useState(3);
  const [margin, setMargin] = useState(30);
  
  const [result, setResult] = useState<any>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch('/products')
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingHistory'] });
      toast.success('Cálculo salvo automaticamente', { position: 'bottom-center' });
    }
  });

  const updatePriceMutation = useMutation({
    mutationFn: (data: { id: string, salePrice: number, margin: number }) => apiFetch(`/products/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify({ salePrice: data.salePrice, margin: data.margin })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Preço do produto atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar preço.')
  });

  // Calculate whenever inputs change
  useEffect(() => {
    try {
      const res = calculatePrice(cost, fixedCosts, tax, cardFee, margin);
      setResult(res);
    } catch (e: any) {
      console.error(e);
    }
  }, [cost, fixedCosts, tax, cardFee, margin]);

  // Auto-save debounce
  useEffect(() => {
    if (!productId || !result) return;
    
    const handler = setTimeout(() => {
      saveMutation.mutate({
        productId,
        cost,
        fixedCostsPercent: fixedCosts,
        taxPercent: tax,
        cardFeePercent: cardFee,
        retailMargin: margin,
        wholesaleMargin: margin - 10 > 0 ? margin - 10 : 0,
        promotionMargin: margin - 5 > 0 ? margin - 5 : 0,
      });
    }, 1500); // Wait 1.5s after user stops typing to save

    return () => clearTimeout(handler);
  }, [productId, cost, fixedCosts, tax, cardFee, margin]);

  const handleUpdateProductPrice = () => {
    if (!productId || !result) return;
    updatePriceMutation.mutate({
      id: productId,
      salePrice: result.salePrice,
      margin
    });
  };

  const discountedPrice = result ? result.salePrice * (1 - discountPercent / 100) : 0;
  // Simplified generic profit calculation for discount (assuming same fixed costs % applied to new price, which is rough, but ok for simulator)
  // Accurate: New Profit = DiscountedPrice - Cost - (Fixed%+Tax%+Card%)*DiscountedPrice
  const totalVariableCosts = fixedCosts + tax + cardFee;
  const discountedProfit = discountedPrice - cost - (discountedPrice * (totalVariableCosts / 100));
  const discountedMargin = discountedPrice > 0 ? (discountedProfit / discountedPrice) * 100 : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Calculadora</h1>
      <div className="space-y-3 bg-card p-4 rounded-lg shadow border border-border">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Produto Associado (Auto-save ativo)</label>
          <select 
            value={productId} 
            onChange={e => setProductId(e.target.value)} 
            className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]"
          >
            <option value="">Selecione um produto...</option>
            {products?.items?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Custo (R$)</label>
          <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Custos Fixos (%)</label>
            <input type="number" value={fixedCosts} onChange={e => setFixedCosts(Number(e.target.value))} className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Impostos (%)</label>
            <input type="number" value={tax} onChange={e => setTax(Number(e.target.value))} className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Taxa Cartão (%)</label>
            <input type="number" value={cardFee} onChange={e => setCardFee(Number(e.target.value))} className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Margem (%)</label>
            <input type="number" value={margin} onChange={e => setMargin(Number(e.target.value))} className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]" />
          </div>
        </div>
      </div>

      {result && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 mt-4 space-y-4">
          <div>
            <h3 className="font-bold text-primary text-lg mb-2">Resultado Final</h3>
            <div className="flex justify-between">
              <span className="text-foreground">Preço de Venda:</span>
              <span className="font-bold text-primary text-lg">R$ {result.salePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Lucro Líquido:</span>
              <span className="font-bold text-primary">R$ {result.netProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Markup:</span>
              <span className="font-bold text-muted-foreground">{result.markup.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="border-t border-primary/20 pt-4">
            <h4 className="font-semibold text-sm mb-2">Simulador de Desconto</h4>
            <div className="flex items-center space-x-4 mb-2">
              <input 
                type="range" min="0" max={result.maxDiscount.toFixed(0)} 
                value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="font-bold w-12 text-right">{discountPercent}%</span>
            </div>
            {discountPercent > 0 && (
              <div className="bg-card p-3 rounded text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Preço com desconto:</span>
                  <span className="font-bold">R$ {discountedPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Novo Lucro:</span>
                  <span className={`font-bold ${discountedProfit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    R$ {discountedProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleUpdateProductPrice}
            disabled={!productId || updatePriceMutation.isPending}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold disabled:opacity-50 mt-2"
          >
            Atualizar Preço no Produto
          </button>
        </div>
      )}
    </div>
  );
}
