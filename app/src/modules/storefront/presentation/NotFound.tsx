import { paths } from '@nav';
import { Button, Container, Kicker, Mascot } from '@shared/ui';

export function NotFound() {
  return (
    <main id="main">
      <Container className="flex flex-col items-center gap-5 py-24 text-center">
        <Mascot className="size-32" title="Confused puppy" />
        <Kicker>oops, this page ran off</Kicker>
        <h1 className="text-6xl">Page not found</h1>
        <p className="max-w-md">The page you are looking for does not exist or has moved. Let us help you find a puppy instead.</p>
        <Button href={paths.puppies()}>See available puppies</Button>
      </Container>
    </main>
  );
}
