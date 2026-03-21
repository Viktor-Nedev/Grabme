import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-2xl surface-card p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">404</p>
        <h1 className="mt-4 font-display text-4xl">This page is not part of the current Grabme route map.</h1>
        <p className="mt-4 text-sm text-brand-gray">
          Use the public map, a dashboard shortcut, or return to the landing page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            Home
          </Link>
          <Link to="/map" className="btn-ghost">
            Open Map
          </Link>
        </div>
      </div>
    </section>
  );
}
