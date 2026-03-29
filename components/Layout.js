/**
 * Layout component – shared header/footer wrapper for new React pages.
 *
 * Legacy HTML pages are served via the catch-all route and do not use this
 * component. Use it when building new Next.js pages from scratch.
 */
export default function Layout({ children, title, description }) {
  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <main id="main-content">{children}</main>
    </div>
  );
}
