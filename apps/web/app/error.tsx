"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell">
      <section className="card" aria-labelledby="error-title">
        <p className="eyebrow">Unexpected error</p>
        <h1 id="error-title">The application could not load this view.</h1>
        <p>
          Please try again. If the problem continues, provide the time and page to the project team.
        </p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
