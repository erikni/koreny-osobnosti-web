import {homeUrl, text, url} from './catalog';
import {plantLabel} from './seo';

type SchemaNode = {'@type': string; '@id': string; [key: string]: unknown};

export const absoluteUrl = (path, site) => new URL(path, site).href;
export const pagePath = (lang, kind, id = '') => kind === 'home' ? homeUrl(lang)
  : url(lang, {entry: 'entries', plant: 'plants', person: 'people', year: 'timeline'}[kind] ?? kind, id);

export function pageBreadcrumbs({lang, kind, id, title, category}) {
  if (kind === 'home') return [];
  const crumbs = [{name: lang === 'cs' ? 'Úvod' : 'Home', path: homeUrl(lang)}];
  if (kind === 'entry') {
    crumbs.push({name: text[lang].people, path: url(lang, 'entries')});
    if (category) crumbs.push({name: category.data[lang === 'cs' ? 'name_cs' : 'name_en'], path: url(lang, 'category', category.data.id)});
  } else if (kind === 'plant') {
    crumbs.push({name: text[lang].plants, path: url(lang, 'plants')});
  } else if (kind === 'person') {
    crumbs.push({name: text[lang].participants, path: url(lang, 'people')});
  } else if (kind === 'year') {
    crumbs.push({name: lang === 'cs' ? 'Roky výsadby' : 'Planting years', path: url(lang, 'timeline')});
  } else if (kind === 'category') {
    crumbs.push({name: text[lang].people, path: url(lang, 'entries')});
  }
  crumbs.push({name: title, path: pagePath(lang, kind, id)});
  return crumbs;
}

export function pageGraph({site, lang, kind, id, title, description, breadcrumbs = [], entry = null, plant = null, person = null, people = [], items = [], citations = []}) {
  const canonical = absoluteUrl(pagePath(lang, kind, id), site);
  const websiteId = absoluteUrl('/#website', site);
  const pageId = `${canonical}#webpage`;
  const ref = id => ({'@id': id});
  const graph: SchemaNode[] = [{
    '@type': 'WebSite', '@id': websiteId, name: 'Kořeny osobností',
    url: absoluteUrl('/', site), inLanguage: ['cs', 'en'],
    creator: [
      {'@type': 'Person', name: 'Darina Miklovičová', sameAs: 'https://www.linkedin.com/in/darina-miklovicova-176162a/'},
      {'@type': 'Organization', name: 'Botanická zahrada hl. m. Prahy', url: 'https://www.botanicka.cz/'},
    ],
  }];
  const page: SchemaNode = {
    '@type': ['entries', 'plants', 'people', 'timeline', 'gallery', 'year', 'category'].includes(kind) ? 'CollectionPage' : 'WebPage',
    '@id': pageId, url: canonical, name: title, description, inLanguage: lang, isPartOf: ref(websiteId),
  };
  graph.push(page);
  if (citations.length && kind !== 'entry') page['citation'] = [...new Set(citations)];

  if (breadcrumbs.length) {
    const breadcrumbId = `${canonical}#breadcrumb`;
    page['breadcrumb'] = ref(breadcrumbId);
    graph.push({'@type': 'BreadcrumbList', '@id': breadcrumbId, itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem', position: index + 1, name: crumb.name, item: absoluteUrl(crumb.path, site),
    }))});
  }

  const personId = data => `${absoluteUrl(url('cs', 'people', data.id), site)}#person`;
  const personNode = (data, detailed) => ({
    '@type': 'Person', '@id': personId(data), name: data.name, url: absoluteUrl(url(lang, 'people', data.id), site),
    ...(detailed ? {
      birthDate: data.birth_date, deathDate: data.death_date,
      birthPlace: data.birth_place ? {'@type': 'Place', name: data.birth_place} : undefined,
      deathPlace: data.death_place ? {'@type': 'Place', name: data.death_place} : undefined,
      homeLocation: data.residence ? {'@type': 'Place', name: data.residence} : undefined,
      description: (data[lang === 'cs' ? 'highlights_cs' : 'highlights_en'] ?? []).join(' ') || undefined,
      sameAs: [...new Set([
        ...(data.facts_source_urls ?? []).filter(value => {
          const host = new URL(value).hostname;
          return host === 'wikipedia.org' || host.endsWith('.wikipedia.org');
        }),
        ...(data.official_website ? [data.official_website] : []),
      ])],
    } : {}),
  });
  let plantId;
  if (plant) {
    plantId = `${absoluteUrl(url('cs', 'plants', plant.data.id), site)}#plant`;
    // This is a catalogue subject, not a claim about a specific living specimen
    // or a formal taxonomic rank for uncertain historical names and cultivars.
    graph.push({'@type': 'Thing', '@id': plantId, name: plantLabel(plant.data, lang),
      alternateName: `${plant.data.scientific_name}${plant.data.cultivar ? ` ‘${plant.data.cultivar}’` : ''}`,
      url: absoluteUrl(url(lang, 'plants', plant.data.id), site)});
  }
  if (kind === 'entry') {
    const subjectId = person ? personId(person.data) : `${absoluteUrl(url('cs', 'entries', id), site)}#subject`;
    graph.push(person ? personNode(person.data, true) : {
      '@type': entry.data.entity_type === 'group' && entry.data.category_id === 'nadace-a-spolky' ? 'Organization' : 'Thing',
      '@id': subjectId, name: entry.data.name, url: canonical,
    });
    const participants = people.filter(p => p.data.id !== person?.data.id);
    graph.push(...participants.map(p => personNode(p.data, false)));
    const articleId = `${canonical}#article`;
    page['mainEntity'] = ref(articleId);
    graph.push({'@type': 'Article', '@id': articleId, headline: entry.data.name, description, url: canonical,
      inLanguage: lang, isPartOf: ref(pageId), mainEntityOfPage: ref(pageId),
      about: [ref(subjectId), ...(plantId ? [ref(plantId)] : [])],
      ...(participants.length ? {mentions: participants.map(p => ref(personId(p.data)))} : {}),
      citation: [...new Set(citations)],
    });
  } else if (kind === 'person') {
    graph.push(personNode(person.data, true));
    page['mainEntity'] = ref(personId(person.data));
    if (citations.length) page['citation'] = [...new Set(citations)];
  } else if (kind === 'plant') {
    page['mainEntity'] = ref(plantId);
    if (citations.length) page['citation'] = [...new Set(citations)];
  }
  if (items.length || page['@type'] === 'CollectionPage') {
    const listId = `${canonical}#list`;
    graph.push({'@type': 'ItemList', '@id': listId, numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({'@type': 'ListItem', position: index + 1,
        name: item.name, url: absoluteUrl(item.path, site)}))});
    if (page['mainEntity']) page['mentions'] = ref(listId);
    else page['mainEntity'] = ref(listId);
  }
  return {'@context': 'https://schema.org', '@graph': graph};
}
