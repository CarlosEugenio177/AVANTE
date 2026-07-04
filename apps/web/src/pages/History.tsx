import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { format } from 'date-fns';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Download } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

export default function History() {
  const { trackEvent } = useAnalytics();
  const [productId, setProductId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch('/products')
  });

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['pricingHistory', productId, startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return apiFetch(`/pricing/history?${params.toString()}`);
    }
  });

  const exportCsv = async () => {
    if (!history.length) return;
    
    try {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const csvData = await apiFetch(`/pricing/export-csv?${params.toString()}`);
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'historico_calculos.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      trackEvent('csv_exported');
    } catch (error) {
      console.error('Erro ao exportar CSV', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Histórico</h1>
        <button onClick={exportCsv} disabled={!history.length} className="flex items-center text-sm bg-secondary text-secondary-foreground px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-secondary/80">
          <Download size={16} className="mr-2" />
          Exportar
        </button>
      </div>

      <div className="bg-card p-3 rounded-lg border border-border shadow-sm flex flex-col gap-2">
        <select 
          value={productId} onChange={e => setProductId(e.target.value)} 
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
        >
          <option value="">Todos os produtos</option>
          {products?.items?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input 
            type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
            className="w-1/2 bg-background border border-input rounded-md px-3 py-2 text-sm"
          />
          <input 
            type="date" value={endDate} onChange={e => setEndDate(e.target.value)} 
            className="w-1/2 bg-background border border-input rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 mt-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {history.map((h: any) => (
            <div key={h.id} className="p-4 bg-card rounded-lg shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer group">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-foreground">{h.product?.name || 'Produto Removido'}</h3>
                <span className="text-xs text-muted-foreground">{format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Preço de Venda</p>
                  <p className="font-bold text-primary">R$ {h.retailPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lucro Líquido</p>
                  <p className="font-bold text-green-600">R$ {h.netProfit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Margem</p>
                  <p className="font-semibold text-foreground">{h.retailMargin}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Custo (Total)</p>
                  <p className="font-semibold text-foreground">R$ {h.cost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <EmptyState title="Nenhum cálculo" description="Faça seu primeiro cálculo na aba Calculadora." />
          )}
        </div>
      )}
    </div>
  );
}
