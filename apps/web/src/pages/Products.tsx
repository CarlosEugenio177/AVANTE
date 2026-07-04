import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export default function Products() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', category: '', supplier: '', code: '', cost: 0, salePrice: 0, margin: 0
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch('/products')
  });

  const createMutation = useMutation({
    mutationFn: (newProduct: any) => apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(newProduct)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setFormData({ name: '', category: '', supplier: '', code: '', cost: 0, salePrice: 0, margin: 0 });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      cost: Number(formData.cost),
      salePrice: Number(formData.salePrice),
      margin: Number(formData.margin),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Produtos</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium h-[44px]">
          {showForm ? 'Cancelar' : 'Novo Produto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card p-4 rounded-lg shadow space-y-3 border border-border">
          <input required placeholder="Nome do Produto" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-2">
            <input required placeholder="Categoria" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            <input required placeholder="Fornecedor" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
            <input required placeholder="Código" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            <input required type="number" step="0.01" placeholder="Custo (R$)" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
          </div>
          <button type="submit" disabled={createMutation.isPending} className="w-full bg-primary text-primary-foreground py-2 rounded font-bold">
            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground mt-4">Carregando...</p>
      ) : (
        <div className="space-y-3 mt-4">
          {products.map((p: any) => (
            <div key={p.id} className="p-4 bg-card rounded-lg shadow border border-border flex justify-between items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div>
                <h3 className="font-medium text-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.category} • {p.code}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">R$ {p.salePrice.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Custo: R$ {p.cost.toFixed(2)}</p>
              </div>
            </div>
          ))}
          {products.length === 0 && !showForm && (
            <p className="text-center text-muted-foreground">Nenhum produto cadastrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
