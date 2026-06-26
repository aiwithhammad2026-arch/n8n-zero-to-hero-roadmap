# n8n Zero to Hero Roadmap

**Prepared for:** Hammad Ullah
**Email:** aiwithhammad2026@gmail.com
**Phone:** 0333-1904805

---

The complete, no-fluff roadmap to go from total beginner to professional automation builder. Every node, every concept, in the exact order you should learn it.

**Stats:** 11 Learning phases · 30+ Core nodes explained · 15 Real projects · 0→💰 Beginner to paid

## How to use this roadmap

Don't try to swallow everything at once. The secret to mastering n8n is simple:

1. **Pick ONE thing** from the current phase (one node, one concept, one project).
2. Search it on **YouTube** using the search phrases given in each section.
3. Watch a short tutorial, then **immediately build it yourself** in n8n — don't just watch.
4. Tick the box ✅, then move to the next thing. Repeat until the bar hits 100%.

> Rule of the game: **you only "learn" a node once you've built a working workflow with it.** Watching ≠ knowing. Building = knowing.

---

## Phase 0 — Foundations (Beginner) · ⏱ 3–5 days
**Goal:** Before touching n8n, understand WHAT automation is and the 3 concepts every workflow stands on — triggers, actions, and data (JSON).

- [ ] What is workflow automation? — Connecting apps so tasks run by themselves.
- [ ] What is an API? — How two apps talk to each other.
- [ ] What is JSON? — The data format n8n passes between nodes (keys, values, arrays, objects).
- [ ] Trigger vs Action — Trigger starts a workflow; Action is what it does next.
- [ ] What is a webhook? — A URL that "listens" for events.
- [ ] n8n vs Zapier vs Make — Why n8n: self-hostable, unlimited steps, cheaper, full control.

**YouTube searches:** `what is an API explained simply` · `JSON crash course for beginners` · `n8n vs zapier vs make`

---

## Phase 1 — Setup & Interface (Beginner) · ⏱ 3–4 days
**Goal:** Get n8n running and become fluent with the editor.

**Get n8n running:**
- [ ] Create a free n8n Cloud account
- [ ] (Optional) Run n8n locally with `npx n8n` (localhost:5678)
- [ ] (Optional) Self-host with Docker (save for Phase 9)

**Master the editor:**
- [ ] The canvas & node panel — add/search/connect nodes
- [ ] Manual Trigger + "Test workflow"
- [ ] Read input vs output data (Table / JSON / Schema views)
- [ ] Pinning data & re-running nodes
- [ ] Activate a workflow + Executions log
- [ ] Understand "items"

**🏆 Build #1:** Manual Trigger → Set node → see your name in the output

**YouTube searches:** `n8n tutorial for beginners 2024` · `n8n install docker` · `n8n editor explained`

---

## Phase 2 — Core Nodes (Beginner → Intermediate) · ⏱ 2–3 weeks
**Goal:** These 12 nodes are 80% of everything you'll ever build. Learn ONE node per day.

| Node | Description | Practice Build |
|---|---|---|
| Manual Trigger | Starts a workflow when you click "Test" | Trigger that greets you |
| Edit Fields (Set) | Create/rename/restructure data fields | Shape a clean output object |
| HTTP Request | Call ANY API on the internet | Fetch a random joke API |
| IF | Split flow into two paths by condition | Route emails by priority |
| Switch | Many paths — route by category/status | Sort leads by country |
| Merge | Combine data from two branches | Join two API results |
| Filter | Keep only matching items | Keep only paid orders |
| Code / Function | Custom JavaScript escape hatch | Format a date with JS |
| Schedule Trigger | Run automatically on a schedule/cron | Daily 9am reminder |
| Webhook | Give workflow a URL to be triggered | Catch a form submission |
| Wait | Pause workflow | Delayed follow-up message |
| Sticky Note / NoOp | Organize and document workflow | Label your branches |

**Tick each node once you've built with it:**
- [ ] Edit Fields (Set)
- [ ] HTTP Request
- [ ] IF
- [ ] Switch
- [ ] Merge
- [ ] Filter
- [ ] Code node
- [ ] Schedule Trigger
- [ ] Webhook
- [ ] Wait

**YouTube searches:** `n8n HTTP request node tutorial` · `n8n IF node` · `n8n switch node example` · `n8n code node javascript`

---

## Phase 3 — Data & Expressions (Intermediate) · ⏱ 1–2 weeks
**Goal:** 90% of beginners get stuck here — moving data between nodes. Master expressions and you can build anything.

