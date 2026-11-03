export default function Loading() {
  return (
    <div className="container loading-block" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="skeleton skeleton-short" />
      <div className="skeleton skeleton-medium" />
      <div className="skeleton" />
    </div>
  );
}
