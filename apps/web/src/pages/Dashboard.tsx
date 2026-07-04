import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Skeleton } from '../components/ui/Skeleton';
import { Package, Calculator, TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => apiFetch('/dashboard/stats')
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Total Products */}
        <div className="col-span-1 p-4 bg-card rounded-xl shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
          <div className="flex items-center text-muted-foreground mb-2">
            <Package size={16} className="mr-2" />
            <h2 className="text-xs uppercase tracking-wider font-semibold">Produtos</h2>
          </div>
          {isLoading ? <Skeleton className="h-8 w-16" /> : (
            <p className="text-3xl font-bold text-foreground">{stats?.totalProducts || 0}</p>
          )}
        </div>

        {/* Total Calculations */}
        <div className="col-span-1 p-4 bg-card rounded-xl shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
          <div className="flex items-center text-muted-foreground mb-2">
            <Calculator size={16} className="mr-2" />
            <h2 className="text-xs uppercase tracking-wider font-semibold">Cálculos</h2>
          </div>
          {isLoading ? <Skeleton className="h-8 w-16" /> : (
            <p className="text-3xl font-bold text-foreground">{stats?.totalCalculations || 0}</p>
          )}
        </div>

        {/* Avg Margin */}
        <div className="col-span-2 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl shadow border border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center text-primary mb-2">
            <TrendingUp size={18} className="mr-2" />
            <h2 className="text-sm uppercase tracking-wider font-bold">Margem Média Geral</h2>
          </div>
          {isLoading ? <Skeleton className="h-10 w-24 bg-primary/20" /> : (
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-black text-primary">{stats?.avgMargin?.toFixed(1) || '0.0'}%</p>
            </div>
          )}
        </div>

        {/* Potential Revenue */}
        <div className="col-span-2 p-4 bg-card rounded-xl shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center text-muted-foreground mb-2">
            <DollarSign size={16} className="mr-2" />
            <h2 className="text-xs uppercase tracking-wider font-semibold">Receita Potencial</h2>
          </div>
          {isLoading ? <Skeleton className="h-8 w-32" /> : (
            <p className="text-2xl font-bold text-foreground">R$ {(stats?.potentialRevenue || 0).toFixed(2)}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">Considerando 1 unidade por produto</p>
        </div>

        {/* Most Profitable */}
        <div className="col-span-2 p-4 bg-card rounded-xl shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Produto Mais Lucrativo</h2>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : stats?.mostProfitableProduct ? (
            <>
              <p className="text-lg font-bold text-foreground">{stats.mostProfitableProduct}</p>
              <p className="text-sm text-green-600 font-medium mt-1">Lucro: R$ {stats.maxProfit.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
          )}
        </div>

        {/* Last Calc */}
        <div className="col-span-2 p-4 bg-card rounded-xl shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg mb-4">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Último Cálculo</h2>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ) : stats?.lastCalculation ? (
            <>
              <p className="text-lg font-bold text-foreground">{stats.lastCalculation.productName}</p>
              <p className="text-sm text-green-600 font-medium mt-1">Margem: {stats.lastCalculation.retailMargin}%</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum cálculo recente</p>
          )}
        </div>
      </div>
    </div>
  );
}
