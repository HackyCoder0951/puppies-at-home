import Link from 'next/link';

export function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none">
      <div className="tp-page gutter py-24 text-center">
        <p className="font-scrawl text-xl text-toffee-ink">oops, this page ran off</p>
        <h1 className="font-plush text-huge mt-4">Page not found</h1>
        <p className="text-lede mx-auto mt-4 max-w-[44ch]">The page you are looking for does not exist or has moved.</p>
        <Link className="btn btn-primary mt-8" href="/puppies">See available puppies</Link>
      </div>
    </main>
  );
}
