<!--
Hand-written knowledge that cannot be derived from src/data/portfolioData.json.
scripts/build-knowledge.mjs appends everything below this comment to
chat-proxy/knowledge.md. Edit here, then run `npm run knowledge`.
-->

## Links not in portfolioData.json

- Portfolio: https://sanketc001.github.io/portfolio/

## Availability

- Open to Applied AI and Forward Deployed Engineer (FDE) roles.
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
- Top Partner Employee, twice (Dec 2023 and Jan 2025), for the GenAI ad
  creative work: LoRA and fine-tuning pipelines on Stable Diffusion 1.5 and
  SDXL, and an aesthetic scorer with automatic regeneration that curated
  images for JioHalo screensavers and GoLocal content.

## Outcomes worth quoting

- IPL 2023 ad monitoring: manual monitoring needed up to 2 people per language
  and 2 per stream. He automated ad tracking and analytics for every stream
  from SCTE-35 signals (real time and post-processing), then turned it into
  daily and per-match Ad Opportunity Loss reports for senior leadership. That
  contributed to a 15% increase in ad revenue and sharply cut the people
  needed for active monitoring.

## Project notes

### ParsedIn

Screenshots on the portfolio use synthetic sample data. Architecture, as
described: the LinkedIn export is imported locally into a graph of people,
companies and schools; an LLM resolves company names using web evidence; the
app offers an overview dashboard, a graph view, an inbox with reply drafts and
natural-language search. Finer implementation details are not in this file.

## LLM agent work at a glance

- minimal-agent-harness: agent loop with tool calling, a CDP-driven browser,
  memory, sub-agents and MCP servers.
- ai-timelines: research agent using Azure OpenAI tool calling and Playwright.
- Saathi-MCP-Family-Assistant: MCP server with about 50 tools.
- ai-microdrama-studio: an LLM "director" that plans scenes for generation.
- Winner of the Jio AI Agent Hackathon (July 2025).
