import { Container, Kicker } from '@shared/ui';

/** Placeholder legal page pending owner approval of final text (decision D16). */
export function LegalPage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main id="main">
      <Container className="max-w-3xl py-16">
        <Kicker>the small print</Kicker>
        <h1 className="mt-4 text-5xl">{title}</h1>
        <div className="mt-6 space-y-4">
          {children ?? <p>This page is a placeholder. The final text will be provided after legal review.</p>}
        </div>
      </Container>
    </main>
  );
}
