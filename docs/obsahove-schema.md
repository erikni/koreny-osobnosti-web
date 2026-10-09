# Obsahové schéma

Ukázky představují navržené schéma, které se při implementaci převede do validačních pravidel Astro. Všechna ID jsou stabilní a nezávislá na jazyku. ID osoby je jiné než číslo oficiální položky projektu.

| Záznam | Povinné údaje | Důležité vazby |
|---|---|---|
| Osoba | id, name, sort_name, category_ids | Biografické zdroje |
| Profil | id, person_id, lang, slug, title, description, status | Přeložený profil stejné osoby |
| Rostlina | id, scientific_name, cultivar, plant_type | Botanické zdroje, lokalizované názvy |
| Výsadba | id, honoree_ids, planter_ids, plant_ids, year, date_precision, participation, source_urls | Oficiální číslo, nejasnosti |
| Fotografie | id, source_url, author, rights_status, alt_cs, alt_en, publication_status | Osoby/výsadba, licence |

Datum může být null. Při známém pouze roce se uloží year a date_precision: year, nikoli umělé datum 1. ledna. Profese jsou pole stabilních ID. Společná výsadba má více honoree_ids; zastoupení zachytí planter_ids. Kategorie, zdroje a názvy rostlin budou při implementaci samostatně validované záznamy.

Vědecký název a kultivar jsou oddělené. Historická tvrzení se ukládají s pramenem jako alternatives, nikoli jako druhá výsadba. Evidence nejasností zůstane zachována i v publikovaném textu.

Ukázky obsahují pouze dvě osobnosti; nejsou importem celého katalogu. Šablona fotografie se nikdy nesmí publikovat jako skutečný snímek.
