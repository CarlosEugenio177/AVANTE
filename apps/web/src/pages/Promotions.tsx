import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAnalytics } from '../hooks/useAnalytics';

export default function Promotions() {
  const { trackEvent } = useAnalytics();
  const [productId, setProductId] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch('/products?limit=100') // get all products for selector
  });

  const { data: calcHistory = [] } = useQuery({
    queryKey: ['pricingHistory', productId],
    queryFn: () => apiFetch(`/pricing/history?productId=${productId}`),
    enabled: !!productId
  });

  const selectedProduct = products?.items?.find((p: any) => p.id === productId);
  const baseCalc = calcHistory?.[0]; // latest calculation

  const currentPrice = selectedProduct?.salePrice || 0;
  const cost = baseCalc?.cost || selectedProduct?.cost || 0;
  const totalVariableCosts = baseCalc ? (baseCalc.fixedCostsPercent + baseCalc.taxPercent + baseCalc.cardFeePercent) : 0;

  let profit = 0;
  let margin = 0;
  let discount = 0;

  if (newPrice !== '' && newPrice > 0) {
    profit = Number(newPrice) - cost - (Number(newPrice) * (totalVariableCosts / 100));
    margin = (profit / Number(newPrice)) * 100;
    discount = currentPrice > 0 ? ((currentPrice - Number(newPrice)) / currentPrice) * 100 : 0;
  }

  // Trigger event when simulation happens
  useEffect(() => {
    if (newPrice !== '' && newPrice > 0 && selectedProduct) {
      const handler = setTimeout(() => {
        trackEvent('promotion_simulated', { productId: selectedProduct.id, margin, discount });
        apiFetch('/settings/onboarding', { method: 'PUT', body: JSON.stringify({ progress: 100 }) }).catch(()=>{});
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [newPrice, selectedProduct]);

  const getStatusColor = (m: number) => {
    if (m >= 20) return 'bg-green-100 text-green-800 border-green-300';
    if (m >= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getStatusLabel = (m: number) => {
    if (m >= 20) return '🟢 Margem Segura';
    if (m >= 10) return '🟡 Margem de Atenção';
    return '🔴 Abaixo da Margem';
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Simulador de Promoções</h1>
      <p className="text-sm text-muted-foreground">Avalie o impacto de descontos antes de aplicá-los.</p>

      <div className="bg-card p-4 rounded-lg shadow border border-border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Selecione o Produto</label>
          <select 
            value={productId} onChange={e => { setProductId(e.target.value); setNewPrice(''); }} 
            className="w-full bg-background border border-input rounded-md px-3 py-2"
          >
            <option value="">Selecione...</option>
            {products?.items?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Preço Atual</label>
              <div className="p-2 bg-secondary rounded border font-semibold">R$ {currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-primary">Novo Preço (R$)</label>
              <input 
                type="number" step="0.01"
                value={newPrice} onChange={e => setNewPrice(Number(e.target.value))}
                className="w-full bg-background border border-primary rounded-md px-3 py-2 font-bold focus:ring-2 ring-primary/50 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
        )}
      </div>

      {newPrice !== '' && newPrice > 0 && selectedProduct && (
        <div className={`p-4 rounded-lg border-2 shadow-sm transition-colors ${getStatusColor(margin)}`}>
          <div className="flex justify-between items-center mb-4 border-b border-black/10 pb-2">
            <h3 className="font-bold text-lg">{getStatusLabel(margin)}</h3>
            <span className="font-bold text-xl">{margin.toFixed(1)}%</span>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="opacity-80">Desconto Aplicado:</span>
            <span className="font-bold text-right">{discount.toFixed(1)}%</span>
            
            <span className="opacity-80">Lucro Líquido:</span>
            <span className="font-bold text-right">R$ {profit.toFixed(2)}</span>
            
            <span className="opacity-80">Custo Base:</span>
            <span className="font-semibold text-right">R$ {cost.toFixed(2)}</span>
            
            <span className="opacity-80">Custos Variáveis:</span>
            <span className="font-semibold text-right">{totalVariableCosts}%</span>
          </div>

          {!baseCalc && (
            <p className="text-xs mt-3 opacity-70 italic text-center">
              Aviso: Produto sem histórico de cálculo. Usando custo base do cadastro sem taxas variáveis. Recomendamos calcular na aba "Calculadora" antes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
