import React, { useState } from 'react';
import { MessageSquare, Bug, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('sugestão');
  const [message, setMessage] = useState('');
  const location = useLocation();

  const feedbackMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast.success('Feedback enviado com sucesso! Muito obrigado.');
      setIsOpen(false);
      setMessage('');
    },
    onError: () => {
      toast.error('Erro ao enviar feedback.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedbackMutation.mutate({ type, message, page: location.pathname });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-xl hover:scale-105 transition-transform z-50 flex items-center justify-center"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-card border border-border shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-foreground">Enviar Feedback</h3>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setType('sugestão')} className={`flex-1 py-1 text-sm rounded ${type === 'sugestão' ? 'bg-primary text-primary-foreground font-bold' : 'bg-secondary text-secondary-foreground'}`}>
            <MessageSquare size={14} className="inline mr-1" /> Sugestão
          </button>
          <button type="button" onClick={() => setType('bug')} className={`flex-1 py-1 text-sm rounded ${type === 'bug' ? 'bg-destructive text-destructive-foreground font-bold' : 'bg-secondary text-secondary-foreground'}`}>
            <Bug size={14} className="inline mr-1" /> Bug
          </button>
        </div>
        
        <textarea 
          required
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={type === 'sugestão' ? 'Como podemos melhorar o AVANTE?' : 'Descreva o problema que você encontrou...'}
          className="w-full bg-background border border-input rounded-md p-2 text-sm text-foreground resize-none focus:ring-2 ring-primary/50 outline-none"
        />
        
        <button 
          type="submit" 
          disabled={!message || feedbackMutation.isPending}
          className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg disabled:opacity-50 transition-opacity"
        >
          {feedbackMutation.isPending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
