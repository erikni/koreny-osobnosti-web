// Metadata follows the verified YAML catalogue; it never infers who planted a tree.
export function plantLabel(plant, lang) {
  const name = plant[lang === 'cs' ? 'name_cs' : 'name_en'];
  return plant.cultivar && !name.includes(plant.cultivar)
    ? `${name} ‘${plant.cultivar}’` : name;
}

export function pageMetadata({lang, kind, id, title, entry, plant, person, related, category, count}) {
  const cs = lang === 'cs';
  const garden = cs ? 'Botanické zahradě Praha' : 'Prague Botanical Garden';
  let heading = title;
  let description;
  if (kind === 'entry') {
    const label = plantLabel(plant.data, lang);
    heading = `${entry.data.name} – ${label}`;
    description = cs
      ? `${entry.data.name} a ${label} v ${garden}. Poznejte příběh osobnosti, rostlinu a údaje o výsadbě${entry.data.year ? ` z roku ${entry.data.year}` : '; rok výsadby není doložen'}.`
      : `${entry.data.name} and ${label} at ${garden}. Discover the story, the plant and planting details${entry.data.year ? ` from ${entry.data.year}` : '; the planting year is unconfirmed'}.`;
  } else if (kind === 'plant') {
    const label = plantLabel(plant.data, lang);
    // Scientific names distinguish species sharing the same Czech common name.
    heading = cs ? `${label} (${plant.data.scientific_name})` : label;
    const names = related.slice(0, 2).map(e => e.data.name).join(', ');
    description = cs
      ? `${heading} v ${garden}. Poznejte vlastnosti rostliny a související výsadby${names ? `: ${names}` : ''}.`
      : `${label} at ${garden}. Discover the plant's characteristics and related plantings${names ? `: ${names}` : ''}.`;
  } else if (kind === 'person') {
    heading = cs ? `${person.data.name} – účast na výsadbách` : `${person.data.name} – planting participant`;
    const names = related.slice(0, 2).map(e => e.data.name).join(', ');
    description = cs
      ? `${person.data.name}: medailonek a účast na výsadbách v ${garden}${names ? `, související osobnosti a položky: ${names}` : ''}.`
      : `${person.data.name}: biography and participation in plantings at ${garden}${names ? `. Related people and entries: ${names}` : ''}.`;
  } else if (kind === 'category') {
    const name = category.data[cs ? 'name_cs' : 'name_en'];
    heading = cs ? `${name} – osobnosti a jejich výsadby` : `${name} – people and their plantings`;
    description = category.data[cs ? 'intro_cs' : 'intro_en'];
  } else if (kind === 'year') {
    description = cs
      ? `Výsadby v roce ${id} v ${garden}: ${count} položek projektu Kořeny osobností. Prohlédněte si osobnosti, jejich rostliny a příběhy.`
      : `Plantings in ${id} at ${garden}: ${count} entries in Kořeny osobností. Discover the people, their plants and stories.`;
  } else {
    const pages = cs ? {
      home: ['Kořeny osobností – osobnosti a jejich stromy v Praze', 'Poznejte osobnosti a jejich stromy v Botanické zahradě Praha. Prozkoumejte příběhy výsadeb, druhy rostlin a projekt Kořeny osobností.'],
      entries: ['Osobnosti a jejich výsadby v Botanické zahradě Praha', 'Prozkoumejte osobnosti projektu Kořeny osobností, jejich rostliny a příběhy výsadeb. Hledejte podle jména, profese, roku nebo rostliny.'],
      plants: ['Stromy a rostliny osobností v Botanické zahradě Praha', 'Poznejte stromy, keře a orchideje projektu Kořeny osobností. Botanické druhy, kultivary a související osobnosti na jednom místě.'],
      people: ['Účastníci a zástupci při výsadbách osobností', 'Poznejte účastníky projektu Kořeny osobností včetně rodinných zástupců. Medailonky a odkazy na související výsadby v Botanické zahradě Praha.'],
      timeline: ['Roky výsadby osobností v Botanické zahradě Praha', 'Projděte projekt Kořeny osobností podle roků výsadby. Objevte osobnosti a rostliny, které postupně obohatily Botanickou zahradu Praha.'],
      gallery: ['Galerie osobností a účastníků výsadeb', 'Prohlédněte si portréty osobností a účastníků projektu Kořeny osobností. Z fotografií přejděte k jejich příběhům a souvisejícím výsadbám.'],
      about: ['Příběh projektu Kořeny osobností', 'Kořeny osobností: společný projekt Dariny Miklovičové a Botanické zahrady hl. m. Prahy. Poznejte příběh projektu, zdroje a způsob čtení katalogu.'],
      visit: ['Stezka osobností v Botanické zahradě Praha – průvodce návštěvou', 'Naplánujte procházku po Stezce osobností v pražské Troji. Jak najít osobnosti a jejich rostliny, kde hledat mapu, aktuální vstupné a otevírací dobu.'],
    } : {
      home: ['Kořeny osobností – people and their plants in Prague', 'Discover the people and their plants at Prague Botanical Garden. Explore planting stories, botanical species and the Kořeny osobností project.'],
      entries: ['People and their plantings at Prague Botanical Garden', 'Explore the people, plants and planting stories of Kořeny osobností. Search by name, category, year or plant.'],
      plants: ['Trees and plants of prominent personalities in Prague', 'Discover the trees, shrubs and orchids of Kořeny osobností. Explore botanical species, cultivars and the people connected with their plantings.'],
      people: ['Planting participants and family representatives', 'Meet the participants of Kořeny osobností, including family representatives. Read their biographies and explore related plantings at Prague Botanical Garden.'],
      timeline: ['Planting years at Prague Botanical Garden', 'Explore Kořeny osobností by planting year. Discover the people and plants that have enriched Prague Botanical Garden over time.'],
      gallery: ['Gallery of people and planting participants', 'Browse portraits of the people and participants of Kořeny osobností. Open their biographies and discover related plantings at Prague Botanical Garden.'],
      about: ['The story of the Kořeny osobností project', 'Kořeny osobností is a joint project by Darina Miklovičová and Prague Botanical Garden. Discover its story, sources and how to read the catalogue.'],
      visit: ['Trail of Personalities at Prague Botanical Garden – visitor guide', 'Plan a walk along the Trail of Personalities in Prague Troja. Find people and their plants, garden maps, current admission prices and opening hours.'],
    };
    [heading, description] = pages[kind] ?? [title, title];
  }
  // The homepage already starts with the brand; avoid repeating it in the suffix.
  return {title: kind === 'home' ? heading : `${heading} | Kořeny osobností`, description};
}
