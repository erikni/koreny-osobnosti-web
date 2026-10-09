# Návrh webu Kořeny osobností

Stav: návrh k posouzení, 9. října 2026. Cílová doména: https://www.koreny-osobnosti.cz. Repozitář: https://github.com/erikni/koreny-osobnosti-web.

## Účel a hlavní návštěvnické cesty

Web propojí známé osobnosti s rostlinami, které zasadily nebo které jim byly věnovány v Botanické zahradě hl. m. Prahy. Návštěvník může najít osobnost podle příjmení, profese a roku; od osobnosti přejít ke stromu a od stromu k dalším osobnostem. Výsadba bude samostatný záznam, aby společný strom nevytvářel několik zdánlivě různých stromů.

Hlavní navigace: Osobnosti, Stromy a rostliny, Příběh projektu, Návštěva zahrady. Vyhledávání a přepínač Čeština / English budou dostupné na všech stránkách. Galerie, zdroje a kontakt mohou být v patičce.

## Struktura a adresy

| Obsah | Čeština | English | Účel |
|---|---|---|---|
| Úvod | /cs/ | /en/ | Příběh, hledání, vstup do katalogu |
| Osobnosti | /cs/osobnosti/ | /en/people/ | Abeceda, profese, rok, rostlina |
| Detail osobnosti | /cs/osobnosti/vaclav-havel/ | /en/people/vaclav-havel/ | Medailonek, výsadba, strom, fotografie, zdroje |
| Profese | /cs/obory/sportovci/ | /en/categories/athletes/ | Trvalý odkaz na kategorii |
| Rok výsadby | /cs/roky/2024/ | /en/years/2024/ | Chronologický přehled a všechny výsadby roku |
| Stromy a rostliny | /cs/rostliny/ | /en/plants/ | Stromy jako výchozí filtr; keře a jiné rostliny zvlášť |
| Detail rostliny | /cs/rostliny/magnolia-kobus/ | /en/plants/magnolia-kobus/ | Český/anglický a botanický název, propojené výsadby |
| Detail výsadby | /cs/vysadby/petra-kvitova-2024/ | /en/plantings/petra-kvitova-2024/ | Sdílené události, skuteční sázející, datum a důkazy |
| Galerie | /cs/galerie/ | /en/gallery/ | Pouze fotografie schválené k použití |
| Příběhy | /cs/pribehy/ | /en/stories/ | Vlastní články s odkazy na prameny |
| Projekt | /cs/o-projektu/ | /en/about/ | Darina Miklovičová a Botanická zahrada, historie |
| Návštěva | /cs/navsteva/ | /en/visit/ | Stezka, odkaz na oficiální mapu, aktuální návštěvní informace |
| Zdroje a metodika | /cs/zdroje/ | /en/sources/ | Ověřování, opravy, nejasnosti |
| Kontakt a práva | /cs/kontakt/ | /en/contact/ | Opravy údajů a autorská práva |

Kořen / bude lehká jazyková vstupní stránka s odkazy na obě verze a hreflang x-default. Nepoužívat automatické přesměrování podle IP. Přepínač na detailu zachová osobnost nebo rostlinu prostřednictvím stabilního ID. Nehotové překlady nezveřejňovat a neindexovat jako hotové stránky.

Abecední řazení bude podle příjmení s českou lokalizací, nikoli podle prvního písmene křestního jména. Profese mohou být vícečetné, například herec a hudebník. Roční filtr výsadby musí vycházet z doloženého roku události; neznámé roky budou v samostatné skupině. Složité kombinace filtrů jsou uživatelská pomůcka, nikoli tisíce indexovaných duplicitních URL.

## Obsah v Markdownu

Navrhované adresáře:

```text
content/
  entities/people/          # společné identifikátory, jména, profese
  entities/plants/          # vědecký název, kultivar a botanické zdroje
  plantings/                # výsadby; poctění a skuteční sázející zvlášť
  profiles/cs/              # české medailonky
  profiles/en/              # anglické medailonky
  pages/cs/                 # projekt, návštěva, metodika
  pages/en/
  stories/cs/               # vlastní články
  stories/en/
  media/                    # popisy, licence a zdroje fotografií
  sources/                  # bibliografické záznamy
src/
  layouts/ components/ pages/ styles/
public/
  images/                   # pouze oprávněné publikovatelné soubory
```

Veškerý redakčně upravovaný obsah bude .md s YAML frontmatterem. Společná fakta se překladem neduplikují; lokalizované profily odkazují na person_id. Při sestavení se ověří povinná pole, existence vazeb, unikátní ID, jazykové protějšky a neplatné datum. Stav ready znamená redakční připravenost, nikoli souhlas k nasazení.

