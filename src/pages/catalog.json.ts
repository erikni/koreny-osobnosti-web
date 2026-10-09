import {catalog, homeUrl, url} from '../lib/catalog';
import {pageMetadata} from '../lib/seo';

export async function GET({site}) {
  const c = await catalog();
  const languageUrls = (key, id) => Object.fromEntries(['cs', 'en'].map(lang => [lang, new URL(url(lang, key, id), site).href]));
  const entryLinks = entries => entries.map(e => ({id: e.data.id, language_urls: languageUrls('entries', e.data.id)}));
  const descriptions = (kind, record, related = []) => Object.fromEntries(['cs', 'en'].map(lang => {
    const entry = kind === 'entry' ? record : null;
    const plant = kind === 'plant' ? record : entry ? c.plants.find(p => p.data.id === entry.data.plant_id) : null;
    const person = kind === 'person' ? record : null;
    return [lang, pageMetadata({lang, kind, id: record.data.id, title: record.data.name,
      entry, plant, person, related, category: null, count: related.length}).description];
  }));
  return new Response(JSON.stringify({
    schema_version: 2,
    project: 'Kořeny osobností',
    language_urls: Object.fromEntries(['cs', 'en'].map(lang => [lang, new URL(homeUrl(lang), site).href])),
    entries: c.entries.map(e => ({...e.data,
      language_urls: languageUrls('entries', e.data.id), descriptions: descriptions('entry', e),
      plant_language_urls: languageUrls('plants', e.data.plant_id),
      person_language_urls: e.data.person_ids.map(id => ({id, language_urls: languageUrls('people', id)})),
    })),
    plants: c.plants.map(p => {
      const related = c.entries.filter(e => e.data.plant_id === p.data.id);
      return {...p.data, language_urls: languageUrls('plants', p.data.id), descriptions: descriptions('plant', p, related),
        entry_language_urls: entryLinks(related)};
    }),
    people: c.people.map(p => {
      const related = c.entries.filter(e => e.data.person_ids.includes(p.data.id));
      // Main participants share the planting detail; do not expose an alias as canonical.
      const merged = c.entries.find(e => e.data.id === p.data.id);
      return {...p.data, language_urls: languageUrls('people', p.data.id),
        descriptions: merged ? descriptions('entry', merged) : descriptions('person', p, related),
        entry_language_urls: entryLinks(related)};
    }),
  }, null, 2), {headers: {'Content-Type': 'application/json; charset=utf-8'}});
}
