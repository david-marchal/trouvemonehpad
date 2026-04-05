# France EHPAD Data Import

NestRate imports French retirement home (`EHPAD`) data from official public sources and stores it in PostgreSQL.

## Sources

- `FINESS Extraction du Fichier des établissements`:
  current registry of establishments, used for the EHPAD directory, addresses, department fields, contact fields, and FINESS identifiers.
- `FINESS Extraction des équipements sociaux et médico-sociaux`:
  current equipment-level capacity rows, used to derive `capacity_total` for EHPAD establishments from active discipline `924` / activity `11` records.
- `HAS open_data_echelle_qualite`:
  official ESSMS evaluation results, filtered to FINESS category `500` and joined on `finess_geo` to attach the latest published HAS quality grade and score.
- `CNSA prix hebergement et tarifs dependance des EHPAD (donnees brutes)`:
  monthly public export of EHPAD accommodation prices and GIR dependency tariffs, joined on `finess_geo`.

## Tables

- `ehpad_establishments`:
  one row per current FINESS EHPAD establishment, enriched with the latest HAS fields when available.
- `ehpad_has_evaluations`:
  one row per imported HAS evaluation for EHPAD establishments.
- `ehpad_pricing`:
  one row per matched CNSA pricing record, storing permanent accommodation prices and GIR 1-2 / 3-4 / 5-6 dependency tariffs.

## Import

Run:

```bash
npm run import:ehpad-fr
```

The script recreates the schema from [db/ehpad_schema.sql](/home/worker/repo/db/ehpad_schema.sql), truncates the EHPAD tables, reloads official source data, and prints imported counts.

Pricing notes:

- CNSA pricing is imported into `ehpad_pricing` and linked to `ehpad_establishments.finess_geo`.
- `accommodation_price_single` and `accommodation_price_double` use the permanent accommodation fields from the CNSA export, falling back to the corresponding aide-sociale variant when the standard permanent field is empty.
- The importer prints both the number of rows found in the CNSA file and the number of rows that matched an existing EHPAD establishment by FINESS number.
