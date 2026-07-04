import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './appStore';

describe('appStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useAppStore.setState({ theme: 'light', cookiesAccepted: false });
  });

  it('should initialize with default state', () => {
    const state = useAppStore.getState();
    expect(state.theme).toBe('light');
    expect(state.cookiesAccepted).toBe(false);
  });

  it('should toggle theme', () => {
    // light -> dark
    useAppStore.getState().toggleTheme();
    expect(useAppStore.getState().theme).toBe('dark');

    // dark -> light
    useAppStore.getState().toggleTheme();
    expect(useAppStore.getState().theme).toBe('light');
  });

  it('should accept cookies', () => {
    expect(useAppStore.getState().cookiesAccepted).toBe(false);
    
    useAppStore.getState().acceptCookies();
    
    expect(useAppStore.getState().cookiesAccepted).toBe(true);
  });
});
