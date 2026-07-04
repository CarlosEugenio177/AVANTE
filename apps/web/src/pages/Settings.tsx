import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export default function Settings() {
  const logout = useAuthStore(s => s.logout);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiFetch('/settings/profile'),
  });

  // Prefill when loaded
  React.useEffect(() => {
    if (profile?.name && !name) setName(profile.name);
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (newName: string) => apiFetch('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: newName })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil atualizado com sucesso!');
    }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Configurações</h1>
      
      <div className="flex space-x-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('profile')} className={`pb-2 px-1 text-sm font-medium ${activeTab==='profile' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Perfil</button>
        <button onClick={() => setActiveTab('about')} className={`pb-2 px-1 text-sm font-medium ${activeTab==='about' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Sobre</button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">E-mail (Leitura)</label>
            <input type="text" disabled value={profile?.email || ''} className="w-full bg-secondary text-muted-foreground border-input p-2 rounded border opacity-70" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background text-foreground border-input p-2 rounded border" />
          </div>
          <button 
            onClick={() => updateMutation.mutate(name)}
            disabled={updateMutation.isPending || !name || name === profile?.name}
            className="w-full bg-primary text-white py-2 rounded font-bold disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>

          <div className="border-t border-border pt-4 mt-4">
            <button onClick={logout} className="w-full bg-destructive/10 text-destructive font-bold py-2 rounded hover:bg-destructive hover:text-white transition-colors">
              Sair (Logout)
            </button>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3 text-sm text-foreground">
          <p><strong>AVANTE V0.3</strong></p>
          <p className="text-muted-foreground">Sistema de precificação inteligente desenvolvido exclusivamente para a Flora Pura.</p>
          <hr className="border-border" />
          <p>
            <a href="#" className="text-primary underline">Termos de Uso</a><br/>
            <a href="#" className="text-primary underline">Política de Privacidade</a>
          </p>
        </div>
      )}
    </div>
  );
}
