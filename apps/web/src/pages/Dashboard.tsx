import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch('/products')
  });

  const { data: history = [] } = useQuery({
    queryKey: ['pricingHistory'],
    queryFn: () => apiFetch('/pricing/history')
  });

  const totalProducts = products.length;
  const lastCalculation = history[0];
  const avgMargin = products.length 
    ? (products.reduce((acc: number, p: any) => acc + p.margin, 0) / products.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-card rounded-lg shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-sm text-muted-foreground">Produtos Cadastrados</h2>
          <p className="text-3xl font-bold text-foreground mt-1">{totalProducts}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-sm text-muted-foreground">Último Cálculo</h2>
          {lastCalculation ? (
            <>
              <p className="text-lg font-bold text-foreground mt-1">{lastCalculation.product?.name || 'Desconhecido'}</p>
              <p className="text-sm text-green-600 font-medium">Margem: {lastCalculation.retailMargin}%</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Nenhum cálculo recente</p>
          )}
        </div>
        <div className="p-4 bg-card rounded-lg shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-sm text-muted-foreground">Margem Média Geral</h2>
          <p className="text-3xl font-bold text-foreground mt-1">{avgMargin}%</p>
        </div>
      </div>
    </div>
  );
}
