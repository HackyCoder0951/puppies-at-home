import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createContent } from '../application';
import { MockContentRepository } from '../infrastructure';
import { FamiliesView } from './FamiliesView';
import { FaqView } from './FaqView';
import { HowItWorksView } from './HowItWorksView';

const content = createContent(new MockContentRepository());

describe('content pages', () => {
  it('renders the wall with one print per family photo (64) and opens the viewer', async () => {
    const photos = await content.listFamilyPhotos();
    const { container } = render(<FamiliesView photos={photos} />);
    expect(container.querySelectorAll('.tp-wall__item')).toHaveLength(64);
  });
  it('FAQ lists 9 notes, searches and opens one accordion note at a time', async () => {
    render(<FaqView faqs={await content.listFaqs()} />);
    expect(screen.getByText('9 notes on the board')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox'), 'deliver');
    expect(screen.getByText('1 note on the board')).toBeInTheDocument();
    const q = screen.getByRole('button', { name: /Do you deliver/ });
    await userEvent.click(q);
    expect(q).toHaveAttribute('aria-expanded', 'true');
    await userEvent.clear(screen.getByRole('searchbox'));
    await userEvent.type(screen.getByRole('searchbox'), 'zzzz');
    expect(screen.getByText(/No notes match/)).toBeInTheDocument();
  });
  it('How it works switches between the two ways', async () => {
    render(<HowItWorksView />);
    const imported = screen.getByRole('tab', { name: /Imported/ });
    expect(screen.getByRole('tabpanel', { name: /In Dubai/ })).toBeVisible();
    await userEvent.click(imported);
    expect(imported).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: /Imported/ })).toBeVisible();
  });
});
