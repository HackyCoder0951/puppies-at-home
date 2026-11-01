import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createCatalog } from '../application';
import { MockPuppyRepository } from '../infrastructure';
import { PuppiesView } from './PuppiesView';
import { PuppyDetailView } from './PuppyDetailView';

const catalog = createCatalog(new MockPuppyRepository());

describe('catalog views', () => {
  it('lists all puppies with a count line', async () => {
    render(<PuppiesView listing={await catalog.listPuppies()} filter={{}} whatsappUrl="https://wa.me/1" />);
    expect(screen.getByRole('status')).toHaveTextContent('15 puppies looking for a home');
    expect(screen.getByRole('heading', { level: 1, name: 'Puppies' })).toBeInTheDocument();
  });
  it('shows the empty state for an origin with no puppies', async () => {
    render(<PuppiesView listing={await catalog.listPuppies({ origin: 'local' })} filter={{ origin: 'local' }} whatsappUrl="https://wa.me/1" />);
    expect(screen.getByText(/No puppies match/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 puppies match');
  });
  it('renders a detail page with name, facts and neighbours', async () => {
    const detail = (await catalog.getPuppy('maltipoo-max-male'))!;
    render(<PuppyDetailView detail={detail} whatsappFor={(t) => `https://wa.me/1?text=${t}`} enquiry={<p>form</p>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Max' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ask about Max on WhatsApp' })).toBeInTheDocument();
    expect(screen.getByText('Previous puppy')).toBeInTheDocument();
  });
});
