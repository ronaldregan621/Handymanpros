# Alliance Handyman Pros — SEO and Content To-Do List

Last updated: 2026-08-03

---

## CLEANUP / DATA CONSISTENCY (found during the 2026-08-03 overhaul, reconcile these)

- [ ] **Reconcile the Google review COUNT across the site.** The aggregateRating schema added to 38 pages on 2026-08-02, and `llm.txt`, use `reviewCount` **17**. But the live homepage badge and the owner-edited GBP + citations kits now say **9**. Pick the true current number, then update it in one pass: the aggregateRating block on every page (grep `"reviewCount": "17"`), `llm.txt`, and the kits. Inconsistent rating markup vs the visible/GBP count is exactly what Google flags. *(The 4.9 rating value is fine, only the count is in question.)*
- [ ] **Reconcile HOURS.** The site schema + `llm.txt` say Monday to Saturday 8am to 6pm, Sun by request. The GBP + owner-edited kits say **every day 8am to 11pm**. If GBP (8am to 11pm daily) is correct, update the site openingHoursSpecification schema, the utility bar copy, and `llm.txt` to match. If the site is correct, fix GBP. One source of truth. *(Same class of conflict flagged on ACJR: site 24/7 vs GBP.)*
- [ ] **No-dashes sweep on the older aging-in-place pages.** `aging-in-place-greenwich-ct`, `-darien-ct`, `-westport-ct` still use hyphenated visible copy ("same-day", "ADA-compliant") that predates the no-dashes standard. Every page built since is clean; sweep these three to match.

---

## AI SEARCH RETRIEVAL (GEO) — re-scoped from the plan after the 2026-08-06 Phase 0 audit

Full findings in `audit-report.md`. The plan's Section 4 was stale: blog, FAQs, 25-town coverage, sitewide schema, and HTTPS internal links already exist (Phases 1/2/4/6 largely done). Goal is citation in AI answers, not rankings. **Baseline: AHP cited 2 of 10 target queries** (`ai-citation-baseline.md`, 2026-08-06) — only its 2 strongest TV pages; 0/10 on grab bar, IKEA, childproofing, aging in place, and cost/how-to queries. Real work below, in order.

**Owner input needed first (gates the refactor):**
- [ ] Confirm the true **review count** (schema says 17, badge/kits say 9) and **hours** (site Mon-Sat 8-6 vs GBP 8am-11pm) — see the CLEANUP section above. Blocks accurate schema.
- [ ] Provide a **guide author name + role** (real human, for E-E-A-T bylines) and any **missing prices** for the guides. Do not invent either.

