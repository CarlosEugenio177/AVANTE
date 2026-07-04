import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { apiFetch } from './api';
import { useAuthStore } from '../store/authStore';

describe('apiFetch', () => {
  let fetchSpy: Mock;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
    useAuthStore.setState({ token: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should include Authorization header if token exists', async () => {
    useAuthStore.setState({ token: 'test-token' });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ success: true }),
    });

    await apiFetch('/test-endpoint');

    expect(fetchSpy).toHaveBeenCalledWith('/api/test-endpoint', expect.objectContaining({
      headers: expect.any(Headers)
    }));

    const callArgs = fetchSpy.mock.calls[0];
    const headers = callArgs[1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('should logout and throw error on 401 response', async () => {
    useAuthStore.setState({ token: 'test-token' });
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    await expect(apiFetch('/test-endpoint')).rejects.toThrow('Não autorizado. Faça login novamente.');
    
    // store token should be null
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('should throw error with message from api on failure', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad request from server' }),
    });

    // Mock the fire and forget analytics call
    fetchSpy.mockResolvedValueOnce({
      ok: true
    });

    await expect(apiFetch('/test-endpoint')).rejects.toThrow('Bad request from server');
  });
});
