import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { format } from 'date-fns';

export default function History() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['pricingHistory'],
    queryFn: () => apiFetch('/pricing/history')
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Histórico</h1>
      
      {isLoading ? (
        <p className="text-center text-muted-foreground mt-4">Carregando...</p>
      ) : (
        <div className="space-y-3 mt-4">
          {history.map((h: any) => (
            <div key={h.id} className="p-4 bg-card rounded-lg shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-foreground">{h.product?.name || 'Produto Removido'}</h3>
                <span className="text-xs text-muted-foreground">{format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs text-muted-foreground">Preço Venda</p>
                  <p className="font-bold text-foreground">R$ {h.retailPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Margem</p>
                  <p className="font-bold text-foreground">{h.retailMargin}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lucro Líq.</p>
                  <p className="font-bold text-green-600">R$ {h.netProfit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-muted-foreground">Nenhum cálculo salvo ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}
