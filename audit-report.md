# AI Search Retrieval — Phase 0 Audit Report

**Property:** alliancehandymanpros.com
**Run:** 2026-08-06, against the actual codebase (not external fetches)
**Purpose:** Re-baseline the AI Search Retrieval Plan. The plan's Section 4 (Current State) was assembled from outside fetches of a much older site. This report corrects it against ground truth so nobody builds from false premises.

---

## Headline: the site is far healthier than the plan assumed

The plan expected a nearly empty site (no blog, no FAQs, no location pages, http internal links, likely no schema). The live site is **166 pages** with a real article corpus, FAQ + schema on almost every page, 25 towns covered, clean HTTPS internal linking, and static server-rendered HTML. **Phases 1, 2, and 4 target problems that are already solved.** The genuine work is a retrieval-grade *refactor* plus net-new instrumentation, adapted for static GitHub Pages hosting.

---

## Findings by Phase 0 item

### 1. robots.txt
Present and served (200). Contents:
```
User-agent: *
Allow: /
Sitemap: https://www.alliancehandymanpros.com/sitemap.xml
```
- **No `Disallow` affecting any AI crawler.** `* Allow: /` permits every retrieval and training bot (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, etc.).
- Gap vs plan Appendix A: no *explicit* per-bot Allow blocks. Not required (the wildcard already allows them), but the explicit version is a cheap, self-documenting upgrade and lets us drop `Disallow: /api/`… except there is no `/api/` on a static site (see hosting note).

### 2. sitemap.xml
- **166 URLs** — exactly matches the live page count. No orphans, no missing pages.
- `lastmod` values are real and accurate (spread across 2026-04-12 → 2026-08-03, reflecting actual build dates). Not spoofed.
- Referenced from robots.txt ✓. Valid XML ✓.

### 3. JSON-LD (homepage + 2 service pages)
All present, all parse:
- `/` → **HomeAndConstructionBusiness** (with aggregateRating, areaServed, makesOffer, openingHoursSpecification, geo, sameAs)
- `/tv-mounting-connecticut/` → **BreadcrumbList, Service, FAQPage**
- `/grab-bar-installation/` → **BreadcrumbList, Service, FAQPage**
- Sitewide: **161 pages carry FAQPage**, 38 carry aggregateRating. **0 invalid JSON-LD blocks across all 166 pages.**
- Contradicts plan 4.3 ("no FAQ anywhere") and the "likely no schema" note.

### 4. JavaScript-dependency
- **Static site. Nothing is JS-gated.** Homepage raw HTML (no JS) contains **1,116 visible words**; body copy, FAQs, and schema are all in the initial HTML.
- This is the single most important retrieval property and the site already passes it cleanly. AI fetchers that don't run JS see everything.

### 5. Response headers / TTFB
- Homepage: **HTTP 200, TTFB ~66ms, 0 redirects.** `server: GitHub.com`, Fastly edge cache.
- **No bot-mitigation, no cookie wall, no challenge page.** Nothing blocks a crawler.

### 6. `http://` internal links
- **Count: 0.** There are **3,625 root-relative links** (`href="/..."`), which inherit the page's scheme.
- **Plan claim 4.1 ("protocol mismatch on every internal link") is false.** Phase 1 as written is unnecessary.
- **However** there is a real, smaller protocol issue at the edge (see item 7).

### 7. Redirect chains
- `https://www.alliancehandymanpros.com/` → **200, clean, zero redirects.** (The canonical host is healthy.)
- `https://alliancehandymanpros.com/` (apex) → **301 → `http://www…`** (redirects to HTTP, not HTTPS).
- `http://www.alliancehandymanpros.com/` → **200** (served directly; does NOT upgrade to HTTPS).
- **Root cause: GitHub Pages "Enforce HTTPS" is OFF.** This is the *actual* protocol-hygiene gap — not internal links. Fix is a one-checkbox setting in the repo's Pages settings, not a code change or a "redirect rule" (GitHub Pages has no server config to write one). Low effort, worth doing.

