import fs from 'fs';
import path from 'path';

/**
 * Homepage – served by reading the existing index.html through the Next.js server.
 *
 * This allows the full interactive HTML page (Leaflet map, modals, counters, etc.)
 * to keep working while the site is hosted on Next.js / Azure App Service.
 *
 * Migrate sections to React components incrementally by replacing this file with
 * proper JSX once you are ready to add server-side data fetching, i18n, etc.
 */
export default function Home() {
  // Content is written directly to the response in getServerSideProps.
  return null;
}

export async function getServerSideProps({ res }) {
  const filePath = path.join(process.cwd(), 'index.html');

  if (!fs.existsSync(filePath)) {
    return { notFound: true };
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.write(html);
  res.end();

  return { props: {} };
}
