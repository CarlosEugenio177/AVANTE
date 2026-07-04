import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Skeleton } from '../components/ui/Skeleton';
import { Package, Calculator, TrendingUp, DollarSign, Award, Clock } from 'lucide-react';

export default function Dashboard() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiFetch('/settings/profile')
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => apiFetch('/dashboard/stats')
  });

  const progress = profile?.onboardingProgress || 0;
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Usuário';

  return (
    <div className="space-y-6 pb-6">
      {/* HEADER & GREETING */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Bem-vindo de volta,</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{firstName}</h1>
        </div>
        {profile?.role === 'ADMIN' && (
          <a href="/admin" className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full hover:bg-primary/20 transition-colors">
            Validação
          </a>
        )}
      </div>

      {/* HERO CARD - POTENTIAL REVENUE */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary text-primary-foreground rounded-2xl p-6 shadow-md border border-primary/20">
        <div className="absolute -right-4 -top-4 opacity-10 transform rotate-12 pointer-events-none">
          <DollarSign size={140} />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-2">Receita Potencial</p>
          {isLoading ? (
            <Skeleton className="h-12 w-48 bg-primary-foreground/20" />
          ) : (
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-medium opacity-80">R$</span>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
                {(stats?.potentialRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          )}
          <p className="text-[10px] uppercase text-primary-foreground/60 mt-3 font-semibold tracking-wider">Considerando 1 unidade por produto</p>
        </div>
      </div>

      {/* GRID KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Products */}
        <div className="p-4 bg-card rounded-2xl shadow-sm border border-border/60 transition-all hover:shadow-md flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md">
              <Package size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Produtos</span>
          </div>
          {isLoading ? <Skeleton className="h-8 w-16" /> : (
            <p className="text-3xl font-black text-foreground">{stats?.totalProducts || 0}</p>
          )}
        </div>

        {/* Total Calculations */}
        <div className="p-4 bg-card rounded-2xl shadow-sm border border-border/60 transition-all hover:shadow-md flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-md">
              <Calculator size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Cálculos</span>
          </div>
          {isLoading ? <Skeleton className="h-8 w-16" /> : (
            <p className="text-3xl font-black text-foreground">{stats?.totalCalculations || 0}</p>
          )}
        </div>

        {/* Avg Margin */}
        <div className="col-span-2 md:col-span-1 p-4 bg-card rounded-2xl shadow-sm border border-border/60 transition-all hover:shadow-md flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Margem Média</span>
          </div>
          {isLoading ? <Skeleton className="h-8 w-24" /> : (
            <p className="text-3xl font-black text-foreground">{stats?.avgMargin?.toFixed(1) || '0.0'}%</p>
          )}
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Profitable */}
        <div className="p-5 bg-card rounded-2xl shadow-sm border border-border/60 flex flex-col justify-between">
          <div className="flex items-center text-muted-foreground mb-3">
            <Award size={16} className="mr-2 text-amber-500" />
            <h2 className="text-[10px] font-bold uppercase tracking-widest">Produto Campeão</h2>
          </div>
          {isLoading ? (
            <div className="space-y-2"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
          ) : stats?.mostProfitableProduct ? (
            <div>
              <p className="text-lg font-bold text-foreground leading-tight">{stats.mostProfitableProduct}</p>
              <div className="inline-block mt-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <p className="text-xs text-emerald-500 font-bold">
                  + R$ {stats.maxProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Cadastre produtos para ver o ranking</p>
          )}
        </div>

        {/* Last Calc */}
        <div className="p-5 bg-card rounded-2xl shadow-sm border border-border/60 flex flex-col justify-between">
          <div className="flex items-center text-muted-foreground mb-3">
            <Clock size={16} className="mr-2 text-primary" />
            <h2 className="text-[10px] font-bold uppercase tracking-widest">Última Simulação</h2>
          </div>
          {isLoading ? (
             <div className="space-y-2"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/4" /></div>
          ) : stats?.lastCalculation ? (
            <div>
              <p className="text-lg font-bold text-foreground leading-tight">{stats.lastCalculation.productName}</p>
              <div className="inline-block mt-2 px-2 py-1 bg-secondary rounded-md">
                <p className="text-xs font-semibold text-muted-foreground">
                  Margem: <span className="text-foreground">{stats.lastCalculation.retailMargin}%</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Faça uma simulação</p>
          )}
        </div>
      </div>

      {/* ONBOARDING BOTTOM */}
      {progress < 100 && (
        <div className="mt-8 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-foreground">Complete seu Perfil</h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mb-3 overflow-hidden">
            <div className="bg-primary h-2 transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-muted-foreground">Cadastre produtos, calcule preços e simule promoções para liberar todo o potencial.</p>
        </div>
      )}
    </div>
  );
}
