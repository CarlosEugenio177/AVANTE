import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Edit2, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', category: '', supplier: '', code: '', cost: 0, salePrice: 0, margin: 0
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['products', page, debouncedSearch, category, sortBy],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (category) params.append('category', category);
      params.append('sortBy', sortBy);
      return apiFetch(`/products?${params.toString()}`);
    }
  });

  const products = result?.items || [];
  const meta = result?.meta || { totalPages: 1 };

  const createMutation = useMutation({
    mutationFn: (newProduct: any) => apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(newProduct)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      resetForm();
      toast.success('Produto criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar produto.')
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, product: any }) => apiFetch(`/products/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data.product)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      resetForm();
      toast.success('Produto atualizado com sucesso!');
    },
    onError: () => toast.error('Erro ao atualizar produto.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso!');
      setDeleteId(null);
    },
    onError: () => toast.error('Erro ao excluir produto.')
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', supplier: '', code: '', cost: 0, salePrice: 0, margin: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      cost: Number(formData.cost),
      salePrice: Number(formData.salePrice),
      margin: Number(formData.margin),
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, product: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name, category: p.category, supplier: p.supplier, code: p.code,
      cost: p.cost, salePrice: p.salePrice, margin: p.margin
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Produtos</h1>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium h-[44px]">
          {showForm ? 'Cancelar' : 'Novo Produto'}
        </button>
      </div>

      {!showForm && (
        <div className="flex flex-col sm:flex-row gap-2 bg-card p-3 rounded-lg border border-border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar produto..." 
              className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="bg-background border border-input rounded-md px-3 text-sm py-2"
            >
              <option value="">Categorias</option>
              <option value="Perfumaria">Perfumaria</option>
              <option value="Cosméticos">Cosméticos</option>
              <option value="Cabelos">Cabelos</option>
            </select>
            <select 
              value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="bg-background border border-input rounded-md px-3 text-sm py-2"
            >
              <option value="createdAt">Mais Recentes</option>
              <option value="name">Nome (A-Z)</option>
              <option value="salePrice">Maior Preço</option>
            </select>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card p-4 rounded-lg shadow space-y-3 border border-border animate-in fade-in slide-in-from-top-4">
          <input required placeholder="Nome do Produto" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-2">
            <input required placeholder="Categoria" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            <input required placeholder="Fornecedor" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
            <input required placeholder="Código" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            <input required type="number" step="0.01" placeholder="Custo (R$)" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
            <input required type="number" step="0.01" placeholder="Preço (R$)" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} />
            <input required type="number" step="0.1" placeholder="Margem (%)" className="w-full bg-background text-foreground border-input p-2 rounded border" value={formData.margin} onChange={e => setFormData({...formData, margin: Number(e.target.value)})} />
          </div>
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-primary text-primary-foreground py-2 rounded font-bold">
            {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {isError && (
        <EmptyState title="Erro ao carregar" description="Não foi possível buscar os produtos." />
      )}

      {isLoading ? (
        <div className="space-y-3 mt-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {products.map((p: any) => (
            <div key={p.id} className="p-4 bg-card rounded-lg shadow border border-border flex justify-between items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
              <div>
                <h3 className="font-medium text-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.category} • {p.code}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div>
                  <p className="font-bold text-primary">R$ {p.salePrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Custo: R$ {p.cost.toFixed(2)}</p>
                </div>
                <div className="flex space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(p)} className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(p.id)} className="p-2 bg-destructive/10 text-destructive rounded-full hover:bg-destructive hover:text-white transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && !showForm && (
            <EmptyState title="Nenhum produto" description="Nenhum produto encontrado com os filtros selecionados." />
          )}
        </div>
      )}

      {!isLoading && meta.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button 
            disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-secondary rounded disabled:opacity-50"
          >
            Ant
          </button>
          <span className="text-sm text-muted-foreground">Página {page} de {meta.totalPages}</span>
          <button 
            disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-secondary rounded disabled:opacity-50"
          >
            Prox
          </button>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deleteId}
        title="Excluir Produto"
        message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        confirmText="Excluir"
      />
    </div>
  );
}
