import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { calculatePrice } from '@avante/shared';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Calculator() {
  const navigate = useNavigate();
  const [productId, setProductId] = useState('');
  const [cost, setCost] = useState(15);
  const [fixedCosts, setFixedCosts] = useState(10);
  const [tax, setTax] = useState(6);
  const [cardFee, setCardFee] = useState(3);
  const [margin, setMargin] = useState(30);
  const [result, setResult] = useState<any>(null);

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
      alert('Cálculo salvo com sucesso!');
      navigate('/history');
    },
    onError: (err: any) => {
      alert('Erro ao salvar: ' + err.message);
    }
  });

  const handleCalculate = () => {
    try {
      const res = calculatePrice(cost, fixedCosts, tax, cardFee, margin);
      setResult(res);
    } catch (e: any) {
      alert("Erro ao calcular: " + e.message);
    }
  };

  const handleSave = () => {
    if (!productId) {
      alert("Selecione um produto antes de salvar.");
      return;
    }
    saveMutation.mutate({
      productId,
      cost,
      fixedCostsPercent: fixedCosts,
      taxPercent: tax,
      cardFeePercent: cardFee,
      retailMargin: margin,
      wholesaleMargin: margin - 10 > 0 ? margin - 10 : 0, // simple heuristic if not provided
      promotionMargin: margin - 5 > 0 ? margin - 5 : 0,
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Calculadora</h1>
      <div className="space-y-3 bg-card p-4 rounded-lg shadow border border-border">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Produto Associado</label>
          <select 
            value={productId} 
            onChange={e => setProductId(e.target.value)} 
            className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]"
          >
            <option value="">Selecione um produto...</option>
            {products.map((p: any) => (
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
        <button onClick={handleCalculate} className="w-full bg-primary text-white py-3 rounded-lg font-bold mt-4 h-[44px]">
          CALCULAR
        </button>
      </div>

      {result && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 mt-4 space-y-2">
          <h3 className="font-bold text-primary text-lg">Resultado</h3>
          <div className="flex justify-between">
            <span className="text-foreground">Preço de Venda:</span>
            <span className="font-bold text-primary">R$ {result.salePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">Lucro Líquido:</span>
            <span className="font-bold text-primary">R$ {result.netProfit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">Markup:</span>
            <span className="font-bold text-primary">{result.markup.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">Desconto Máximo:</span>
            <span className="font-bold text-primary">{result.maxDiscount.toFixed(1)}%</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full bg-card text-primary border border-primary py-2 rounded-lg font-bold mt-2 h-[44px]"
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Cálculo'}
          </button>
        </div>
      )}
    </div>
  );
}