Z dosavadní rešerše je připraveno 127 oficiálních položek, 153 skutečných osob včetně zástupců a 79 zdrojů. Nejde o 127 samostatných stromů ani o 153 hotových medailonků. Import musí zachovat společné výsadby, skupiny, symbolické akty a rozpory v názvech rostlin. Čtyři položky nemají doložen přesný rok. Počet druhů stromů se určí až po normalizaci botanických názvů; historické alternativy se nesčítají jako další vysazené stromy.

Každý profil: jméno → krátký ověřený medailonek → profese → rok/datum a způsob účasti → rostlina → fotografie s popiskem → původní zdroje a datum ověření. U skutečného sázejícího odlišného od poctěné osobnosti to stránka výslovně uvede.

## Technologie

Doporučení: Astro se statickým výstupem. Markdown a metadata se zpracují při sestavení, vzniknou samostatné HTML stránky. Obsahové kolekce umožňují validační schémata a propojení záznamů. JavaScript je potřeba jen pro pohodlné hledání, filtry a mobilní menu; texty, odkazy a základní přehledy zůstanou čitelné bez něj.

Cloudflare Pages: sestavení npm run build, výstup dist. Pro schvalování doporučuji Direct Upload hotového sestavení místo automatického produkčního nasazení při každém pushi. Výběr Direct Upload nelze u stejného Pages projektu později jednoduše přepnout na Git integraci; změna vyžaduje nový projekt. Přesné verze závislostí se zafixují při implementaci.

## Přírodní vzhled a přístupnost

Barevnost: lesní zelená #173F30, mechová #5C7549, světlá šalvěj #DDE8D7, krémová #F6F3EA, text #22362B. Tlumená zlatá #BAA576 pouze na dekorace, dokud není ověřen kontrast. Nadpisy mohou mít klidnou patkovou typografii, běžný text dobře čitelné bezpatkové písmo. Lokální náhled používá systémová písma; finální výběr se ověří na české diakritice a licenci.

Úvodní stránka: výrazný nadpis, stručný účel, ilustrace nebo oprávněná fotografie, hledání a dvě jasné cesty Osobnosti / Stromy. Karty mají jméno, profesi, rok a název rostliny. Detail má čistý dlouhý text, botanický blok a zdroje. Nepoužívat neověřené partnerské logo ani fotografie pouze proto, že jsou dostupné na internetu.

Responsivní rozložení: jeden sloupec na mobilu, dva na tabletu a tři až čtyři na široké obrazovce. Zachovat ovládání klávesnicí, viditelný focus, čitelné popisky, dostatečné dotykové cíle, reduced-motion a kontrast WCAG AA. Latinské názvy kurzívou, kultivar v jednoduchých uvozovkách. Fotografie dostanou velikost, vhodné varianty a věcný alt text.

## Dva jazyky a SEO

Každý jazyk má vlastní URL, vlastní title a description, vlastní canonical a vzájemné hreflang cs/en. Sitemap obsahuje pouze publikované stránky. Přeložená stránka bude skutečně anglická, včetně navigace, popisků, alt textů a metadat. Google doporučuje uvést jazykové alternativy včetně sebe samé a obousměrných vazeb.

Open Graph: og:title, og:type, og:url, og:image, dále description, site_name, locale cs_CZ/en_GB, alternate a image:alt. Sociální obrázek připravit například 1200 × 630 px z grafiky a fotografií s oprávněním. Doplnit Twitter summary_large_image. Canonical doména bude www; variantu bez www směrovat trvalým přesměrováním až při konfiguraci DNS a hostingu.

JSON-LD: WebSite, BreadcrumbList, WebPage a Person pro osoby, Article pro příběhy, ImageObject pro fotografie. Projekt představit pomocí Organization a vazeb na spoluautory. Nepřisuzovat webu právní subjektivitu, partnerské logo nebo oficiální status bez dohody. Výsadbu značit jako Event jen při doložených údajích odpovídajících události; nevymýšlet den, místo ani účast. Rostliny popsat jako předmět stránky s botanickým jménem, bez neověřených taxonomických identifikátorů.

Obsah musí být v sémantickém HTML: jeden hlavní nadpis, hlavní obsah, navigace, jasné tabulky, skutečné odkazy, viditelné zdroje a datum ověření. Strukturovaná data musí souhlasit s tím, co návštěvník vidí. AI agenti tak získají stejné dohledatelné informace jako lidé. Volitelný /llms.txt může odkazovat na katalog a metodiku, ale nejde o podmínku indexace ani záruku doporučování AI. Google výslovně nevyžaduje zvláštní AI soubory či speciální schema.

Doplnit robots.txt, XML sitemap, stránky 404, přesměrování změněných slugů a sdílecí metadata. Cíle výkonu: LCP do 2,5 s, INP do 200 ms, CLS do 0,1; jde o cíle budoucí implementace, nikoli naměřené výsledky návrhu.

## Zdroje, fotografie a spoluautorství

Krátké medailonky budou původní formulace ověřené na české Wikipedii a podle potřeby dalších pramenech. Údaje o výsadbě čerpat zejména z Botanické zahrady a výročních zpráv; Wikipedie sama výsadbu nedokládá. Uchovat odkazy odděleně pro biografii, výsadbu a botanickou identifikaci.

