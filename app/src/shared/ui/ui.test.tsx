import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumb, Button, Chip, StatusTag, Toggle } from '.';

describe('shared ui', () => {
  it('renders Button as a link when href is given and as a button otherwise', () => {
    const { rerender } = render(<Button href="/x">Go</Button>);
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/x');
    rerender(<Button>Press</Button>);
    expect(screen.getByRole('button', { name: 'Press' })).toHaveAttribute('type', 'button');
  });
  it('marks the selected Chip as current', () => {
    render(<Chip selected>Boy</Chip>);
    expect(screen.getByText('Boy')).toHaveAttribute('aria-current', 'true');
  });
  it('Breadcrumb marks the last item as the current page', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Max' }]} />);
    expect(screen.getByText('Max')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
  it('Toggle exposes switch state', () => {
    render(<Toggle pressed label="Sound" />);
    expect(screen.getByRole('switch', { name: 'Sound' })).toBeChecked();
  });
  it('renders StatusTag text', () => {
    render(<StatusTag>Available</StatusTag>);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });
});
