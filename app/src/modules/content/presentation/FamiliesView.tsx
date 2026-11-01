import { Container, Kicker, NoteShape } from '@shared/ui';
import type { FamilyPhoto, Testimonial } from '../domain';
import { FamilyWall } from './FamilyWall';

export function FamiliesView({ photos, testimonial }: { photos: readonly FamilyPhoto[]; testimonial: Testimonial }) {
  return (
    <main id="main" style={{ background: 'var(--scene-families)' }}>
      <Container className="py-14">
        <Kicker>the wall of wags</Kicker>
        <h1 className="mt-4 text-5xl md:text-8xl">Happy families ♥</h1>
        <p className="mt-4 max-w-xl text-xl">{photos.length} moments and counting. Thank you for sharing your homecoming.</p>
        <NoteShape tilt={-1} className="mt-10 max-w-3xl">
          <blockquote className="m-0 text-xl text-cocoa">{testimonial.quote}</blockquote>
          <p className="mt-3 font-[family-name:var(--font-hand)] text-toffee-ink">{testimonial.attribution}</p>
        </NoteShape>
        <FamilyWall photos={photos} />
      </Container>
    </main>
  );
}
