export default function NotFound() {
  return (
    <div className="container error-page">
      <section aria-labelledby="not-found-title">
        <p className="eyebrow">404 · Nothing at this address</p>
        <h1 id="not-found-title">That page is not part of the current lab.</h1>
        <p>
          The requested view does not exist. Return to the foundation and choose a documented path.
        </p>
        <a className="button" href="/">
          Return home
        </a>
      </section>
    </div>
  );
}