**Quick wins (low effort, do now):**
- [ ] **Flip GitHub Pages "Enforce HTTPS" ON** (repo Settings → Pages). Apex currently 301s to `http://` and `http://www` serves 200. Owner action, one checkbox. *(The plan's "http internal links" issue does not exist — 0 found.)*
- [ ] **Add `llms.txt`** as an alias/copy of the current `llm.txt` (the plural is the emerging convention; `llm.txt` already live and accurate).
- [ ] Optionally add explicit per-bot Allow blocks to robots.txt (plan Appendix A). Not required (`* Allow: /` already permits all AI bots); cosmetic/self-documenting.

**The real work (retrieval-grade refactor, highest value):**
- [ ] **Pilot the refactor on 3 top-intent pages first** (TV mounting cost, TV above the fireplace, grab bar placement): question-form H1 (`How much does X cost in <area>?`), a 40 to 75 word answer block immediately after the H1, decapitation-resistant sections (no "it/this/the service" openers), a comparison table per page. Measure, then roll the pattern across the 166.
- [ ] **Build the guides corpus** (plan Phase 5): cost by size+wall, above-fireplace heat question, grab-bar placement to ADA, aging-in-place scope, childproofing checklist. Real standards citations (ADA, CPSC) with outbound links, visible "Last updated", `dateModified` wired to git commit date. Two touch safety (grab bars, childproofing) — cite real numbers, do not improvise.
- [ ] **Retrofit the location + service pages** with the same answer-block + question-H1 pattern (content exists, structure is classic-SEO not chunk-retrieval).

**Instrumentation + measurement (adapted for static GitHub Pages):**
- [ ] **Bing Webmaster Tools** submission (disproportionately important — ChatGPT search leans on Bing's index). Pairs with the Bing Places citation item.
- [ ] **IndexNow** — ping on publish so new/changed pages get picked up fast.
- [ ] **GA4 AI-referral tracking** for chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com.
- [ ] **Re-run the citation baseline at 30 and 90 days** after the refactor ships: `python3 ai_citation_baseline.py <date>`. Add ChatGPT/Gemini engines once those API keys exist (only Perplexity + Anthropic keys today). *(NOTE: plan's Phase 8.1 server-log crawler parsing is NOT possible on GitHub Pages — no access logs. Needs Cloudflare in front or rely on Bing/GSC crawl stats.)*
- [ ] **Retrieval linter as a GitHub Action** (plan Phase 7, adapted — there is no build step to fail): gate new pages on question-H1, answer-block length, decapitation openers, schema presence, thin-content. Put it in before the guides corpus so it can't be built wrong.

---

## OPERATIONS

- [ ] **⚙ INFRA / BILLING — Upgrade Railway to the Hobby plan (~$5/mo) so the data-lake sync keeps running**
  - **Why:** On 2026-06-14 the AHP data-lake sync was moved off the laptop to **Railway** (service `ahp-datalake-sync`, project `gentle-benevolence`) so it survives the Mac sleeping — that was the root cause of the dashboard going stale (18h, and an earlier ~2-day outage). The Railway account is currently on a **TRIAL**. When trial credits run out the worker stops, the data lake stops updating, and **every dashboard tile (MTD revenue, jobs, calls, projected EOM) silently goes stale/inaccurate.**
  - **How:** railway.com → workspace `ronaldregan621's Projects` → upgrade to **Hobby (~$5/mo)**. Check current credit/usage at railway.com/account/usage. The worker is tiny (a mostly-idle 30-min Python loop) so it sits well inside the Hobby allowance.
  - **Owner:** USER — billing/card action (Claude can't add a payment method). Time-sensitive: do before trial credits expire.

- [ ] **★ TOP PRIORITY — Get Google Business Profile API access (unlocks real review text + automated NiceJob-style popups)**
  - **Why:** The homepage reviews widget is live and shows our real **4.9★ / 9 reviews** summary (pulled live from the Places API). But Google's public Places API returns **zero review _text_** for our listing — only the rating and count. So we cannot automate the little review blurbs / pop-ups (the "Amy just left us a 5-star review" toasts) from it. The **only** Google source that returns full review content (author, rating, date, body) is the **Business Profile API**, and only to the verified owner account.
  - **What we need, in order:**
    1. Enable the Business Profile APIs on project `ahp-analytics-493205` (one `gcloud services enable` command — can do anytime).
    2. Re-auth gcloud as the owner **with the review scope** (current login has cloud scopes but NOT `business.manage`, so review calls 403):
       `gcloud auth login alliancehandymanpros@gmail.com --scopes="https://www.googleapis.com/auth/business.manage,https://www.googleapis.com/auth/cloud-platform"`
    3. **Request Business Profile API access from Google** (allowlist application) — review text lives in the gated `mybusiness.googleapis.com/v4/.../reviews` endpoint. **Approval takes days to weeks — this is the long pole, so start it now.**
  - **Payoff:** auto-pull every review (text + author + date) → feed the homepage popup automatically. Free, on our own brand, no NiceJob subscription, no manual upkeep.
  - **Interim (in progress now):** manual Google-Sheet-driven popup — we maintain reviews in a Sheet by hand and the site renders them. Swap the data source to this API once approved, with no other changes.

- [ ] **Build #leads Slack channel — all AHP leads flow in real time**
  - Create a dedicated `#ahp-leads` channel in Slack
  - Wire every lead source to post an alert the moment a new lead arrives:
    - **OpenPhone 475 line** — new inbound call or SMS fires an alert
    - **Zenbooker** — new booking or inquiry fires an alert
    - **Thumbtack** — new lead notification fires an alert (via Zapier or Pipedream webhook)
    - **Google LSA** — new lead email triggers an alert
  - Alert should include: source, name/phone if available, first message or job type, timestamp
  - Goal: zero lag between lead arriving and team awareness — speed to lead is the single highest-leverage conversion lever in a service business

- [x] **Go live with live Google reviews on the homepage** (NiceJob-style) — *rating summary shipped 2026-06-08*
  - **Live now:** homepage shows a live **"Google 4.9 ★ · 9 reviews"** badge, pulled client-side via the Maps JS Places API. Referrer-locked key `AHP_PLACES_API_KEY` + pinned `AHP_PLACES_ID=ChIJVX9WfxxW64wRPKn0jyvxf_I` in `.env.shared`; injected via `sync-reviews-config.py` → `reviews-config.js` (committed across homepage + 67 sub/blog pages). Key created via gcloud (no billing card was needed after all).
  - **NOTE — Place ID must stay pinned:** our listing does NOT surface in Places text search (service-area business, hidden address); the Place ID was derived from the feature ID embedded in the site's "Read on Google" links. Name-based fallback resolution will never work.
  - **What's NOT done:** the three review _cards_ still show curated/hardcoded text because the Places API returns no review bodies. Real review blurbs + popups depend on the **★ TOP PRIORITY** Business Profile API item above (interim: manual Sheet-driven popup).

- [ ] **Investigate the live review-count discrepancy — badge shows "8 Google reviews," should be ~17**
  - **What:** On 2026-06-22 the live homepage badge read **4.9★ · 8 Google reviews**, but the actual GBP listing has ~17. The 4.9★ rating is correct; only the count is off.
  - **Likely cause:** Google's Places API (New) `userRatingCount` drifts from / undercounts what the Maps profile shows — common for service-area businesses with a hidden address. Not a bug in our code (we render whatever the API returns).
  - **Check:** call `places.googleapis.com/v1/places/ChIJVX9WfxxW64wRPKn0jyvxf_I?fields=rating,userRatingCount` directly and confirm the API itself is returning 8; if so it's Google-side. Decide whether to (a) live with it, (b) hardcode the true count in the badge, or (c) source the count from the Business Profile API once approved (the **★ TOP PRIORITY** item — that returns the true count + text and fixes this for good).

---

## COMPLETED

- [x] `/` — Homepage
- [x] `/tv-mounting-connecticut/` — Regional TV mounting landing page
- [x] `/tv-mounting-greenwich-ct/` through `/tv-mounting-white-plains-ny/` — 13 town pages
- [x] `/furniture-assembly/` — Furniture assembly landing page
- [x] `/bulb-and-battery/` — Bulb and Battery landing page
- [x] `/aging-in-place/` — Aging in Place landing page
- [x] `/childproofing/` — Childproofing landing page
- [x] `/ikea-assembly/` — IKEA Assembly landing page (flat-rate vs TaskRabbit, pricing section, 6 product lines)
- [x] `/blog/smoke-detector-chirping-3am/`
- [x] `/blog/high-ceiling-light-bulb-replacement/`
- [x] `/blog/smoke-detector-beeping-after-battery-change/`
- [x] `/blog/how-many-smoke-detectors-connecticut/`
- [x] `/blog/commercial-bulb-battery-service-fairfield-county/`
- [x] `/blog/aging-in-place-home-modifications-connecticut/`
- [x] `/blog/wayfair-furniture-assembly-connecticut/`
- [x] `/blog/baby-proofing-checklist-connecticut/`
- [x] `/blog/tv-mounting-above-fireplace-connecticut/`
- [x] `/blog/ikea-furniture-assembly-connecticut/`
- [x] `/tv-mounting-connecticut/` — Rebuilt from thin hub to full service landing page (6 job types, pain points with data, wall types, pricing table, town grid, 7 FAQs)
- [x] `/blog/tv-mounting-height-connecticut/` — TV mounting height guide (neck strain, THX/SMPTE standards, room-by-room, fireplace angle problem)
- [x] `/blog/samsung-frame-tv-mounting-connecticut/` — Samsung Frame installation guide (VESA holes, Slim Fit mount, one-connect cable, above-fireplace considerations)
- [x] `/blog/tv-mounting-plaster-walls-connecticut/` — Plaster wall TV mounting guide (3 methods, stud finder failure explanation, what not to do)
- [x] Homepage `LocalBusiness` schema — `sameAs` linked to verified GBP, geo coordinates corrected, hours fixed, all services in `makesOffer`

---

## PRIORITY 0 — GBP OPTIMIZATION (Do This Week, No Code Required)

GBP is verified. These actions directly move map pack ranking. Whitespark 2026 data: 8 of the top 10 local pack signals come from GBP itself. Review velocity beats review volume — a business with 80 recent reviews outranks one with 200 stale ones.

- [ ] **Set primary GBP category to "Handyman"**
  - Most specific match to actual services. Do not use "Contractor" or "Home Improvement."
  - Add secondary categories: TV Mounting Service, Furniture Assembly Service, Baby Proofing Service

- [ ] **Complete every GBP field**
  - Businesses with fully completed profiles are 2.7x more likely to be viewed as reputable by Google
  - Description (150–200 words, use these keywords naturally): TV mounting, IKEA furniture assembly, childproofing, baby proofing, aging in place, grab bars, Fairfield County, Greenwich, Darien, Westport, Stamford
  - Add website URL, hours (Mon–Sat 8am–6pm, Sun by request), phone, and service area cities

- [ ] **Add all services with descriptions in GBP Services section**
  - TV Mounting, Wall Mount Installation, TV Above Fireplace
  - IKEA Assembly, Furniture Assembly, Wayfair Assembly
  - Childproofing, Baby Proofing, Baby Gate Installation, Furniture Anchoring
  - Aging in Place, Grab Bar Installation, Handrail Installation
  - Bulb Replacement, Smoke Detector Installation, Battery Replacement
  - Each service should have a short description and price range if possible

- [ ] **Upload 25+ photos — geotagged**
  - Google Vision AI scans photos and matches them to searches even without text keywords
  - Photo mix: 8–10 job/service photos (TV mounts, IKEA builds, grab bar installs), 3–4 before/after shots, 2–3 team photos, 1–2 van/equipment photos
  - Geotag photos before uploading: on iPhone use the Photos app location data; on Android same. Photos taken at job sites in Fairfield County carry location signals.
  - Upload at least 2 new photos per week going forward — activity signal

- [ ] **Seed the GBP Q&A section yourself**
  - Google lets anyone answer Q&As including the owner. Pre-populate with the questions customers actually ask.
  - Suggested questions to add and answer:
    - "Do you mount TVs above fireplaces?" (Yes, including masonry drilling...)
    - "Do you assemble IKEA PAX wardrobes?" (Yes, PAX is our most requested...)
    - "Do you serve Greenwich / Darien / Westport?" (Yes, all of Fairfield County...)
    - "How much does TV mounting cost?" (Starting at $199 for standard wall mount...)
    - "Are you available same day?" (Yes, most days we have same-day availability...)
  - These answers show in the listing and are indexed by Google

- [ ] **Set up GBP weekly post cadence**
  - One case study showed 21% increase in local search impressions after 3 months of weekly posts
  - Listings that go 30+ days without a post see measurable ranking drops in 2026
  - Post format: 1–2 per week, 100–150 words, one photo, one CTA button ("Book," "Call," "Learn More")
  - Post ideas: recent job (TV above fireplace in Westport), seasonal tip (childproof before baby crawls), service spotlight (IKEA PAX delivery season), FAQ answer

- [ ] **Review request system**
  - Target: 2–3 new reviews per week consistently (velocity beats volume in 2026)
  - After each job: text customer within 24 hours — "Thanks for having us out today. If you have 30 seconds, a Google review makes a big difference for us: [GBP review link]"
  - Get review link from GBP dashboard under "Get more reviews" — it is a short direct link
  - Respond to every review within 24–48 hours. Businesses that respond to 80%+ of reviews see a measurable ranking boost.

---

## PRIORITY 1 — CITATION BUILDING (Off-Site, Quick, High Impact)

> ✅ **Paste-ready kit built 2026-08-02: `AHP-CITATIONS-KIT.md`** — exact NAP block, business description, and step-by-step per platform (Apple Business Connect first for iPhone Maps, Bing Places one-click import from GBP, Yelp, Angi) plus BBB/Facebook/Nextdoor/Houzz and local chamber .orgs. Owner action: work the kit top to bottom, GBP first, identical NAP everywhere.

Citations are NAP mentions (Name, Address, Phone) on trusted directories. They confirm to Google that the business is legitimate and consistent. The key: exact same business name, phone, and service area on every platform. Even "St." vs "Street" creates a mismatch.

**Business name to use everywhere:** Alliance Handyman Pros  
**Phone:** (475) 500-7126  
**Service area:** Fairfield County, CT and Westchester, NY  
**Website:** https://www.alliancehandymanpros.com

Claim and complete in this order (sorted by domain authority and home service relevance):

- [ ] **Apple Business Connect** (DA 100) — Critical. iPhone users get Maps results from Apple, not Google. apple.com/business-connect/
- [ ] **Bing Places** (DA 94) — Free, 10-minute setup, gets the business onto Bing search and Cortana results. bingplaces.com
- [ ] **Yelp** (DA 93) — Already showing in competitor search results for Fairfield County handyman. Claim or create: biz.yelp.com
- [ ] **Better Business Bureau / BBB** (DA 86) — Handyman Express CT shows their BBB badge and it is a visible trust signal. bbb.org/ct
- [ ] **Angi** (formerly Angie's List) (DA 78) — Dominant in home services "near me" searches. angi.com/pro
- [ ] **Houzz** (DA high, home services specific) — Appears in local handyman search results for CT. pro.houzz.com
- [ ] **Thumbtack** — Shows in "handyman near me" results, skews toward urgent smaller jobs (exactly what we do). thumbtack.com/pro
- [ ] **Nextdoor** — Hyperlocal. Fairfield County neighborhoods use Nextdoor heavily for home service recommendations. nextdoor.com/business
- [ ] **Facebook Business Page** — Needed for `sameAs` schema and citation consistency. facebook.com/business
- [ ] **Yellow Pages / YP.com** (DA 82) — Old-school but still a strong citation source. yellowpages.com
- [ ] **Foursquare** (DA 91) — Powers many downstream citation sources. foursquare.com/business
- [ ] **Manta** (DA 74) — Small business directory, easy NAP citation. manta.com
- [ ] **HomeAdvisor** — Generates leads and citation signal. homeadvisor.com/pro
- [ ] **Porch.com** — Home services specific, CT coverage. porch.com
- [ ] **Bark.com** — Appears in CT handyman searches. bark.com

**Local citations (Fairfield County specific):**
- [ ] **Fairfield County Chamber of Commerce** — Local link from a .org domain, strong local authority signal
- [ ] **Greenwich Chamber of Commerce** — greenwichchamber.com
- [ ] **Darien Chamber of Commerce** — darienchamber.com
- [ ] **Westport Chamber of Commerce** — westportchamber.com
- [ ] **Stamford Chamber of Commerce** — stamfordchamber.com
- [ ] **CT Better Business Bureau** — state-specific trust signal

---

## PRIORITY 2 — ON-SITE STRUCTURAL SEO

These fix the remaining gaps identified in competitive analysis.

- [ ] **`AggregateRating` schema on homepage and service pages**
  - Prerequisite: 10+ real Google reviews (see Priority 0)
  - Once reviews exist: add block to homepage, `/tv-mounting-connecticut/`, `/furniture-assembly/`, `/ikea-assembly/`, `/childproofing/`, `/aging-in-place/`
  - Stars in SERP snippets increase CTR 15–30% with no ranking change required

- [ ] **Pricing section on remaining service landing pages**
  - `/furniture-assembly/`, `/childproofing/`, `/aging-in-place/`, `/bulb-and-battery/`
  - `/ikea-assembly/` already has this — use that format
  - Captures "furniture assembly cost Connecticut" type queries

- [ ] **License and trust credentials on all pages**
  - Handyman Express CT shows CT License number (HIC.0699763) and BBB badge — visible trust signal
  - Add to footer of every page: CT license number (if applicable), "Licensed and Insured," years serving Fairfield County

- [ ] **Nav update across all existing pages**
  - Add IKEA Assembly link to nav on: all 13 TV town pages, `/furniture-assembly/`, `/bulb-and-battery/`, all blog posts
  - Final nav: TV Mounting / Furniture Assembly / IKEA Assembly / Bulb and Battery / Aging in Place / Childproofing

- [ ] **`/blog/` index page — Currently 404s**
  - Simple hub listing all posts by category
  - Needed for Google crawl path and internal linking

- [ ] **`og:image` meta tag on all pages**
  - No pages have an Open Graph image — links shared on iMessage or social show blank card
  - Create one 1200x630 branded image, add to every page `<head>`

---

## PRIORITY 3 — LOCAL LINK BUILDING (Off-Site, Medium Term)

Local backlinks from relevant, geographically-tied domains carry more ranking weight than generic directory links. These take more effort but move the needle on competitive keywords.

- [ ] **Patch.com contributor or mention**
  - Patch covers Greenwich, Darien, Westport, Stamford, Norwalk, New Canaan individually
  - A "home safety tip" or "baby proofing checklist" article contributed to local Patch carries a local backlink and reaches exactly the right audience
  - Target: one article per town, linked back to the relevant service page

- [ ] **Local news site mentions**
  - Greenwich Free Press, Darien Times, Westport News, The Hour (Norwalk)
  - Angle: pitch a seasonal story — "What Fairfield County homeowners should do before summer" — with a quote from the business
  - Even an unlinked mention in local press is a local prominence signal

- [ ] **Complementary business partnerships**
  - Real estate agents in Greenwich, Darien, Westport refer clients constantly for move-in handyman work
  - Interior designers refer assembly and TV mounting work regularly
  - A simple link exchange or referral arrangement generates local backlinks and leads simultaneously
  - Target: 5 real estate agents, 3 interior designers, 2 stagers

- [ ] **Community sponsorship**
  - Local youth sports leagues, school fundraisers, and neighborhood association events in Fairfield County publish sponsor lists on their websites
  - Even a $100–200 sponsorship of a Greenwich or Darien youth program typically yields a backlink from a .org or school domain — high local authority

---

## PRIORITY 4 — CONTENT (Blog Posts)

- [x] **`/blog/tv-wire-concealment-connecticut/`**
  - Target: "hide TV wires Connecticut" / "TV wire concealment Fairfield County"
  - Angle: in-wall vs. raceway, plaster wall options, fireplace surround concealment, NEC Section 400.8

- [x] **`/blog/new-home-handyman-checklist-connecticut/`**
  - Target: "new home checklist Connecticut" / "moving in handyman Fairfield County"
  - Cross-service capture — links to all service pages

- [x] **`/blog/picture-hanging-mirror-installation-connecticut/`**
  - Target: "picture hanging service Connecticut" / "mirror installation Fairfield County"
  - Angle: plaster walls, heavy mirrors, gallery walls

---

## PRIORITY 5 — TOWN PAGE EXPANSION (Programmatic Volume)

assembly-furniture.com ranks with thin content and 45+ CT city pages. We outrank them on quality; we need to match them on volume.

- [x] **Furniture Assembly town pages** — Greenwich, Darien, Westport, Stamford
- [x] **IKEA Assembly town pages** — Greenwich, Darien, Westport, Stamford
- [x] **Aging in Place town pages** — Greenwich, Darien, Westport
- [x] **Childproofing town pages** — Greenwich, Darien, Westport, Stamford

---

## FUTURE IDEAS (Not Scheduled)

- [ ] **Custom service icons via Kie AI** Replace the emoji placeholder icons on the offering cards (couch, framed art, TV, window, books, sparkles) with a matched set of custom branded icons generated in Kie AI. Cover every offering on the new segment pages and the service cards site wide: furniture assembly, art and mirror hanging, TV and Samsung Frame mounting, drapery and shade hardware, shelving and built in cabinetry, full install day setup, plus the core service pages. One consistent style, weight, and color so the whole site matches. Export as SVG or transparent PNG and swap into the icon slots.
- [x] Commercial service page for property management (built: `/commercial-services-fairfield-county/`, 2026-06-29)
- [ ] `/blog/curtain-rod-installation-connecticut/`
- [ ] `/blog/shelf-installation-connecticut/`
- [ ] `/blog/tv-mounting-no-studs-connecticut/`
- [ ] `/blog/grab-bar-installation-connecticut/`
- [ ] `/blog/baby-gate-installation-connecticut/`
- [ ] `/blog/furniture-assembly-cost-connecticut/`
- [ ] Westchester, NY expansion pages beyond White Plains

---

## COMPETITIVE CONTEXT (From Google Page 1 Analysis, April 2026)

| Gap | Who Has It | Our Status |
|---|---|---|
| GBP verified | All map pack results | Verified |
| GBP fully optimized (photos, posts, Q&A) | Mr. Handyman, Handyman Express CT | Incomplete |
| AggregateRating schema (stars in SERP) | Mr. Handyman (1,245 reviews, 4.8 stars) | Waiting on 10+ reviews |
| Citation consistency across 15+ directories | All established competitors | Zero citations claimed |
| Apple Maps / Bing Places listing | All competitors | Not claimed |
| Yelp presence | Competitors appearing in results | Not claimed |
| Local backlinks (chambers, press) | Mr. Handyman, Handyman Express CT | None |
| Pricing transparency on pages | Handyman Express CT | Only on `/ikea-assembly/` |
| Town pages for furniture/IKEA/childproofing | assembly-furniture.com (45+ pages) | Zero |

---

## STANDARDS

- No dashes (em, en, or hyphen) in any visible copy. Run grep check before every commit.
- All blog posts: 1,500–1,700 words, min 3 CTAs, min 3 internal links to relevant service page.
- All new service pages: match design of `/aging-in-place/` or `/childproofing/`.
- Blog posts: one Unsplash photo mid-article.
- Pain points must cite real sources: CPSC, NFPA 72, CDC, AAP, AARP.
- Every new service page: Service schema, FAQPage schema, BreadcrumbList schema.
- After each push: submit new URLs in Google Search Console.
