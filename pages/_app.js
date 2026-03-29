import '../styles/globals.css';

/**
 * Root application wrapper.
 * Wrap with global providers (analytics, context, etc.) here as the site grows.
 */
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
