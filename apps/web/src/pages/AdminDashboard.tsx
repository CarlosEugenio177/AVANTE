import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Skeleton } from '../components/ui/Skeleton';
import { Users, Package, Calculator, Clock, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => apiFetch('/analytics/metrics')
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary mb-6">Métricas de Validação (KPIs)</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
          <Users className="text-primary mb-2" size={24} />
          <p className="text-3xl font-black">{metrics?.totalUsers || 0}</p>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Usuários Registrados</p>
        </div>
        
        <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
          <CheckCircle className="text-green-500 mb-2" size={24} />
          <p className="text-3xl font-black">{metrics?.activeUsers || 0}</p>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Usuários Ativos</p>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
          <Package className="text-blue-500 mb-2" size={24} />
          <p className="text-3xl font-black">{metrics?.totalProducts || 0}</p>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Produtos Cadastrados</p>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
          <Calculator className="text-purple-500 mb-2" size={24} />
          <p className="text-3xl font-black">{metrics?.totalCalculations || 0}</p>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Total de Cálculos</p>
        </div>

        <div className="col-span-2 p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-sm flex flex-col items-center text-center">
          <Clock className="text-primary mb-2" size={24} />
          <p className="text-4xl font-black text-primary">{metrics?.avgCalcTime || 0}s</p>
          <p className="text-xs text-primary/80 uppercase font-bold tracking-widest mt-1">Tempo Médio p/ Calcular</p>
        </div>
      </div>
    </div>
  );
}
