import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';

const site = 'https://www.koreny-osobnosti.cz';
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const urls = [...fs.readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => decode(m[1]));
const canonicalUrls = new Set(urls);
assert.equal(urls.length, canonicalUrls.size, 'Duplicate sitemap URL');
const records = folder => fs.readdirSync(`content/${folder}`).filter(f => f.endsWith('.md'))
  .map(f => YAML.parse(fs.readFileSync(`content/${folder}/${f}`, 'utf8').split('---')[1]));
const personNames = new Set(records('people').map(p => p.name));
const titles = {cs: new Set(), en: new Set()}, descriptions = {cs: new Set(), en: new Set()};
let trails = 0, listLinks = 0;
for (const canonical of urls) {
  const pathname = new URL(canonical).pathname, lang = pathname.startsWith('/en/') ? 'en' : 'cs';
  const html = fs.readFileSync(path.join('dist', pathname, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, `${canonical}: expected one graph`);
  const schema = JSON.parse(scripts[0][1]);
  assert.equal(schema['@context'], 'https://schema.org');
  const nodes = schema['@graph']; assert(Array.isArray(nodes), `${canonical}: missing graph`);
  const ids = new Map(nodes.map(n => [n['@id'], n]));
  assert.equal(nodes.length, ids.size, `${canonical}: repeated graph ID`);
  const page = ids.get(`${canonical}#webpage`);
  assert(page && ['WebPage', 'CollectionPage'].includes(page['@type']), `${canonical}: missing page`);
  assert.equal(page.url, canonical); assert.equal(page.inLanguage, lang);
  assert.equal(page.isPartOf['@id'], `${site}/#website`);
  assert.equal(ids.get(`${site}/#website`)?.['@type'], 'WebSite');
  const checkReferences = value => {
    if (Array.isArray(value)) return value.forEach(checkReferences);
    if (!value || typeof value !== 'object') return;
    if (value['@id'] && Object.keys(value).length === 1) assert(ids.has(value['@id']), `${canonical}: unresolved ${value['@id']}`);
    Object.values(value).forEach(checkReferences);
  };
  checkReferences(nodes);
  for (const node of nodes) if (node['@type'] === 'Person') assert(personNames.has(node.name), `${canonical}: misclassified person ${node.name}`);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]; assert(main, `${canonical}: missing main`);
  const links = [...main.matchAll(/href="([^"]+)"/g)].map(m => new URL(decode(m[1]), canonical).href);
  const crumbs = ids.get(`${canonical}#breadcrumb`);
  const nav = main.match(/<nav class="breadcrumbs"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  if (pathname === '/' || pathname === '/en/') assert(!crumbs && !nav, `${canonical}: homepage breadcrumbs`);
  else {
    assert(crumbs && nav, `${canonical}: missing breadcrumbs`);
    assert.equal(page.breadcrumb['@id'], crumbs['@id']);
    assert.equal(crumbs.itemListElement.at(-1).item, canonical);
    for (const [index, crumb] of crumbs.itemListElement.entries()) {
      assert.equal(crumb.position, index + 1); assert(canonicalUrls.has(crumb.item), `${canonical}: breadcrumb is not canonical`);
      assert(decode(nav).includes(crumb.name), `${canonical}: invisible breadcrumb`);
      if (index < crumbs.itemListElement.length - 1) assert(links.includes(crumb.item), `${canonical}: missing breadcrumb link`);
    }
    assert(nav.includes('aria-current="page"')); trails++;
  }
  for (const list of nodes.filter(n => n['@type'] === 'ItemList')) {
    assert.equal(list.numberOfItems, list.itemListElement.length);
    for (const [index, item] of list.itemListElement.entries()) {
      assert.equal(item.position, index + 1); assert(canonicalUrls.has(item.url), `${canonical}: list item is not canonical`);
      assert(links.includes(item.url), `${canonical}: list item is not visible`); listLinks++;
    }
  }
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]);
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)[1]);
  assert.equal(page.name, title); assert.equal(page.description, desc);
  assert(!titles[lang].has(title), `${canonical}: duplicate title`); assert(!descriptions[lang].has(desc), `${canonical}: duplicate description`);
  titles[lang].add(title); descriptions[lang].add(desc);
}
const catalogue = JSON.parse(fs.readFileSync('dist/catalog.json', 'utf8'));
assert.equal(catalogue.schema_version, 2);
for (const key of ['entries', 'people', 'plants']) {
  const source = new Map(records(key).map(r => [r.id, r]));
  assert.equal(catalogue[key].length, source.size);
  for (const record of catalogue[key]) {
    for (const [field, value] of Object.entries(source.get(record.id))) assert.deepEqual(record[field], value, `${key}/${record.id}: changed source field ${field}`);
    for (const lang of ['cs', 'en']) {assert(canonicalUrls.has(record.language_urls[lang])); assert(record.descriptions[lang]);}
    const checkUrls = value => {
      if (Array.isArray(value)) return value.forEach(checkUrls);
      if (!value || typeof value !== 'object') return;
      if (value.language_urls) for (const target of Object.values(value.language_urls)) assert(canonicalUrls.has(target), `${record.id}: broken relationship URL`);
      Object.values(value).forEach(checkUrls);
    };
    checkUrls(record);
    if (record.plant_language_urls) for (const target of Object.values(record.plant_language_urls)) assert(canonicalUrls.has(target));
  }
}
console.log(`Validated ${urls.length} page graphs, ${trails} breadcrumb trails, ${listLinks} visible list links and canonical bilingual catalogue relationships.`);
