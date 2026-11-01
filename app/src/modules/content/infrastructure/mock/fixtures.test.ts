import { describe, expect, it } from 'vitest';
import { createContent } from '../../application';
import { whatsappLink } from '../../domain';
import { MockContentRepository } from './MockContentRepository';

const content = createContent(new MockContentRepository());

describe('content fixtures', () => {
  it('has 64 family photos (8 captioned), 9 FAQs and 16 contact options', async () => {
    const photos = await content.listFamilyPhotos();
    expect(photos.length).toBe(64);
    expect(photos.filter((p) => p.caption).length).toBe(8);
    expect((await content.listFaqs()).length).toBe(9);
    expect((await content.getSettings()).contactFormPuppyOptions.length).toBe(16);
  });
  it('searches FAQs and builds WhatsApp links', async () => {
    expect((await content.listFaqs('vaccinated')).length).toBeGreaterThan(0);
    expect(await content.listFaqs('zzzz')).toEqual([]);
    expect(whatsappLink('971500000000', 'Hi there')).toBe('https://wa.me/971500000000?text=Hi%20there');
  });
  it('contains no personal data beyond the business contact details', async () => {
    const s = JSON.stringify(await content.getTestimonial());
    expect(s).not.toMatch(/Sarah/);
  });
});