- [ ] Expressions & the `{{ }}` syntax
- [ ] Drag-and-drop data mapping
- [ ] `$json`, `$node`, `$input`, `$items` variables
- [ ] Items vs single object — looping basics
- [ ] Loop Over Items (Split in Batches)
- [ ] Aggregate, Item Lists, Sort, Limit nodes
- [ ] Date & Time + string formatting in expressions

**🏆 Build #2:** Fetch a list from an API, filter it, reshape it, output clean data

**YouTube searches:** `n8n expressions tutorial` · `n8n data mapping` · `n8n loop over items split in batches`

---

## Phase 4 — App Integrations (Intermediate) · ⏱ 2 weeks
**Goal:** Learn credentials (API keys & OAuth) and build with integrations clients ask for most.

**Key skill:**
- [ ] Credentials — API keys vs OAuth2

**Must-know integration nodes:**
- Google Sheets — read/write rows (the #1 "database" for beginners)
- Gmail / Email — send, read, label, auto-reply
- Telegram — build bots that send & receive messages
- WhatsApp / Slack / Discord — message channels & teams
- Airtable / Notion — modern databases for CRMs/trackers
- Google Calendar — create & read events (booking systems)
- Google Drive / Docs — upload files, generate documents
- Shopify / Stripe / WooCommerce — orders, payments, money automations

**Tick once built:**
- [ ] Google Sheets — read & write rows
- [ ] Gmail — sent & read mail
- [ ] Telegram bot — built one
- [ ] Slack / Discord / WhatsApp — posted a message
- [ ] Airtable or Notion — built a tracker

**🏆 Build #3:** Form → log to Google Sheet → send confirmation email + Telegram alert

**YouTube searches:** `n8n google sheets tutorial` · `n8n telegram bot` · `n8n oauth credentials setup`

---

## Phase 5 — APIs & Webhooks Deep Dive (Intermediate+) · ⏱ 1 week
**Goal:** When n8n has no built-in node for an app, HTTP Request + webhooks let you connect anyway.

- [ ] Read any app's API documentation (endpoints, GET/POST/PUT/DELETE, headers, body)
- [ ] Authentication: API key, Bearer token, OAuth2
- [ ] Query params, headers & JSON body
- [ ] Pagination — fetch ALL pages of results
- [ ] Respond to Webhook node — turn n8n into your own API/backend
- [ ] Test APIs with Postman / the node's import

**🏆 Build #4:** Connect to an app that has NO n8n node, using only HTTP Request

**YouTube searches:** `n8n http request advanced` · `n8n pagination tutorial` · `n8n webhook respond node`

---

## Phase 6 — AI Automation (Advanced) 🔥 Hottest skill in 2026 · ⏱ 2–3 weeks
**Goal:** Connect LLMs, build chatbots, AI agents that use tools, and RAG systems over your own documents.

**AI nodes to master:**
- AI Agent — LLM that reasons and calls tools on its own
- Chat Model (OpenAI / Claude / Gemini) — the "brain"
- Memory — gives a chatbot conversation history
- Tools (for the Agent) — Calculator, HTTP, Sheets, etc.
- Vector Store + Embeddings — store documents for RAG search
- Structured Output / Parser — force AI to return clean JSON

**Tasks:**
- [ ] Connect an LLM credential (OpenAI / Claude / Gemini)
- [ ] Basic LLM Chain — prompt in, answer out
- [ ] AI Agent + tools + memory
- [ ] RAG: chat with your own documents

**🏆 Build #5:** AI customer-support bot that answers from YOUR business FAQ

**YouTube searches:** `n8n AI agent tutorial` · `n8n RAG chatbot` · `n8n openai node` · `n8n vector store qdrant`

---

## Phase 7 — Reliability & Advanced Flow (Advanced) · ⏱ 1 week
**Goal:** Beginners build flows that crash silently. Pros build flows that handle errors, retry, and alert them.

- [ ] Error Trigger + dedicated error workflow
- [ ] "Continue on fail" & retry settings
- [ ] Stop and Error node
- [ ] Sub-workflows (Execute Workflow node)
- [ ] Handling rate limits with Wait + batches
- [ ] Deduplication & avoiding duplicate runs

**🏆 Build #6:** Add full error handling + Telegram alert to an earlier project

**YouTube searches:** `n8n error handling workflow` · `n8n execute workflow sub-workflow` · `n8n continue on fail`

---

## Phase 8 — Portfolio Projects · ⏱ Ongoing
**Goal:** Pick projects that excite you and build them end to end. Record them, post them, use as portfolio pieces.

| Project | Level | Description | Stack |
|---|---|---|---|
| Lead capture machine | Beginner | Web form → Sheet → email + WhatsApp confirmation | Webhook, Sheets, Gmail |
| Content → social poster | Beginner | RSS/blog → AI rewrites caption → auto-post | RSS, AI, Schedule |
| AI support chatbot | Advanced | Telegram/WhatsApp bot answering from FAQ via RAG | AI Agent, Vector, Telegram |
| Smart inbox assistant | Intermediate | AI labels/summarizes email, drafts reply | Gmail, AI, IF |
| E-commerce order flow | Intermediate | New order → invoice → SMS → team alert | Stripe, Docs, Slack |
| Daily report bot | Intermediate | Pulls API stats each morning, AI summarizes | HTTP, AI, Schedule |
| Lead enrichment + CRM | Advanced | New lead → enrich → AI score → add to CRM | HTTP, AI, Airtable |
| Invoice / PDF generator | Intermediate | Form → generate PDF invoice → email → log | Webhook, PDF, Gmail |

**Checklist:**
- [ ] Built 1 beginner project end-to-end
- [ ] Built 1 intermediate project
- [ ] Built 1 advanced AI project
- [ ] Posted a build on Instagram / YouTube

---

## Phase 9 — Self-Hosting & Deployment (Advanced) · ⏱ 1 week
**Goal:** Self-hosting saves money and unlocks full power — clients will pay you to set it up.

- [ ] Get a VPS (Hostinger, DigitalOcean, Hetzner)
- [ ] Install n8n with Docker + Docker Compose
- [ ] Domain + SSL (HTTPS) with reverse proxy (Caddy/Nginx/Traefik)
- [ ] Environment variables & PostgreSQL database
- [ ] Backups & updating n8n safely
- [ ] Basic security: auth, firewall, secrets

**🏆 Build #7:** Deploy your own n8n on a VPS with a custom domain

**YouTube searches:** `self host n8n docker vps` · `n8n nginx ssl reverse proxy` · `n8n postgres docker compose`

---

## Phase 10 — Go Pro & Get Paid 💰
**Goal:** You learned it — now earn from it.

| Path | Earnings | Notes |
|---|---|---|
| Freelance gigs | $50–500/workflow | Upwork/Fiverr/X — fast way to start |
| **Automation agency** (Best ROI) | $1k–10k+/project | Full systems + monthly retainers |
| Content & teaching | Grows audience → income | YouTube/IG, courses, templates, sponsorships |

**Checklist:**
- [ ] Package 3 workflows as portfolio demos
- [ ] Pick a niche (e-commerce, agencies, real estate…)
- [ ] Post your builds consistently
- [ ] Land your first paid automation 🎉

---

## Bonus: Avoid These · Do These

**🚫 Beginner mistakes**
- Watching 50 tutorials but never building anything yourself
- Trying to learn all 400+ nodes — you only need ~30
- Skipping expressions & data flow — then getting stuck forever
- No error handling — flows break silently in production
- Hard-coding values instead of using expressions
- Not testing with pinned data — wasting API calls

**✅ Pro habits**
- Build a tiny workflow for every new node you learn
- Use Sticky Notes to document every workflow
- Name your nodes clearly — "Get Lead" not "HTTP Request1"
- Break big flows into reusable sub-workflows
- Always add an Error Trigger + alert
- Teach what you learn — it 10x's retention

---

## Resources to Bookmark

- [n8n Docs](https://docs.n8n.io) — Official documentation
- [Workflow Templates](https://n8n.io/workflows) — Copy & learn from 1000s
- [n8n Community](https://community.n8n.io) — Ask & get unstuck
- [YouTube](https://www.youtube.com/results?search_query=n8n+tutorial) — Your main classroom
- [Expressions Guide](https://docs.n8n.io/code/expressions/) — Master data mapping
- [All Integrations](https://n8n.io/integrations) — Browse every node

---

### Now pick ONE thing and start 🚀
Don't overthink it. Go to Phase 0, pick the first box, search it on YouTube, build it, tick it. That's the whole game.

---

**Owner:** Hammad Ullah
**Contact:** aiwithhammad2026@gmail.com | 0333-1904805
