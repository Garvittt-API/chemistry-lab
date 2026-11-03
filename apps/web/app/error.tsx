"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container error-page">
      <section aria-labelledby="error-title">
        <p className="eyebrow">Unexpected error</p>
        <h1 id="error-title">The lab needs another moment.</h1>
        <p>
          Please try again. If the problem continues, provide the time and page to the project team.
        </p>
        <button className="button" type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </div>
  );
}
