import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="text-primary animate-bounce">
        <Ghost size={80} />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-foreground">404</h1>
        <h2 className="text-xl font-medium text-foreground">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-sm">
          A página que você está procurando parece ter sumido. Talvez o link esteja quebrado ou ela foi movida.
        </p>
      </div>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
