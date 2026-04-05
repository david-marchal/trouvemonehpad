# France Retirement Home Comparison Market

_Updated: 2026-04-04_

## Bottom line

The French market is split between:

- a trusted but basic public portal (`pour-les-personnes-agees.gouv.fr`),
- private broker-style players that monetize via advisor-led placement,
- SEO-driven directories with weaker decision support.

NestRate's opening is not "another directory." It is a trusted comparison layer built on official data, clear monthly cost, care-fit matching, and family workflow. The fastest monetization path is likely a hybrid: free comparison for families, paid qualified introductions where appropriate, and operator SaaS for vacancy/profile management.

## 1. Existing players in France

| Player | What they do well | What they do poorly | Implication for NestRate |
| --- | --- | --- | --- |
| `pour-les-personnes-agees.gouv.fr` | Strong trust, official directory, prices, aid explanations, comparison tool, reste-a-charge simulator. | Product feels administrative; limited ranking/synthesis; no collaboration workflow; no live availability layer. | Benchmark for trust and data coverage. NestRate should win on synthesis and usability, not on "more official" branding. |
| Cap Retraite | Strong SEO, fast human assistance, broad directory, clear urgency handling. | Feels broker-led before it feels product-led; self-serve comparison depth is limited; neutrality can be questioned when assistance is the main funnel. | Confirms demand for high-intent placement help, but leaves room for a more trusted self-serve product. |
| Retraite Plus | High-touch advisors, "free" search support, explicit availability/help messaging. | Same broker trade-off: strong callback funnel, weaker transparent comparison surface, likely less credible as a neutral ranking product. | Good benchmark for conversion operations, not for trust-first UX. |
| Papyhappy | Independent positioning, resident/family reviews, broader senior-living discovery experience. | Review coverage is uneven; less official-data depth than a product anchored in FINESS/HAS/CNSA; broader scope can dilute EHPAD decision support. | Good signal that reassurance and reviews matter, but official data should stay the backbone. |
| Logement-seniors.com | Wide directory coverage, many landing pages, good long-tail SEO footprint. | Mostly a directory/classified experience; weak normalization of quality and care-fit; limited decision support beyond browsing. | Commodity listings are not enough. NestRate needs better comparison logic, not just more pages. |

### Competitive read

- The public sector owns trust.
- Private incumbents mostly own lead capture and human assistance.
- No player appears to combine official quality data, normalized pricing, care-fit filters, and family collaboration in one clean product.
- If NestRate copies broker UX too early, it gives up its best differentiation.

## 2. Publicly available data sources

| Source | What it gives | Why it matters | Main caveats |
| --- | --- | --- | --- |
| `FINESS` establishments extract | Official directory: name, FINESS IDs, address, ownership/legal status, contacts, category. | Identity graph and national directory backbone. | Legacy export format is being retired in summer 2026; migration risk needs active management. |
| `FINESS` equipment / ESSMS extract | Capacity and activity rows. | Best public source for bed counts and supply sizing. | Technical to join; messy for product use without ETL. |
| `HAS open_data_echelle_qualite` | Published ESSMS evaluations, score/grade, publication date, evaluator. | Best national official quality signal for comparison and trust. | Coverage is partial and publication cadence is uneven. |
| `CNSA` EHPAD price export | Accommodation prices and GIR dependence tariffs. | Essential for showing realistic monthly cost and benchmarking homes within a department. | Current public export is partial, not full-market. |
| `pour-les-personnes-agees.gouv.fr` | Public-facing directory, compare flow, aid explanations, reste-a-charge logic. | Useful benchmark for UX and for QA against official public presentation. | Better treated as a reference layer than as source-of-truth ETL. |
| `DREES EHPA` survey and analyses | Market size, occupancy, resident mix, stay patterns, admissions/exits, sector structure. | Best source for market sizing and prioritization. | Aggregate, not establishment-level. |
| `ARS` regional reports, inspections, injunctions, sanctions, observatories | Local risk and quality signals not visible in national comparison products. | High-value trust layer if curated well. | Highly fragmented by region and not standardized nationally. |

### Recommended data stack for V1

1. `FINESS` for identity and location.
2. `FINESS equipment` for capacity.
3. `HAS` for quality and recency.
4. `CNSA` for price transparency.
5. `ARS` signals as a manually curated "watchlist/risk" layer, not a national automated ingestion project on day one.

### Data-risk note

The current NestRate importer still depends on the legacy FINESS extracts published on data.gouv. Those pages now state that generation on the old FINESS platform stops in summer 2026. This is not a minor maintenance issue; it should be treated as a roadmap item now.

## 3. What families actually search for

Families are usually not asking for "the best EHPAD" in the abstract. They are trying to reduce a stressful multi-variable decision quickly.

### Core decision criteria

1. **Distance and visitability**  
   Close enough for frequent visits, ideally near family or the previous home.
