import { Link } from 'react-router'

/** Splat route: renders inside the layout for any unknown URL. */
export const NotFoundPage = () => (
  <section className="panel">
    <h2>Page not found</h2>
    <p className="muted">That route doesn’t exist.</p>
    <Link to="/">← Back to catalog</Link>
  </section>
)
