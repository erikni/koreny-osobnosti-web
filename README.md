# Kořeny osobností

Český a anglický web společného projektu Dariny Miklovičové a Botanické zahrady hl. m. Prahy. Produkční adresa: https://www.koreny-osobnosti.cz.

## Obsah a sestavení

Astro vytváří statické HTML z Markdownu s YAML metadaty. `content/entries` obsahuje 127 položek projektu, `content/articles` jejich české a anglické články, `content/people` 153 účastníků, `content/biographies` jejich vizitky, `content/plants` 108 botanických označení včetně kultivarů, `content/plant-profiles` jejich 216 českých a anglických popisů a `content/pages` texty stránek. Neznámé roky a nejasnosti jsou výslovně označené. Zdroje a fotografické licence jsou na detailech.

Použij Node.js 24 (minimum 22.12):

```sh
npm ci
npm run check
npm run build
npm run preview
```

Výstup je v `dist`. Web obsahuje canonical, hreflang, Open Graph, JSON-LD, sitemap.xml, robots.txt, llms.txt a catalog.json. Filtry používají JavaScript; články a navigace jsou dostupné i bez něj.

## Fotografie

Veřejné fotografie mají doloženou licenci a autorství v `design/public-photo-licenses.json`. Aktuálně jde o 32 portrétů a dvě ilustrativní fotografie botanických druhů. Nejde o fotografie konkrétních vysazených exemplářů. Archivní fotografie s nevyřešenými oprávněními zůstávají v lokálním, Git ignorovaném `preview/`. Odložené kandidáty eviduje `design/deferred-photo-candidates.json`.

## Publikace

Na přání uživatele používáme existující Cloudflare Worker `koreny-osobnosti-web`, propojený s větví `main`. Konfigurace statických souborů je ve `wrangler.jsonc`. Cloudflare sestavuje příkazem `npm run check && npm run build` a publikuje přes `npx wrangler deploy`.

První vydání uživatel schválil 9. října 2026 včetně celého webu a článků. Pro další vydání nejprve ukaž náhled a vyžádej schválení. Teprve potom aktualizuj `release/approved.json`. Cloudflare sleduje pro spuštění sestavení pouze tento soubor; běžná změna obsahu tedy sama nasazení nespouští. Jde o pracovní postup schvalování, nikoli bezpečnostní omezení přístupu přispěvatelů. GitHub workflow pouze kontroluje a sestavuje web.

Původní návrh a obsahové schéma jsou v `docs/`. Ukázky v `content/profiles` a `content/entities` jsou historické návrhy; aplikace používá výše uvedené kolekce.

## Adresy a detaily

Česká verze je na `/`, anglická na `/en/`. Detaily používají typ osobnosti, například `/politik/vaclav-havel/` a `/en/politician/vaclav-havel/`. Účastníci, kteří mají hlavní článek, sdílejí tento jediný detail; samostatné životopisy na `/lide/jmeno/` byly sloučeny. Cloudflare `_redirects` zajišťuje trvalá přesměrování starých adres; Astro vytváří také přesměrovací stránky s `noindex` pro lokální náhled. Sitemap obsahuje pouze obsahové adresy.

Detaily obsahují fotografii, zelený blok rostliny, blok osobnosti a zdroje. Přehledné údaje předcházejí textu. Data narození a úmrtí, místa a doložené úspěchy jsou v Markdown metadatech účastníků a v JSON-LD; nedoložené údaje se nezobrazují. Patička odkazuje na roky výsadby vzestupně a pod nimi na typy osobností.