2. **True monthly out-of-pocket cost**  
   Not just list price. Families need accommodation price, dependence tariff, and likely aid impact.
3. **Care fit**  
   Alzheimer's support, PASA/UHR, nursing intensity, dependency level, temporary vs permanent stay.
4. **Trust and quality**  
   HAS score/grade, inspection history, operator reputation, cleanliness, staffing, management type.
5. **Availability and speed**  
   Can the home accept a resident soon enough, especially after hospital discharge or a crisis at home.
6. **Daily-life fit**  
   Single room, food, activities, outdoor space, atmosphere, visiting conditions, ability to personalize the room.

### Product implications

- Search should start with `location + budget + care profile + urgency`.
- Result cards should show `distance + monthly cost + care tags + HAS quality + contactability`.
- Comparison should be side-by-side and shareable with siblings/relatives.
- Notes, shortlist state, and follow-up tracking matter because the buyer is often a family group, not one user.
- Availability is strategically valuable because official public data is weak there; this is a good candidate for NestRate's first proprietary dataset.

## 4. Monetization models

| Model | Upside | Risk | Recommendation |
| --- | --- | --- | --- |
| Qualified introductions / lead generation to homes | Fastest path to revenue; market already proves willingness to pay for placement support. | Can quickly erode trust if ranking becomes pay-to-play. | Good early revenue model, but keep core ranking neutral and label sponsored exposure clearly. |
| Operator subscription (CRM, vacancy updates, inquiry management, richer profile pages) | Recurring revenue, better data freshness, better strategic alignment with product. | Requires real operator workflow value; visibility alone is not enough. | Strong medium-term model and likely more defensible than pure brokering. |
| Premium listing / sponsored placement | Easy to launch. | Highest trust risk and least differentiated. | Use only as a small add-on, never the core business model. |
| Family subscription (monitoring, care coordination, document hub) | Real need may exist after placement. | Likely too small and too late in the journey to be the initial wedge. | Explore only after search/placement traction exists. |
| Advertising | Simple. | Low-quality revenue and brand damage. | Avoid. |

### Recommended sequence

1. Launch a free family comparison product.
2. Monetize qualified introductions where NestRate adds real matching value.
3. Add operator software for vacancy/status updates and lead handling.
4. Test post-placement family subscriptions only if users keep returning after the search journey.

## 5. Market size estimate for France

### Market facts

- NestRate's current official-data import contains **7,399 EHPAD** and **588,275 beds** from March 2026 `FINESS` extracts, with **4,154** establishments currently linked to a HAS quality grade.
- DREES reports roughly **573,100 residents in EHPAD** at year-end 2023, with nursing-home occupancy around **94 residents per 100 places**.
- CNSA's latest public price report shows an average monthly accommodation price of about **EUR2,164** in fully or partially ASH-authorized homes versus about **EUR3,128** in non-ASH homes.

### What that means

- Accommodation spend alone implies a rough EHPAD consumer spend range of **EUR14.9B to EUR21.5B per year** before adding dependence tariffs and extras.
- This is a large underlying care market, but the comparison/placement revenue pool is much smaller than the care spend itself.

### Addressable revenue ranges for NestRate

| Model | Simple sizing logic | Revenue range |
| --- | --- | --- |
| Lead generation | Assume roughly 25% to 35% annual turnover on occupied stock, and `EUR800-EUR2,500` monetization per successful placement | Rough market pool of **EUR115M-EUR501M/year** across the category |
| Operator SaaS | `7,399 homes x EUR99-EUR299/month` | **EUR8.8M-EUR26.5M ARR** market ceiling |
| Family subscription | `1%-3%` of current residents at `EUR10/month` | **EUR0.7M-EUR2.1M ARR** ceiling |

These are not forecasts for NestRate. They are sanity-check ranges showing that:

- a lead-assisted marketplace can be meaningful if trust is preserved,
- operator SaaS can become a real second engine,
- a subscription-only family wedge is probably too small to be the primary business.

## Product decisions NestRate can make now

1. Build around **trust-first comparison**, not around early callback capture.
2. Make the first search answer four questions clearly: **where, how much, what care fit, and can we trust it**.
3. Keep the national data graph focused on **FINESS + FINESS equipment + HAS + CNSA**.
4. Start collecting **availability and operator responsiveness** as the first proprietary moat.
5. Plan the **FINESS migration** immediately so data ingestion does not break in 2026.
6. Monetize in a way that preserves ranking credibility; users must believe the results are not bought.

## Source notes

- Official public portal and comparator: `pour-les-personnes-agees.gouv.fr`
- `FINESS` establishment and ESSMS equipment extracts on `data.gouv.fr`
- `HAS` open dataset: `open_data_echelle_qualite`
- `CNSA` EHPAD price export and 2026 price report
- `DREES` EHPA 2023 publications and 2023-2024 sector analysis
- `ARS` regional inspection / observatory publications
- NestRate internal reference: `docs/ehpad-data.md`
