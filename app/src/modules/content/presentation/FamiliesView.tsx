import { Container, Kicker, NoteShape } from '@shared/ui';
import type { FamilyPhoto, Testimonial } from '../domain';
import { FamilyWall } from './FamilyWall';

export function FamiliesView({ photos, testimonial }: { photos: readonly FamilyPhoto[]; testimonial: Testimonial }) {
  return (
    <main id="main" style={{ background: 'var(--scene-families)' }}>
      <Container className="py-14">
        <Kicker>our wall of happy endings</Kicker>
        <h1 className="mt-4 text-5xl md:text-8xl">Happy families</h1>
        <p className="mt-4 max-w-xl text-xl">Nothing makes us happier than seeing our puppies in loving homes! Here are some beautiful moments shared by our amazing clients after welcoming their furry friends.</p>
        <NoteShape tilt={-1} className="mt-10 max-w-3xl">
          <blockquote className="m-0 text-xl text-cocoa">{testimonial.quote}</blockquote>
          <p className="mt-3 font-[family-name:var(--font-hand)] text-toffee-ink">{testimonial.attribution}</p>
        </NoteShape>
        <p className="mt-10 font-[family-name:var(--font-hand)] text-2xl text-toffee-ink">{photos.length} moments and counting</p>
        <FamilyWall photos={photos} />
        <p className="mt-4 text-center font-[family-name:var(--font-hand)] text-2xl text-toffee-ink">every one of them was a Teddy Pup once</p>
      </Container>
    </main>
  );
}
