import fs from 'fs';
import path from 'path';

/**
 * Catch-all route for legacy HTML pages.
 *
 * Any URL such as /province, /gouverneur, /actualite-* etc. is resolved to the
 * matching *.html file at the repository root and streamed back as a full HTML
 * response – preserving all inline styles, scripts, and Leaflet maps.
 *
 * New pages should be added as dedicated files under /pages/*.js and will take
 * precedence over this catch-all automatically.
 */
export default function LegacyPage() {
  // Content is written directly to the response in getServerSideProps.
  return null;
}

export async function getServerSideProps({ params, res }) {
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug;

  // Resolve and validate that the target file stays inside process.cwd()
  const rootDir = path.resolve(process.cwd());
  const resolved = path.resolve(rootDir, `${slug}.html`);

  if (!resolved.startsWith(rootDir + path.sep) && resolved !== rootDir) {
    return { notFound: true };
  }

  if (fs.existsSync(resolved)) {
    const html = fs.readFileSync(resolved, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write(html);
    res.end();
    return { props: {} };
  }

  return { notFound: true };
}
