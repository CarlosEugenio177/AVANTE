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
    <div className="space-y-6 pb-6">
      <div className="flex items-center space-x-2">
        <CalcIcon className="text-primary" size={24} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Calculadora Inteligente</h1>
      </div>

      {/* RESULT HERO CARD (Linear-like) */}
      <div className="relative overflow-hidden bg-card rounded-3xl border border-border/60 shadow-sm">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Preço Sugerido</p>
            {result ? (
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl text-muted-foreground font-semibold">R$</span>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground">
                  {result.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
            ) : (
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-muted-foreground/20">--,--</h2>
            )}
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl flex items-center justify-between gap-6 md:min-w-[220px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/80">Lucro Puro</span>
              <span className="text-lg font-black text-emerald-500">
                {result ? `R$ ${result.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
              </span>
            </div>
            <div className="bg-secondary/50 border border-border/50 px-5 py-3 rounded-2xl flex items-center justify-between gap-6 md:min-w-[220px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Markup</span>
              <span className="text-lg font-black text-foreground">
                {result ? `${result.markup.toFixed(1)}%` : '--'}
              </span>
            </div>
          </div>
        </div>
        
        {/* SIMULADOR DE DESCONTO */}
        {result && (
          <div className="border-t border-border/50 bg-secondary/20 p-6 md:px-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-foreground flex items-center">
                <Percent size={16} className="mr-2 text-primary" />
                Simular Desconto na Venda
              </h4>
              <span className="text-sm font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm">
                {discountPercent}%
              </span>
            </div>
            
            <input 
              type="range" min="0" max={result.maxDiscount.toFixed(0)} 
              value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary mb-6"
            />
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-background rounded-2xl border border-border/60">
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Preço com desconto</p>
                 <p className="text-xl font-black text-foreground">R$ {discountedPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
               </div>
               <div className="p-4 bg-background rounded-2xl border border-border/60">
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Novo Lucro Líquido</p>
                 <p className={`text-xl font-black ${discountedProfit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                   R$ {discountedProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </p>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* INPUT FORM (Clean / Linear Style) */}
      <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Vincular Produto (Auto-save)</label>
          <select 
            value={productId} 
            onChange={e => setProductId(e.target.value)} 
            className="w-full bg-background text-foreground border border-input focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-3 h-12 transition-all outline-none"
          >
            <option value="">Selecione um produto cadastrado...</option>
            {products?.items?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Custo Base (R$)
            </label>
            <input 
              type="number" 
              value={cost} 
              onChange={e => setCost(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background text-foreground font-medium border border-input focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-3 h-12 transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Custos Fixos da Empresa (%)
            </label>
            <input 
              type="number" 
              value={fixedCosts} 
              onChange={e => setFixedCosts(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background text-foreground font-medium border border-input focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-3 h-12 transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Impostos (%)
            </label>
            <input 
              type="number" 
              value={tax} 
              onChange={e => setTax(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background text-foreground font-medium border border-input focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-3 h-12 transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Taxa de Cartão (%)
            </label>
            <input 
              type="number" 
              value={cardFee} 
              onChange={e => setCardFee(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-background text-foreground font-medium border border-input focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-3 h-12 transition-all outline-none" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Margem de Lucro Desejada (%)
            </label>
            <input 
              type="number" 
              value={margin} 
              onChange={e => setMargin(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-primary/5 text-primary font-bold border border-primary/20 focus:bg-primary/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-3 h-12 transition-all outline-none" 
            />
          </div>
        </div>

        <button 
          onClick={handleUpdateProductPrice}
          disabled={!productId || updatePriceMutation.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4 flex items-center justify-center shadow-md"
        >
          {updatePriceMutation.isPending ? 'Atualizando...' : 'Atualizar Preço no Cadastro'}
        </button>
      </div>

    </div>
  );
}
