import assets from './image-assets.json';
import {publicPhotos, plantPhotos} from './photos';
import licences from '../../design/public-photo-licenses.json';

export function socialImage({lang, kind, id, entry, plant, person}) {
  const cs = lang === 'cs';
  if (kind === 'entry' || kind === 'person') {
    const candidates = kind === 'entry' ? [id, ...(entry?.data.person_ids ?? [])] : [id];
    // A group may be illustrated by its actual participant; label that person explicitly.
    for (const pid of candidates) {
      const image = assets.social[`portraits/${pid}`], photo = publicPhotos[pid];
      if (image && photo) return {...image, alt: cs ? `Portrét: ${photo.name}` : `Portrait: ${photo.name}`};
    }
  }
  if (plant) {
    const image = assets.social[`plants/${plant.data.id}`], photo = plantPhotos[plant.data.id];
    if (image && photo) return {...image, alt: cs
      ? `Ilustrační fotografie rostliny: ${plant.data.scientific_name}${photo.illustration_scope === 'species' ? ' (druh)' : ''}`
      : `Illustrative plant photograph: ${plant.data.scientific_name}${photo.illustration_scope === 'species' ? ' (species)' : ''}`};
  }
  return {src: '/images/share.png', width: 1200, height: 630, type: 'image/png', alt: 'Kořeny osobností'};
}

export function attachImageMetadata(schema, image, site) {
  if (!image.photo_src) return;
  const photo = licences.derivatives[image.src];
  if (!photo) return;
  const contentUrl = new URL(image.src, site).href;
  const imageId = `${contentUrl}#image`;
  schema['@graph'].push({'@type': 'ImageObject', '@id': imageId, contentUrl,
    url: photo.source, caption: image.alt, description: photo.changes,
    width: image.width, height: image.height, encodingFormat: image.type,
    creditText: `${photo.author} · ${photo.license}`, license: photo.licenseUrl,
  });
  const page = schema['@graph'].find(node => ['WebPage', 'CollectionPage'].includes(node['@type']));
  page.primaryImageOfPage = {'@id': imageId};
  const article = schema['@graph'].find(node => node['@type'] === 'Article');
  if (article) article.image = {'@id': imageId};
}