Oficiální stránka Botanické zahrady označuje Darinu Miklovičovou za spoluautorku projektu. Stránka O projektu uvede oba spolupracující subjekty podle jejich schváleného znění a odkáže na zahradu a poskytnutý LinkedIn profil. Obsah LinkedIn profilu nebyl dostupný k ověření, proto z něj návrh neodvozuje další osobní údaje.

U každé fotografie evidovat autora, původní URL, licenci nebo písemný souhlas, datum a rozsah oprávnění, popisek, alt v obou jazycích a publication_status. Archiv z rešerše obsahuje 247 fotografických záznamů; jejich dostupnost není oprávnění pro web. Do veřejné galerie se dostanou jen vyřešené fotografie. Aktualizovaný lokální návrh používá archivní snímky konkrétních výsadeb s odkazy na zdroje; oprávnění pro veřejný web dosud není vyřešeno. Fotografické detaily stromů jsou označené jako archivní, nikoli jako současný stav.

## Povinný postup publikace

1. Upravit Markdown a kód, sestavit a ověřit odkazy, data, oba jazyky, dostupnost a vzhled na mobilu i desktopu.
2. Připravit konkrétní neměnný artefakt; evidovat Git commit a kontrolní součet sestavení.
3. Ukázat uživateli náhled tohoto artefaktu. Lokální nebo neveřejný náhled předchází jakémukoli nasazení; případný cloudový preview vyžaduje odpovídající souhlas a ochranu. Cloudflare preview standardně posílá X-Robots-Tag: noindex, což není ochrana soukromí.
4. Vyžádat výslovné schválení tohoto sestavení k produkční publikaci.
5. Nasadit přesně schválený artefakt, ověřit doménu a zaznamenat výsledek. Změna po schválení vrací proces k náhledu.

GitHub CI může automaticky sestavovat a kontrolovat. Produkční workflow nesmí být automaticky připojen na push/merge. Pokud bude dostupný GitHub environment s required reviewer, lze přidat druhou technickou bránu a zpřístupnit produkční tajemství až po schválení. Dostupnost závisí na tarifu a viditelnosti repozitáře; samotné workflow_dispatch není schválení. Bez dostupné brány zůstane nasazení ruční a produkční token nebude v nehlídané automatizaci.

Návrh zatím nic nenastavuje v Cloudflare, DNS ani GitHub Actions a nic nepublikuje. Stav ready v Markdownu není produkční souhlas.

## Doporučené etapy

1. Schválit strukturu a vizuální směr.
2. Implementovat Astro, validační schémata, jazykové šablony a převést rešerši do propojených Markdown záznamů.
3. Ověřit medailonky všech osob, normalizovat rostliny a vyřešit fotografie; připravit anglické překlady.
4. Připravit úplný responsivní náhled, zkontrolovat SEO a rychlost a předložit konkrétní sestavení.
5. Teprve po výslovném schválení nakonfigurovat produkční nasazení a doménu.

## Dokumentace a prameny

- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- [Cloudflare Pages pro Astro](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [GitHub deployment environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [Google: jazykové alternativy](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: AI features](https://developers.google.com/search/docs/appearance/ai-features)
- [Open Graph](https://ogp.me/)
- [Schema.org](https://schema.org/)
- [Volitelný návrh llms.txt](https://llmstxt.org/)
- [Oficiální projekt](https://www.botanicka.cz/pro-navstevniky/navstevnicke-okruhy/koreny-osobnosti.html)
- [Seznam osobností zahrady](https://www.botanicka.cz/pro-navstevniky/navstevnicke-okruhy/koreny-osobnosti-seznam)
- [Darina Miklovičová — poskytnutý LinkedIn](https://www.linkedin.com/in/darina-miklovicova-176162a/)

## Přijaté úpravy vzhledu

Uživatel schválil fotografický design. V záhlaví pod názvem i v podrobné patičce je výslovně uvedeno: „Společný projekt Dariny Miklovičové a Botanické zahrady hl. m. Prahy“. Text má anglický protějšek. Pozadí doplňuje vlastní opakovatelná SVG textura zelených stromů s geometrickými větvemi a listy, volně inspirovaná větveným motivem uvedené reference Home Assistant. Grafika nepoužívá převzaté logo. Schválení designu není souhlasem k produkčnímu nasazení.

## Umístění zdrojů a logo

Zdroje se nezobrazují na úvodní stránce ani v přehledových kartách. Každý detail osobnosti a každý článek má na konci sekci se zdroji faktů a fotografií. Odkazy na spoluautory v patičce zůstávají součástí představení projektu. Náhled obsahuje samostatné detaily Václava Havla a Petry Kvitové. Logo projektu přebírá vlastní motiv zelených geometrických větví, listů a kořenů z textury pozadí; vektorové varianty jsou v design/.
