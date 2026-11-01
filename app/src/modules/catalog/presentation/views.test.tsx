import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createCatalog } from '../application';
import { puppyWhatsappText } from '../domain';
import { MockPuppyRepository } from '../infrastructure';
import { GoneHomeView } from './GoneHomeView';
import { PuppiesView } from './PuppiesView';
import { PuppyDetailView } from './PuppyDetailView';
import { AVAILABLE_ART } from './sketchArt.generated';
import { GONE_STRIP_ART } from './goneStripArt.generated';

const catalog = createCatalog(new MockPuppyRepository());
const WA = 'https://wa.me/971541676733?text=hi';

async function renderBrowser(filter = {}) {
  const { puppies, goneHomePreview } = await catalog.listPuppies();
  render(<PuppiesView puppies={puppies} goneSlugs={goneHomePreview.map((p) => p.slug)} filter={filter} whatsappUrl={WA} />);
}
const chip = (name: string) => screen.getByRole('button', { name });
const status = () => screen.getByText(/(looking for a home|match)$/);
const visible = () => document.querySelectorAll('.tp-sketches > li:not([hidden])').length;

describe('puppies page (matches the reference behaviour)', () => {
  it('has artwork for every available puppy and every gone-home preview', async () => {
    const { puppies, goneHomePreview } = await catalog.listPuppies();
    expect(puppies.every((p) => AVAILABLE_ART[p.slug])).toBe(true);
    expect(goneHomePreview.every((p) => GONE_STRIP_ART[p.slug])).toBe(true);
  });
  it('shows all 15 puppies and the Everywhere chip pressed', async () => {
    await renderBrowser();
    expect(status()).toHaveTextContent('15 puppies looking for a home');
    expect(visible()).toBe(15);
    expect(chip('Everywhere')).toHaveAttribute('aria-pressed', 'true');
  });
  it('combines imported with Korean Teacup (AND) and singular wording', async () => {
    await renderBrowser();
    await userEvent.click(chip('Imported'));
    expect(status()).toHaveTextContent('15 puppies match');
    await userEvent.click(chip('Korean Teacup'));
    expect(status()).toHaveTextContent('5 puppies match');
    await userEvent.click(chip('Pomeranian'));
    await userEvent.click(chip('Boys'));
    expect(status()).toHaveTextContent('1 puppy match');
  });
  it('breed and boy/girl are single choice; the pair entry matches both sexes', async () => {
    await renderBrowser();
    await userEvent.click(chip('Maltipoo'));
    expect(status()).toHaveTextContent('6 puppies match');
    await userEvent.click(chip('Pomeranian'));
    expect(chip('Maltipoo')).toHaveAttribute('aria-pressed', 'false');
    expect(status()).toHaveTextContent('4 puppies match');
    await userEvent.click(chip('Pomeranian'));
    await userEvent.click(chip('Boys'));
    expect(status()).toHaveTextContent('6 puppies match');
    await userEvent.click(chip('Girls'));
    expect(status()).toHaveTextContent('10 puppies match');
  });
  it('shows the empty state and recovers', async () => {
    await renderBrowser();
    await userEvent.click(chip('Korean Teacup'));
    await userEvent.click(chip('Shih Tzu'));
    expect(status()).toHaveTextContent('0 puppies match');
    expect(screen.getByText('No puppies match just now.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show all puppies' }));
    expect(visible()).toBe(15);
  });
  it('origin=local from the URL matches nothing, with no chip pressed (as on the reference)', async () => {
    await renderBrowser({ origin: 'local' });
    expect(status()).toHaveTextContent('0 puppies match');
    expect(document.querySelectorAll('.tp-sticker-chip[aria-pressed=true]')).toHaveLength(0);
  });
});

describe('gone home and detail pages', () => {
  it('renders one ticket per gone-home puppy (27)', async () => {
    const { container } = render(<GoneHomeView />);
    expect(container.querySelectorAll('.tp-ticket')).toHaveLength((await catalog.listGoneHome()).length);
  });
  it('builds the reference WhatsApp messages', async () => {
    const url = 'https://x.test/puppies/';
    const get = async (s: string) => (await catalog.getPuppy(s))!.puppy;
    expect(puppyWhatsappText(await get('maltipoo-max-male'), url + 'a')).toBe("Hi TeddyPups! I'm interested in Max, the Maltipoo: " + url + 'a');
    expect(puppyWhatsappText(await get('toy-poodle-male-female'), url + 'b')).toBe("Hi TeddyPups! I'm interested in the Toy Poodle (boy & girl): " + url + 'b');
    expect(puppyWhatsappText(await get('bichon-bailey-boy'), url + 'c')).toBe('Hi TeddyPups! I loved Bailey (' + url + 'c). Do you have a puppy like them?');
    expect(puppyWhatsappText(await get('blue-marle-pomeranian'), url + 'd')).toBe('Hi TeddyPups! I loved the Pomeranian (' + url + 'd). Do you have a puppy like them?');
  });
  it('renders available and gone-home variants', async () => {
    const view = async (slug: string) => {
      const detail = (await catalog.getPuppy(slug))!;
      return render(<PuppyDetailView detail={detail} siteUrl="https://x.test" whatsappHref="https://wa.me/1" enquiry={<p>form</p>} />);
    };
    const a = await view('maltipoo-max-male');
    expect(screen.getByRole('heading', { level: 1, name: 'Max' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ask about Max on WhatsApp' })).toBeInTheDocument();
    expect(screen.getByText('Coming home from abroad')).toBeInTheDocument();
    expect(screen.getByText('Previous pup')).toBeInTheDocument();
    a.unmount();
    await view('blue-marle-pomeranian');
    expect(screen.getByRole('link', { name: 'Ask about a puppy like this' })).toBeInTheDocument();
    expect(screen.queryByText('Coming home from abroad')).not.toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText('Gone home')).toBeInTheDocument();
    expect(screen.getByText('Marble')).toBeInTheDocument();
  });
});
