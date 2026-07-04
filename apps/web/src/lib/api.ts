import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('Não autorizado. Faça login novamente.');
  }

  if (!response.ok) {
    let message = 'Ocorreu um erro na requisição.';
    try {
      const errData = await response.json();
      message = errData.message || message;
    } catch (e) {
      // Ignora erro de parse
    }

    // Dispara log de erro para analytics (fire and forget) sem usar apiFetch para evitar loop
    fetch(`${API_BASE_URL}/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        event: 'api_error',
        metadata: { endpoint, status: response.status, message }
      })
    }).catch(() => {});

    throw new Error(message);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