### 8. llms.txt
- **`/llms.txt` → 404.** **`/llm.txt` → 200** (present, current — rebuilt 2026-08-03 to match the live site: all services, 25-town area, hours, pricing).
- The plan (and the emerging convention) uses the plural `llms.txt`. Trivial fix: add `llms.txt` as a copy/alias of the existing `llm.txt`.

### 9. Page inventory (all 166 pages)
- **Word counts:** min 164, median **1,022**, max 2,593. Only **1 page under 300 visible words**: `/services/` (164w, a thin legacy hub).
- Every page has exactly one H1. Full table in Appendix A.
- **Retrieval gap (not a thinness gap):** H1s are **statements, not questions** — e.g. "Professional TV Mounting in Stamford, CT," not "How much does TV mounting cost in Stamford?" The plan's Appendix B wants the H1 to *be the query*. This is the core refactor finding: the content exists and is substantial, but it is structured for classic SEO, not for chunk retrieval.
- Thinnest content pages (candidates for expansion or the retrieval-refactor first): `/services/` (164w), then the TV-town pages (`stamford` 760w, `new-canaan` 785w, `westport` 817w).

### 10. Town coverage (plan claimed 12 towns, 0 pages)
- **25 distinct towns have at least one page** (not 12, and not zero): 20 Fairfield County CT (Greenwich, Cos Cob, Old Greenwich, Riverside, Rowayton, Darien, New Canaan, Norwalk, Stamford, Westport, Weston, Wilton, Fairfield, Trumbull, Shelton, Monroe, Easton, Redding, Ridgefield) + 6 Westchester NY (White Plains, Rye, Scarsdale, Larchmont, Mamaroneck, Harrison).
- **Plan claim 4.4 is false.** Phase 4 (build location pages) is done. The refactor question is whether these pages carry the retrieval structure (answer block, question H1, one genuine local fact), not whether they exist.

### 11. Booking widget URL
- `https://widget.zenbooker.com/book/allaincehandymanpros` → **HTTP 200.**
- The `allaincehandymanpros` "typo" is the **real Zenbooker account slug**, not a 404. **Do not change it** — it would break every booking CTA on the site. Plan correctly flagged this as verify-first.

---

## Two data-consistency issues (independent of retrieval, fix regardless)

1. **Review count conflict.** aggregateRating schema on 38 pages + `llm.txt` say **17**; the live badge + owner-edited kits say **9**. Pick the true current number and make it consistent everywhere (schema, llm.txt, kits). Google flags rating markup that contradicts the visible/GBP count. The plan's "do not inflate, mark up accurately or not at all" is exactly right.
2. **Hours conflict.** Site schema + `llm.txt` say Mon–Sat 8–6, Sun by request; GBP + kits say every day 8am–11pm. One source of truth.

---

## Hosting reality check (affects several later phases)

**AHP is static GitHub Pages** (CNAME present, no `package.json`, no build step, `server: GitHub.com`). This breaks parts of the plan written for a framework/server host:

| Plan phase | Issue on static GitHub Pages | Adaptation |
|---|---|---|
| 1.2 "add a redirect rule, one hop" | No server config / .htaccess on GH Pages | Use the "Enforce HTTPS" toggle; apex handled by GitHub |
| 7 Linter "fails the build" | There is no build | Run as a **pre-commit hook** or **GitHub Action** on push |
| 8.1 Server-log crawler parsing | **GitHub Pages exposes no access logs** | Not possible as-is; needs Cloudflare in front, or rely on Bing/GSC crawl stats + referral tracking |
| robots `Disallow: /api/` | There is no `/api/` | Drop it |

(For contrast, ACJR and AMS are Next.js/Vercel where all of the above fits natively — this plan may have been drafted with one of those in mind.)

---

## Corrected scope: what is DONE vs what is REAL work

**Already done (skip or downgrade to spot-check):**
- Phase 1 protocol fix — internal links already HTTPS/relative (0 http links). Only the Enforce-HTTPS toggle remains.
- Phase 2 FAQ blocks — 161 pages already have server-rendered FAQ + FAQPage schema.
- Phase 4 location pages — 25 towns already covered.
- Phase 6 schema layer — HomeAndConstructionBusiness / Service / FAQPage / BreadcrumbList / aggregateRating already sitewide and valid.

