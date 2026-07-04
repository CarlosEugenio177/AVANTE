import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { ThemeToggle } from '../App';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm bg-card rounded-lg shadow border border-border p-6">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Criar Conta</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
            <input 
              type="password"
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-background text-foreground border-input rounded-lg shadow-sm p-3 border h-[44px]"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold mt-4 h-[44px]">
            Cadastrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta? <Link to="/login" className="text-primary font-bold">Faça login</Link>
        </p>
      </div>
    </div>
  );
}
