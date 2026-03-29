import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document – applied only to Next.js-rendered pages (not legacy HTML pass-through).
 */
export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <meta name="theme-color" content="#003882" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
