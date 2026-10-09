import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import YAML from 'yaml';
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(path.join(dir,f.name)):f.name.endsWith('.md')?[path.join(dir,f.name)]:[]);
const load=dir=>files(`content/${dir}`).map(file=>({file,data:YAML.parse(fs.readFileSync(file,'utf8').split('---')[1])}));
const entries=load('entries'),people=load('people'),plants=load('plants'),categories=load('categories'),articles=load('articles'),bios=load('biographies');
for(const [name,list] of Object.entries({entries,people,plants,categories,articles,bios}))assert.equal(new Set(list.map(e=>e.data.id)).size,list.length,`${name}: duplicate id`);
assert.equal(entries.length,127);assert.equal(people.length,153);assert.equal(articles.length,254);assert.equal(bios.length,306);assert.equal(entries.filter(e=>e.data.year===null).length,4);
for(const {file,data:d} of entries){assert(plants.some(p=>p.data.id===d.plant_id),`${file}: unknown plant`);assert(categories.some(p=>p.data.id===d.category_id),`${file}: unknown category`);for(const pid of d.person_ids)assert(people.some(p=>p.data.id===pid),`${file}: unknown person`);for(const lang of ['cs','en'])assert.equal(articles.filter(a=>a.data.entry_id===d.id&&a.data.lang===lang).length,1,`${file}: translation`);assert(d.sources.length>0,`${file}: sources`);assert(fs.existsSync(`content/plantings/${d.planting_id}.md`),`${file}: planting`)}
for(const {file,data:d} of people)for(const lang of ['cs','en'])assert.equal(bios.filter(a=>a.data.person_id===d.id&&a.data.lang===lang).length,1,`${file}: biography`);
const rights=JSON.parse(fs.readFileSync('design/public-photo-licenses.json','utf8'));for(const p of Object.values({...rights.portraits,...rights.plants})){assert.equal(p.rights_status,'licensed');assert(p.license&&p.source&&p.author);assert(fs.existsSync('public'+p.src))}
console.log(`Validated ${entries.length} entries, ${people.length} people, ${plants.length} plants, both languages, 4 explicitly unknown years and licensed public photographs.`);
const profiles=load('plant-profiles');
assert.equal(profiles.length,plants.length*2,'Botanical profiles must cover both languages');
assert.equal(new Set(profiles.map(p=>p.data.id)).size,profiles.length,'Duplicate botanical profile');
for(const {file,data:d} of profiles){
 assert(plants.some(p=>p.data.id===d.plant_id),`${file}: unknown plant`);
 assert(['cs','en'].includes(d.lang),`${file}: language`);
 for(const key of ['height','flowering','longevity'])assert(d[key]?.trim(),`${file}: missing ${key}`);
 assert(d.source_urls.length>0,`${file}: missing references`);
 for(const u of d.source_urls)assert.equal(new URL(u).protocol,'https:',`${file}: source URL`);
 const body=fs.readFileSync(file,'utf8').split('---').slice(2).join('---').trim();
 assert(body.split(/\n\s*\n/).length>=3,`${file}: three botanical paragraphs required`);
}
for(const {file,data:d} of plants)for(const lang of ['cs','en'])assert.equal(profiles.filter(p=>p.data.plant_id===d.id&&p.data.lang===lang).length,1,`${file}: botanical translation`);
for(const {file,data:d} of [...bios,...articles])if(d.biography_source){assert.equal(d.text_license,'CC BY-SA 4.0',`${file}: excerpt licence`);assert(d.text_adaptation,`${file}: adaptation attribution`)}
console.log(`Validated ${profiles.length} botanical profiles, references and biography attributions.`);
const entryRoutes=JSON.parse(fs.readFileSync('src/lib/entry-routes.json','utf8'));
assert.equal(Object.keys(entryRoutes).length,entries.length,'Detail route coverage');
for(const {data:d} of entries)for(const lang of ['cs','en'])assert(/^[a-z][a-z-]*$/.test(entryRoutes[d.id]?.[lang]),`${d.id}: invalid ${lang} category route`);
const redirectRules=fs.readFileSync('public/_redirects','utf8').trim().split('\n');
for(const {data:d} of entries)for(const [lang,oldSection] of [['cs','osobnosti'],['en','people']]){
 const target=`${lang==='cs'?'':'/en'}/${entryRoutes[d.id][lang]}/${d.id}/`;
 assert(redirectRules.includes(`/${lang}/${oldSection}/${d.id}/ ${target} 301`),`${d.id}: missing old detail redirect`);
}
console.log('Validated detail route coverage and permanent legacy redirects.');
for(const {file,data:d} of people){
 for(const key of ['birth_date','death_date'])if(d[key]){assert(/^\d{4}-\d{2}-\d{2}$/.test(d[key]),`${file}: ISO date`);assert.equal(new Date(d[key]).toISOString().slice(0,10),d[key],`${file}: invalid date`);assert.equal(Number(d[key].slice(0,4)),d[key==='birth_date'?'birth_year':'death_year'],`${file}: date/year mismatch`)}
 if(d.birth_date&&d.death_date)assert(d.birth_date<d.death_date,`${file}: birth must precede death`);
 if(d.birth_date||d.residence||d.highlights_cs?.length||d.highlights_en?.length)assert(d.facts_source_urls?.length,`${file}: facts need references`);
 if(!d.biography_verified)assert(!d.birth_date&&!d.death_date&&!d.residence,`${file}: unsupported family biography`);
}
console.log('Validated biography dates, years, chronology and sources.');
const personRoutes=JSON.parse(fs.readFileSync('src/lib/person-routes.json','utf8'));
assert.equal(Object.keys(personRoutes).length,people.length,'Participant route coverage');
for(const {data:d} of people){const route=personRoutes[d.id];assert.equal(route.merged,entries.some(e=>e.data.id===d.id));for(const lang of ['cs','en'])assert(/^[a-z][a-z-]*$/.test(route[lang]));for(const [old,lang] of [[`/lide/${d.id}/`,'cs'],[`/cs/lide/${d.id}/`,'cs'],[`/en/participants/${d.id}/`,'en']])assert(redirectRules.includes(`${old} ${lang==='cs'?'':'/en'}/${route[lang]}/${d.id}/ 301`),`${d.id}: biography redirect`)}
console.log('Validated consolidated biography routes and redirects.');
for(const {file,data:d} of people)if(d.official_website){
 // The historical official Pavel Nedvěd site is available only over HTTP.
 assert(d.official_website==='http://www.pavelnedved.cz/home/'||new URL(d.official_website).protocol==='https:',`${file}: official website must use HTTPS or the verified historical Nedvěd URL`);
 assert(d.source_urls.includes(d.official_website),`${file}: official website missing from sources`);
 for(const {file:bioFile,data:bio} of bios.filter(b=>b.data.person_id===d.id))assert(bio.source_urls.includes(d.official_website),`${bioFile}: official website missing from translated sources`);
}
for(const [pid,photo] of Object.entries(rights.portraits))assert.equal(photo.name,people.find(p=>p.data.id===pid)?.data.name,`${pid}: portrait identity`);
assert.equal(fs.readFileSync('src/lib/photos.ts','utf8'),'export const publicPhotos = '+JSON.stringify(rights.portraits,null,2)+';\nexport const plantPhotos = '+JSON.stringify(rights.plants,null,2)+';\n','Public photo definitions must match the licence manifest');
console.log(`Validated ${Object.keys(rights.portraits).length} portrait identities, photo manifest and ${people.filter(p=>p.data.official_website).length} official websites in both languages.`);
