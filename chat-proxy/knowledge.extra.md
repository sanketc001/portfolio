<!--
Hand-written knowledge that cannot be derived from src/data/portfolioData.json.
scripts/build-knowledge.mjs appends everything below this comment to
chat-proxy/knowledge.md. Edit here, then run `npm run knowledge`.
-->

## Links not in portfolioData.json

- Portfolio: https://sanketc001.github.io/portfolio/

## Availability

- Open to Applied AI, Forward Deployed Engineer (FDE) and Senior Technical
  Consultant roles, in India or remote.
- Role-specific resumes (Applied AI, FDE, Technical Consultant) are linked in
  the Resume.pdf window; Resume.pdf itself is the full master resume.
- Notice period, relocation, visa, compensation and start dates are not in
  this file: the assistant does not know them and should point people to
  email (sanketkumarchoudhary@gmail.com) or the Contact window.

## Awards

- Winner, Jio AI Agent Hackathon (company-wide across Reliance Jio, July 2025).
  With a colleague he ideated and built a safety and
  evacuation push system over RCS, SMS and email: each person gets the exact
  evacuation path for their building or campus from their live GPS location
  (taken through the browser), the same live locations go to the evacuation
  QRT and crisis response teams, and an updated path is pushed if someone is
  restricted or their surroundings are damaged.
- Top Partner Employee, twice (Dec 2023 and Jan 2025), for the IPL 2023 ad
  analytics and the GenAI ad creative work: LoRA and fine-tuning pipelines on
  Stable Diffusion 1.5 and SDXL, and an aesthetic scorer with automatic
  regeneration that curated images for JioHalo screensavers and GoLocal content.
- On-the-Fly Awards: from Quest Global for the Philips GenAI PoC and for
  automating internal Quest SDLC workflows, and from the Jio team (November 2026).

## Outcomes worth quoting

- IPL 2023 ad monitoring: manual monitoring needed up to 2 people per language
  and 2 per stream. He automated ad tracking and analytics for every stream
  from SCTE-35 signals (real time and post-processing), then turned it into
  daily and per-match Ad Opportunity Loss reports for senior leadership. That
  contributed to a 15% increase in ad revenue and sharply cut the people
  needed for active monitoring.
- Quest–Jio AI Demo Day: he was solely responsible for the demos and the
  presentation, which secured 4 new projects and more traction on 2 ongoing ones.
- Client GenAI PoCs through Quest Global: Philips (agent-based UI automation for
  WinForms-style desktop apps with cross-language translation verification),
  GE Aerospace (document RAG with BM25, LlamaIndex and ChromaDB that finds similar
  past engineering documents and advises engineers on the next step) and
  Halliburton (agent pipeline over design docs, technical docs and bill-of-materials
  reports to speed up custom drill-part creation).
- Jio Design System MCP: self-initiated a solution that turns a business PRD into
  JDS-compliant design documents and flows for web and Android, after seeing how
  long business teams waited on design iterations.
- Mentoring: about 12 developers on diffusion-based image, audio and video
  generation, and 5 QA engineers on agent-based web UI automation (Playwright,
  CDP) and Voice AI testing over adb. He also helped a DGM QA lead set up a fully
  automated test harness for Jio Business Messaging and RCS.
- Speech AI metrics for JioSphere are under NDA: the assistant should say so
  rather than guess numbers.

## Project notes

### ParsedIn

Screenshots on the portfolio use synthetic sample data. Architecture, as
described: the LinkedIn export is imported locally into a graph of people,
companies and schools; an LLM resolves company names using web evidence; the
app offers an overview dashboard, a graph view, an inbox with reply drafts and
natural-language search. Finer implementation details are not in this file.

### Projects not on GitHub yet (no public repository or screenshots)

- Gap Map Reference Apps: three deployable apps (insurance Claims Desk, Private
  Knowledge Assistant with cited answers, Creative Studio with Content
  Credentials) composed from open-source AI products scored on the AI Potluck
  Gap Map. Every request gets an OpenTelemetry trace of which product did each
  step, with time, tokens and cost; ablation evals switch each product off and
  can gate a release. Independent project, not affiliated with AI Potluck.
- Hands-free Voice Agent (in progress): a voice-only device-control experiment
  that already works on the web through a custom harness around the Chrome
  DevTools Protocol (similar to browser-use), being extended to Android via adb
  and accessibility services.
- AIAssist: local-first notes, calendar, maps, web capture and search with
  strict Personal / Work separation and an assistant that works over the user's
  data through a permission-checked tool layer; Android, web and desktop from one
  React Native (Expo) codebase.

## LLM agent work at a glance

- minimal-agent-harness: agent loop with tool calling, a CDP-driven browser,
  memory, sub-agents and MCP servers.
- ai-timelines: research agent using Azure OpenAI tool calling and Playwright.
- Saathi-MCP-Family-Assistant: MCP server with about 50 tools.
- ai-microdrama-studio: an LLM "director" that plans scenes for generation.
- Winner of the Jio AI Agent Hackathon (July 2025).