**The genuine, high-value work (this is where to spend):**
1. **Retrieval-grade refactor of existing pages (plan's real Phase 3 + Appendix B).** The content is here but structured for blue-links: question-form H1s, a 40–75 word answer block immediately after each H1, decapitation-resistant sections, a comparison table per page. Start with the highest-intent, thinnest pages.
2. **Guides corpus (Phase 5).** The 29 existing blog posts are service/topic articles; the plan's cost/how-to/safety guides (TV cost by size+wall, above-fireplace heat, grab-bar placement to ADA) are a real gap and high-intent. Requires author name/role + real pricing + real standards citations — do not invent.
3. **Instrumentation (Phase 8), adapted.** Add `llms.txt` alias, IndexNow, Bing Webmaster Tools, and AI-referral tracking in GA4. Skip server-log parsing until/unless a log source exists.
4. **Citation baseline + measurement (Phase 9).** Run the 10 sample queries against ChatGPT/Claude/Perplexity now to establish the before. We have nothing like this and it is the cleanest proof of impact.
5. **Linter (Phase 7) as a GitHub Action**, gating new pages so the corpus can't be built wrong.
6. **Fix the two data conflicts** (review count, hours) and the **Enforce-HTTPS toggle**.

**Recommended next gate:** confirm the true review count + hours, supply the guide author name/role and any missing prices, then start the retrieval refactor on the top-intent pages (TV mounting cost, above-fireplace, grab-bar placement) as the pilot before rolling across all 166.

---

## Appendix A — Full page inventory (URL · words · H1)

*Ordered by URL. Word count is total visible text including ~120–150 words of nav/footer/sticky-bar boilerplate, so subtract that for true content depth.*

| URL | Words | H1 |
|---|---|---|
| `/` | 1116 | The Home Service Pros for Fairfield County |
| `/aging-in-place-darien-ct/` | 847 | Aging in Place in Darien, CT |
| `/aging-in-place-easton-ct/` | 950 | Aging in Place in Easton, CT |
| `/aging-in-place-fairfield-ct/` | 910 | Aging in Place in Fairfield, CT |
| `/aging-in-place-greenwich-ct/` | 853 | Aging in Place in Greenwich, CT |
| `/aging-in-place-harrison-ny/` | 898 | Aging in Place in Harrison, NY |
| `/aging-in-place-larchmont-ny/` | 922 | Aging in Place in Larchmont, NY |
| `/aging-in-place-mamaroneck-ny/` | 897 | Aging in Place in Mamaroneck, NY |
| `/aging-in-place-monroe-ct/` | 942 | Aging in Place in Monroe, CT |
| `/aging-in-place-new-canaan-ct/` | 948 | Aging in Place in New Canaan, CT |
| `/aging-in-place-norwalk-ct/` | 920 | Aging in Place in Norwalk, CT |
| `/aging-in-place-partners/` | 1875 | A Grab Bar and Home Safety Installer You Can Refer With Confidence |
| `/aging-in-place-redding-ct/` | 948 | Aging in Place in Redding, CT |
| `/aging-in-place-ridgefield-ct/` | 936 | Aging in Place in Ridgefield, CT |
| `/aging-in-place-rye-ny/` | 925 | Aging in Place in Rye, NY |
| `/aging-in-place-scarsdale-ny/` | 936 | Aging in Place in Scarsdale, NY |
| `/aging-in-place-shelton-ct/` | 934 | Aging in Place in Shelton, CT |
| `/aging-in-place-stamford-ct/` | 937 | Aging in Place in Stamford, CT |
| `/aging-in-place-trumbull-ct/` | 931 | Aging in Place in Trumbull, CT |
| `/aging-in-place-weston-ct/` | 929 | Aging in Place in Weston, CT |
| `/aging-in-place-westport-ct/` | 853 | Aging in Place in Westport, CT |
| `/aging-in-place-wilton-ct/` | 930 | Aging in Place in Wilton, CT |
| `/aging-in-place/` | 1659 | Your Parent Should Stay Home.We Make That Possible. |
| `/blog/` | 1209 | Guides and Tips for Fairfield County Homeowners |
| `/blog/aging-in-place-home-modifications-connecticut/` | 2593 | How to Make a Connecticut Home Safe for an Aging Parent (Before Something Goes Wrong) |
| `/blog/baby-proofing-checklist-connecticut/` | 2078 | Baby Proofing Checklist Connecticut: Room by Room Before Your Baby Crawls |
| `/blog/commercial-bulb-battery-service-fairfield-county/` | 2121 | Commercial Bulb &amp; Battery Service in Fairfield County CT |
| `/blog/decorative-grab-bars-fairfield-county-ct/` | 2199 | Grab Bars That Don't Look Like a Hospital: Moen, Delta &amp; Kohler Options for Fairfield County Homes |
| `/blog/grab-bar-installation-bronx-ny/` | 1891 | Grab Bar Installation in the Bronx: Riverdale, Pelham Parkway, and Beyond |
| `/blog/grab-bar-installation-brooklyn-ny/` | 2393 | Grab Bar Installation in Brooklyn: Why Brownstone Bathrooms Need a Different Approach |
| `/blog/grab-bar-installation-condo-coop-westchester/` | 1971 | Grab Bar Installation in Westchester Condos and Co-ops: Navigating the Rules |
| `/blog/grab-bar-installation-cost-connecticut/` | 1824 | How Much Does Grab Bar Installation Cost in Connecticut? (2026) |
| `/blog/grab-bar-installation-cost-westchester-ny/` | 1873 | How Much Does Grab Bar Installation Cost in Westchester NY? (2026) |
| `/blog/grab-bar-installation-mistakes/` | 2349 | 5 Grab Bar Installation Mistakes That Cause Bars to Fail (And What to Do Instead) |
| `/blog/grab-bar-installation-nyc-apartments/` | 1991 | Grab Bar Installation in NYC Apartments: What Co-op and Condo Boards Actually Require |
| `/blog/grab-bar-installation-queens-ny/` | 1876 | Grab Bar Installation in Queens: Flushing, Jamaica, Forest Hills, and Beyond |
| `/blog/grab-bar-installation-westchester-ny/` | 1974 | Grab Bar Installation in Westchester NY |
| `/blog/grab-bars-on-tile-walls-connecticut/` | 2344 | Can Grab Bars Be Installed on Tile Walls? (Yes. Here's Exactly How) |
| `/blog/high-ceiling-light-bulb-replacement/` | 2321 | How to Change a Light Bulb in a High or Vaulted Ceiling |
| `/blog/how-many-smoke-detectors-connecticut/` | 1957 | How Many Smoke Detectors Does a Connecticut Home Need? |
| `/blog/ikea-furniture-assembly-connecticut/` | 1715 | IKEA Furniture Assembly Connecticut: What Makes It Hard and Why a Pro Is Worth It |
| `/blog/new-home-handyman-checklist-connecticut/` | 1415 | New Home Handyman Checklist: What to Book in Your First 30 Days in Fairfield County |
| `/blog/parent-home-from-hospital-bathroom-safety/` | 2243 | Your Parent Just Got Home from the Hospital — Make the Bathroom Safe Before They Walk In |
| `/blog/picture-hanging-mirror-installation-connecticut/` | 1708 | Picture Hanging and Mirror Installation in Connecticut: Getting It Right on Plaster and Drywall |
| `/blog/samsung-frame-tv-mounting-connecticut/` | 1866 | Samsung Frame TV Mounting in Connecticut: What to Know Before You Book |
| `/blog/smoke-detector-beeping-after-battery-change/` | 2299 | Smoke Detector Still Beeping After Battery Change? |
| `/blog/smoke-detector-chirping-3am/` | 2303 | Why Is My Smoke Detector Chirping at 3am? |
| `/blog/tv-mounting-above-fireplace-connecticut/` | 1935 | TV Mounting Above Fireplace Connecticut: Heat, Masonry, Wires, and Viewing Angle |
| `/blog/tv-mounting-height-connecticut/` | 2059 | How High Should You Mount Your TV? The Connecticut Homeowner's Guide |
| `/blog/tv-mounting-plaster-walls-connecticut/` | 1826 | Mounting a TV on Plaster Walls in Connecticut: What Actually Works |
| `/blog/tv-wire-concealment-connecticut/` | 1365 | How to Hide TV Wires in Connecticut: In-Wall Routing vs. Surface Raceway |
| `/blog/wayfair-furniture-assembly-connecticut/` | 2124 | Wayfair Delivered It. Now What? Furniture Assembly in Fairfield County, CT |
| `/blog/where-to-install-grab-bars-bathroom/` | 1952 | Where to Install Grab Bars in Your Bathroom: A Room-by-Room Guide |
| `/bulb-and-battery/` | 1178 | Bulbs In. Detectors Working. |
| `/childproofing-darien-ct/` | 880 | Childproofing in Darien, CT |
| `/childproofing-easton-ct/` | 996 | Childproofing in Easton, CT |
| `/childproofing-fairfield-ct/` | 933 | Childproofing in Fairfield, CT |
| `/childproofing-greenwich-ct/` | 890 | Childproofing in Greenwich, CT |
| `/childproofing-harrison-ny/` | 934 | Childproofing in Harrison, NY |
| `/childproofing-larchmont-ny/` | 982 | Childproofing in Larchmont, NY |
| `/childproofing-mamaroneck-ny/` | 941 | Childproofing in Mamaroneck, NY |
| `/childproofing-monroe-ct/` | 1008 | Childproofing in Monroe, CT |
| `/childproofing-new-canaan-ct/` | 982 | Childproofing in New Canaan, CT |
| `/childproofing-norwalk-ct/` | 940 | Childproofing in Norwalk, CT |
| `/childproofing-redding-ct/` | 1013 | Childproofing in Redding, CT |
| `/childproofing-ridgefield-ct/` | 1001 | Childproofing in Ridgefield, CT |
| `/childproofing-rye-ny/` | 1002 | Childproofing in Rye, NY |
| `/childproofing-scarsdale-ny/` | 992 | Childproofing in Scarsdale, NY |
| `/childproofing-shelton-ct/` | 969 | Childproofing in Shelton, CT |
| `/childproofing-stamford-ct/` | 889 | Childproofing in Stamford, CT |
| `/childproofing-trumbull-ct/` | 982 | Childproofing in Trumbull, CT |
| `/childproofing-weston-ct/` | 948 | Childproofing in Weston, CT |
| `/childproofing-westport-ct/` | 884 | Childproofing in Westport, CT |
| `/childproofing-wilton-ct/` | 981 | Childproofing in Wilton, CT |
| `/childproofing/` | 1567 | Your Home Is Not Baby-Safe Yet.We Fix That in One Visit. |
| `/commercial-services-fairfield-county/` | 1895 | One Call For Every Building Task |
| `/for-designers/` | 1508 | Your Install Day Crew |
| `/for-realtors/` | 2062 | Listing Photo Ready, New Owner Move In Ready |
| `/furniture-assembly-darien-ct/` | 866 | Furniture Assembly Darien CT |
| `/furniture-assembly-easton-ct/` | 950 | Furniture Assembly Easton CT |
| `/furniture-assembly-fairfield-ct/` | 920 | Furniture Assembly Fairfield CT |
| `/furniture-assembly-greenwich-ct/` | 878 | Furniture Assembly Greenwich CT |
| `/furniture-assembly-harrison-ny/` | 935 | Furniture Assembly Harrison NY |
| `/furniture-assembly-larchmont-ny/` | 936 | Furniture Assembly Larchmont NY |
| `/furniture-assembly-mamaroneck-ny/` | 922 | Furniture Assembly Mamaroneck NY |
| `/furniture-assembly-monroe-ct/` | 942 | Furniture Assembly Monroe CT |
| `/furniture-assembly-new-canaan-ct/` | 960 | Furniture Assembly New Canaan CT |
| `/furniture-assembly-norwalk-ct/` | 935 | Furniture Assembly Norwalk CT |
| `/furniture-assembly-redding-ct/` | 982 | Furniture Assembly Redding CT |
| `/furniture-assembly-ridgefield-ct/` | 958 | Furniture Assembly Ridgefield CT |
| `/furniture-assembly-rye-ny/` | 931 | Furniture Assembly Rye NY |
| `/furniture-assembly-scarsdale-ny/` | 937 | Furniture Assembly Scarsdale NY |
| `/furniture-assembly-shelton-ct/` | 934 | Furniture Assembly Shelton CT |
| `/furniture-assembly-stamford-ct/` | 878 | Furniture Assembly Stamford CT |
| `/furniture-assembly-trumbull-ct/` | 946 | Furniture Assembly Trumbull CT |
| `/furniture-assembly-weston-ct/` | 962 | Furniture Assembly Weston CT |
| `/furniture-assembly-westport-ct/` | 878 | Furniture Assembly Westport CT |
| `/furniture-assembly-wilton-ct/` | 915 | Furniture Assembly Wilton CT |
| `/furniture-assembly/` | 1239 | Furniture Assembly Done Right |
| `/grab-bar-installation-darien-ct/` | 1348 | Grab Bar Installation in Darien, CT |
| `/grab-bar-installation-easton-ct/` | 1416 | Grab Bar Installation in Easton, CT |
| `/grab-bar-installation-fairfield-ct/` | 1326 | Grab Bar Installation in Fairfield, CT |
| `/grab-bar-installation-greenwich-ct/` | 1362 | Grab Bar Installation in Greenwich, CT |
| `/grab-bar-installation-harrison-ny/` | 1576 | Grab Bar Installation in Harrison, NY |
| `/grab-bar-installation-larchmont-ny/` | 1565 | Grab Bar Installation in Larchmont, NY |
| `/grab-bar-installation-mamaroneck-ny/` | 1574 | Grab Bar Installation in Mamaroneck, NY |
| `/grab-bar-installation-monroe-ct/` | 1424 | Grab Bar Installation in Monroe, CT |
| `/grab-bar-installation-new-canaan-ct/` | 1364 | Grab Bar Installation in New Canaan, CT |
| `/grab-bar-installation-norwalk-ct/` | 1335 | Grab Bar Installation in Norwalk, CT |
| `/grab-bar-installation-redding-ct/` | 1303 | Grab Bar Installation in Redding, CT |
| `/grab-bar-installation-ridgefield-ct/` | 1307 | Grab Bar Installation in Ridgefield, CT |
| `/grab-bar-installation-rye-ny/` | 1604 | Grab Bar Installation in Rye, NY |
| `/grab-bar-installation-scarsdale-ny/` | 1575 | Grab Bar Installation in Scarsdale, NY |
| `/grab-bar-installation-shelton-ct/` | 1423 | Grab Bar Installation in Shelton, CT |
| `/grab-bar-installation-stamford-ct/` | 1386 | Grab Bar Installation in Stamford, CT |
| `/grab-bar-installation-trumbull-ct/` | 1435 | Grab Bar Installation in Trumbull, CT |
| `/grab-bar-installation-weston-ct/` | 1312 | Grab Bar Installation in Weston, CT |
| `/grab-bar-installation-westport-ct/` | 1367 | Grab Bar Installation in Westport, CT |
| `/grab-bar-installation-wilton-ct/` | 1325 | Grab Bar Installation in Wilton, CT |
| `/grab-bar-installation/` | 2253 | Your Parent's BathroomShouldn't Be a Hazard. |
| `/ikea-assembly-darien-ct/` | 944 | IKEA Assembly Darien CT |
| `/ikea-assembly-easton-ct/` | 1046 | IKEA Assembly Easton CT |
| `/ikea-assembly-fairfield-ct/` | 999 | IKEA Assembly Fairfield CT |
| `/ikea-assembly-greenwich-ct/` | 949 | IKEA Assembly Greenwich CT |
| `/ikea-assembly-harrison-ny/` | 1007 | IKEA Assembly Harrison NY |
| `/ikea-assembly-larchmont-ny/` | 1016 | IKEA Assembly Larchmont NY |
| `/ikea-assembly-mamaroneck-ny/` | 989 | IKEA Assembly Mamaroneck NY |
| `/ikea-assembly-monroe-ct/` | 1022 | IKEA Assembly Monroe CT |
| `/ikea-assembly-new-canaan-ct/` | 1155 | IKEA Assembly New Canaan CT |
| `/ikea-assembly-norwalk-ct/` | 1119 | IKEA Assembly Norwalk CT |
| `/ikea-assembly-redding-ct/` | 1028 | IKEA Assembly Redding CT |
| `/ikea-assembly-ridgefield-ct/` | 1028 | IKEA Assembly Ridgefield CT |
| `/ikea-assembly-rye-ny/` | 1017 | IKEA Assembly Rye NY |
| `/ikea-assembly-scarsdale-ny/` | 1006 | IKEA Assembly Scarsdale NY |
| `/ikea-assembly-shelton-ct/` | 1021 | IKEA Assembly Shelton CT |
| `/ikea-assembly-stamford-ct/` | 942 | IKEA Assembly Stamford CT |
| `/ikea-assembly-trumbull-ct/` | 1016 | IKEA Assembly Trumbull CT |
| `/ikea-assembly-weston-ct/` | 1031 | IKEA Assembly Weston CT |
| `/ikea-assembly-westport-ct/` | 942 | IKEA Assembly Westport CT |
| `/ikea-assembly-wilton-ct/` | 1089 | IKEA Assembly Wilton CT |
| `/ikea-assembly/` | 1352 | IKEA Furniture Assembly Done Right |
| `/pricing/furniture-assembly-cost/` | 1579 | How Much Does Furniture AssemblyCost in Fairfield County? |
| `/pricing/grab-bar-installation-cost/` | 1683 | How Much Does Grab BarInstallation Cost? |
| `/pricing/ikea-assembly-cost/` | 1446 | How Much Does IKEA Assembly Cost in Fairfield County? |
| `/pricing/tv-mounting-cost/` | 1226 | How Much Does TV Mounting Cost in Fairfield County? |
| `/services/` | 164 | Handyman Services & TV Mounting |
| `/services/furniture-assembly/` | 1311 | Furniture Assembly Done Right |
| `/tv-mounting-connecticut/` | 1788 | TV Mounting Connecticut |
| `/tv-mounting-cos-cob-ct/` | 924 | TV Mounting in Cos Cob, CT |
| `/tv-mounting-darien-ct/` | 857 | Professional TV Mounting in Darien, CT |
| `/tv-mounting-greenwich-ct/` | 1060 | TV Mounting in Greenwich, CT |
| `/tv-mounting-harrison-ny/` | 1259 | TV Mounting Pros in Harrison, NY |
| `/tv-mounting-larchmont-ny/` | 1262 | TV Mounting Pros in Larchmont, NY |
| `/tv-mounting-mamaroneck-ny/` | 1205 | TV Mounting Pros in Mamaroneck, NY |
| `/tv-mounting-new-canaan-ct/` | 785 | Professional TV Mounting in New Canaan, CT |
| `/tv-mounting-norwalk-ct/` | 889 | TV Mounting in Norwalk, CT |
| `/tv-mounting-old-greenwich-ct/` | 946 | TV Mounting in Old Greenwich, CT |
| `/tv-mounting-riverside-ct/` | 930 | TV Mounting in Riverside, CT |
| `/tv-mounting-rowayton-ct/` | 874 | TV Mounting in Rowayton, CT |
| `/tv-mounting-rye-ny/` | 1251 | TV Mounting Pros in Rye, NY |
| `/tv-mounting-scarsdale-ny/` | 1272 | TV Mounting Pros in Scarsdale, NY |
| `/tv-mounting-stamford-ct/` | 760 | Professional TV Mounting in Stamford, CT |
| `/tv-mounting-weston-ct/` | 1088 | TV Mounting Pros in Weston, CT |
| `/tv-mounting-westport-ct/` | 817 | Professional TV Mounting in Westport, CT |
| `/tv-mounting-white-plains-ny/` | 1164 | TV Mounting Pros in White Plains, NY |
| `/tv-mounting-wilton-ct/` | 871 | TV Mounting in Wilton, CT |

*Total: 166 pages.*
