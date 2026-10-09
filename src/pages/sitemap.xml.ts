import {routes} from '../lib/catalog';
import {pagePath} from '../lib/structured-data';

const escapeXml = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll("'",'&apos;');
export async function GET({site}) {
  const pages = await routes();
  const absolute = (lang,kind,id) => escapeXml(new URL(pagePath(lang,kind,id),site).href);
  const body = pages.map(({lang,kind,id}) => {
    const cs = absolute('cs',kind,id), en = absolute('en',kind,id);
    return `<url><loc>${lang==='cs'?cs:en}</loc>`+
      `<xhtml:link rel="alternate" hreflang="cs" href="${cs}"/>`+
      `<xhtml:link rel="alternate" hreflang="en" href="${en}"/>`+
      `<xhtml:link rel="alternate" hreflang="x-default" href="${cs}"/></url>`;
  }).join('');
  // Verification dates are not modification dates; omit lastmod until changes are recorded reliably.
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+body+'</urlset>',
    {headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
