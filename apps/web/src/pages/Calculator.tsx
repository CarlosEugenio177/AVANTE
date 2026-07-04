import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculatePrice } from '@avante/shared';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import { useAnalytics } from '../hooks/useAnalytics';
import { Calculator as CalcIcon, Percent, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';

export default function Calculator() {
  const { trackEvent } = useAnalytics();
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [cost, setCost] = useState<number | ''>(15);
  const [fixedCosts, setFixedCosts] = useState<number | ''>(10);
  const [tax, setTax] = useState<number | ''>(6);
  const [cardFee, setCardFee] = useState<number | ''>(3);
  const [margin, setMargin] = useState<number | ''>(30);
  
  const [startTime] = useState(Date.now());
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
      trackEvent('calculation_created', { calculationTime: Math.round((Date.now() - startTime) / 1000) });
      apiFetch('/settings/onboarding', { method: 'PUT', body: JSON.stringify({ progress: 66 }) }).catch(()=>{});
    }
  });

  const updatePriceMutation = useMutation({
    mutationFn: (data: { id: string, salePrice: number, margin: number }) => apiFetch(`/products/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify({ salePrice: data.salePrice, margin: data.margin })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Preço atualizado no cadastro!');
    },
    onError: () => toast.error('Erro ao atualizar preço.')
  });

  // Calculate whenever inputs change
  useEffect(() => {
    try {
      if (cost !== '' && fixedCosts !== '' && tax !== '' && cardFee !== '' && margin !== '') {
        const res = calculatePrice(Number(cost), Number(fixedCosts), Number(tax), Number(cardFee), Number(margin));
        setResult(res);
      }
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
        cost: Number(cost),
        fixedCostsPercent: Number(fixedCosts),
        taxPercent: Number(tax),
        cardFeePercent: Number(cardFee),
        retailMargin: Number(margin),
        wholesaleMargin: Number(margin) - 10 > 0 ? Number(margin) - 10 : 0,
        promotionMargin: Number(margin) - 5 > 0 ? Number(margin) - 5 : 0,
      });
    }, 1500); 

    return () => clearTimeout(handler);
  }, [productId, cost, fixedCosts, tax, cardFee, margin]);

  const handleUpdateProductPrice = () => {
    if (!productId || !result) return;
    updatePriceMutation.mutate({
      id: productId,
      salePrice: result.salePrice,
      margin: Number(margin)
    });
  };

  const discountedPrice = result ? result.salePrice * (1 - discountPercent / 100) : 0;
  const totalVariableCosts = Number(fixedCosts) + Number(tax) + Number(cardFee);
  const discountedProfit = discountedPrice - Number(cost) - (discountedPrice * (totalVariableCosts / 100));

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-8">
      <div className="flex items-center space-x-2 border-b border-border/50 pb-4">
        <CalcIcon className="text-primary" size={24} />
        <h1 className="text-xl font-semibold text-foreground">Calculadora Inteligente</h1>
      </div>

      {/* RESULT SECTION */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Preço Sugerido</p>
          {result ? (
            <h2 className="text-5xl font-bold tracking-tight text-foreground">
              <span className="text-2xl text-muted-foreground mr-1">R$</span>
              {result.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          ) : (
            <h2 className="text-5xl font-bold tracking-tight text-muted-foreground/30">--,--</h2>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Lucro Líquido</p>
            <p className="text-lg font-semibold text-emerald-500">
              {result ? `R$ ${result.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Markup</p>
            <p className="text-lg font-semibold text-foreground">
              {result ? `${result.markup.toFixed(1)}%` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* INPUT FORM SECTION */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Produto (Auto-save)</label>
          <select 
            value={productId} 
            onChange={e => setProductId(e.target.value)} 
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Nenhum (Apenas Simulação)</option>
            {products?.items?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Custo Base (R$)</label>
            <input 
              type="number" value={cost} onChange={e => setCost(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Margem Desejada (%)</label>
            <input 
              type="number" value={margin} onChange={e => setMargin(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Custos Fixos (%)</label>
            <input 
              type="number" value={fixedCosts} onChange={e => setFixedCosts(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Impostos (%)</label>
            <input 
              type="number" value={tax} onChange={e => setTax(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Taxa de Cartão/Marketplace (%)</label>
            <input 
              type="number" value={cardFee} onChange={e => setCardFee(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
        </div>

        <button 
          onClick={handleUpdateProductPrice}
          disabled={!productId || updatePriceMutation.isPending}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium disabled:opacity-50 mt-2"
        >
          {updatePriceMutation.isPending ? 'Atualizando...' : 'Atualizar Preço no Cadastro'}
        </button>
      </div>

    </div>
  );
}
