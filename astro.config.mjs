import personRoutes from './src/lib/person-routes.json' with {type:'json'};
import { defineConfig } from 'astro/config';
const redirects=Object.fromEntries(Object.entries(personRoutes).flatMap(([id,d])=>[[`/lide/${id}/`,`/${d.cs}/${id}/`],[`/cs/lide/${id}/`,`/${d.cs}/${id}/`],[`/en/participants/${id}/`,`/en/${d.en}/${id}/`]]));
export default defineConfig({redirects,site:'https://www.koreny-osobnosti.cz',output:'static',trailingSlash:'always'});
