import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { format } from 'date-fns';

export default function FeedbackAdmin() {
  const queryClient = useQueryClient();
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => apiFetch('/feedback')
  });

  const statusMutation = useMutation({
    mutationFn: (data: { id: string, status: string }) => apiFetch(`/feedback/${data.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: data.status })
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary mb-4">Gestão de Feedbacks</h1>
      
      {feedbacks?.length === 0 ? (
        <EmptyState title="Caixa de Entrada Vazia" description="Nenhum feedback recebido até o momento." />
      ) : (
        <div className="space-y-3">
          {feedbacks?.map((fb: any) => (
            <div key={fb.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${fb.type === 'bug' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {fb.type}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">{format(new Date(fb.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <select 
                  value={fb.status}
                  onChange={(e) => statusMutation.mutate({ id: fb.id, status: e.target.value })}
                  className="text-xs bg-secondary text-secondary-foreground border-none rounded p-1"
                >
                  <option value="novo">Novo</option>
                  <option value="em análise">Em Análise</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              </div>
              <p className="text-foreground text-sm mt-1">{fb.message}</p>
              <div className="flex justify-between items-center mt-2 border-t border-border pt-2">
                <span className="text-xs text-muted-foreground">Usuário: {fb.user?.name || 'Anônimo'} ({fb.user?.email || 'N/A'})</span>
                <span className="text-xs text-muted-foreground">Página: {fb.page || '/'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
