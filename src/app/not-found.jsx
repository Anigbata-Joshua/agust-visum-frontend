export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3 bg-paper text-ink">
      <span className="font-cond text-xs tracking-[0.14em] uppercase text-brick">Pg. 404</span>
      <h1 className="font-display text-4xl">Page not found</h1>
      <a href="/" className="font-cond text-xs tracking-[0.1em] uppercase border-b border-ink pb-0.5">
        Back to the Homepage
      </a>
    </main>
  );
}
