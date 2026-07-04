import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useAuthStore.setState({ token: null });
    document.cookie = 'avante-auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  afterEach(() => {
    document.cookie = 'avante-auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('should initialize with null token', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
  });

  it('should set token', () => {
    useAuthStore.getState().setToken('test-jwt-token');
    
    const state = useAuthStore.getState();
    expect(state.token).toBe('test-jwt-token');
  });

  it('should clear token on logout', () => {
    useAuthStore.getState().setToken('test-jwt-token');
    
    // verify it was set
    expect(useAuthStore.getState().token).toBe('test-jwt-token');

    // perform logout
    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
  });
});
