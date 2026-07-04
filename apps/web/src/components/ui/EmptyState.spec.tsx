import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  it('should render title and description', () => {
    render(
      <EmptyState 
        title="No items found" 
        description="Try adjusting your filters" 
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('should render custom icon if provided', () => {
    render(
      <EmptyState 
        title="Custom Icon" 
        description="Testing icon" 
        icon={<div data-testid="custom-icon">Icon</div>}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
