# Sanket Choudhary – Portfolio

**An interactive portfolio that runs like a desktop operating system in the browser: draggable app windows, a taskbar and start menu on desktop, and a phone-style home screen on mobile.**

Live site: https://sanketc001.github.io/portfolio/

## What it is

Instead of a single scrolling page, each section of the portfolio is an "app" that opens in its own window:

| App | What it shows |
|---|---|
| About Me | Name, title, short pitch, location, quick links and résumé button; background and skills |
| Featured Projects | Curated project cards with real screenshots (problem → what I built → stack) and an "All repositories" tab fetched live from the GitHub API (forks, archived repos and the profile repo are skipped) |
| Experience | Work timeline and awards |
| Ask my portfolio | Chat that answers questions about the portfolio through the `chat-proxy` worker |
| Contact / Mail | Contact form backed by Web3Forms, or a mailto button when no key is configured |
| Resume.pdf | Embedded resume viewer |
| Certifications | Certificates and credentials |
| Media Gallery | Project screenshots from `public/gallery/` plus anything in `public/{documents,pictures,music,videos}` |
| Developer Blog | Short posts |
| Settings | Light/dark mode and wallpaper selection |

The layout adapts to the device: a windowed desktop (taskbar, start menu with search, window management) on larger screens and an app-grid home screen on mobile. A visitor counter from CounterAPI is shown when the real count can be fetched; otherwise it is hidden.

## Guided tour

On a first visit the site walks the visitor through the most relevant windows, one at a time:

1. About Me → 2. Featured Projects → 3. Experience → 4. Ask my portfolio → 5. Contact

- Desktop: each window opens centred and large enough to read. A footer shows progress (`2 / 5`), a primary **Next: <title> →** button and **Skip tour**. Closing the window with the red button also moves to the next step. After the last step (or a skip) the normal desktop is left as it is.
- Mobile: the About app opens first with the same footer; **Next** walks the same sequence and the back button leaves the tour.
- Completion is stored in `localStorage` (`portfolio_tour_done`). Every storage call is wrapped, so the site works when storage is blocked (the tour then simply shows again on the next visit).
- Restart it from the Start menu (**Take the tour**), the notice shown after the tour, or the **Tour** icon on mobile.
- Animations respect `prefers-reduced-motion`.
- Steps are defined in `src/tour.ts`; the window manager logic is in `src/context/OSContext.tsx`.

## Ask my portfolio (chat)

`src/components/Apps/ChatApp.tsx` posts `{messages:[{role,content}]}` (last 10 messages, 1000 characters max per message) to `VITE_CHAT_ENDPOINT` and renders the streamed reply (`text/event-stream` in OpenAI chat-completions format, with a plain JSON fallback). Answers are rendered with a tiny markdown renderer that never injects HTML. If the endpoint is not configured or a request fails, the window points visitors to Contact and email instead.

The endpoint is the Cloudflare Worker in [`chat-proxy/`](chat-proxy/README.md). It runs Llama 3.3 70B on Cloudflare Workers AI (free daily allowance; Azure OpenAI is a config switch), restricts CORS to the site, validates input, adds a server-side system prompt built from `chat-proxy/knowledge.md`, rate-limits per IP and streams the answer back.

## Architecture

```
src/
├── main.tsx / App.tsx       entry; chooses Desktop or HomeScreen via useDevice()
├── context/OSContext.tsx    window manager state, guided tour, theme, wallpaper, visit counter
├── tour.ts                  tour steps (order of the guided tour)
├── desktop/                 Desktop, Window, Taskbar, StartMenu
├── mobile/HomeScreen.tsx    mobile launcher
├── components/Apps/         one component per "app"
├── api/github.ts            featured projects + GitHub repos fetch (30-minute cache)
├── api/chat.ts              streaming client for the chat proxy
├── utils/                   guarded localStorage helpers, safe markdown renderer
└── data/portfolioData.json  all content: profile, skills, featured projects, media registry
scripts/generate-media-registry.cjs   scans public/{documents,pictures,music,videos}
                                      and writes the gallery entries into portfolioData.json
chat-proxy/                  Cloudflare Worker for the chat (Workers AI), knowledge.md, tests
```

Content is data-driven: editing `src/data/portfolioData.json` (or dropping files into the `public/` media folders) updates the site without touching components.

## Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS v4, Framer Motion, Lucide icons
- Oxlint
- GitHub Actions → GitHub Pages

## Quickstart

```bash
git clone https://github.com/sanketc001/portfolio.git
cd portfolio
npm install
npm run dev        # http://localhost:5173/portfolio/
```

Other scripts:

```bash
npm run build      # regenerates the media registry, type-checks, builds to dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
npm run test:worker  # chat-proxy worker tests (Node, no wrangler needed)
```

## Configuration

Site content lives in `src/data/portfolioData.json`:

- `profile` – name, title, pitch, bio, links, avatar
- `featuredProjects` – curated project cards (problem, what was built, stack, screenshots in `public/gallery/`); also the fallback list when the GitHub API is unavailable or rate-limited
- `experience`, `skills`, `certifications`, `blog`

Optional build-time environment variables (see `.env.example`; copy it to `.env.local` for local development):

| Variable | Used by | When unset |
|---|---|---|
| `VITE_CHAT_ENDPOINT` | Ask my portfolio | Chat shows an offline notice that points to Contact and email |
| `VITE_WEB3FORMS_KEY` | Contact form ([Web3Forms](https://web3forms.com) access key) | Contact shows a mailto button instead of the form |

When the portfolio content changes, update `chat-proxy/knowledge.md` too so the chat stays accurate.

The base path is set to `/portfolio/` in `vite.config.ts` for GitHub Pages.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main` (also `master` and `windows-ui-emulation`, which are kept in sync with `main` by `sync-branches.ps1`).

The build reads two repository variables (**Settings → Secrets and variables → Actions → Variables**): `VITE_CHAT_ENDPOINT` and `VITE_WEB3FORMS_KEY`.

### Chat proxy

The same workflow deploys the worker in `chat-proxy/` and builds the site with its URL, once two repository **secrets** exist: `CLOUDFLARE_API_TOKEN` (template "Edit Cloudflare Workers") and `CLOUDFLARE_ACCOUNT_ID`. No model API key is needed. To deploy by hand instead: `cd chat-proxy && npx wrangler deploy`, then set `VITE_CHAT_ENDPOINT` to the printed URL. Details in [`chat-proxy/README.md`](chat-proxy/README.md).

## Limitations and next steps

- Unauthenticated GitHub API calls are limited to 60 requests/hour per visitor IP; the localStorage cache and fallback list soften this.
- Large media files are served directly from the repository; moving them to a CDN would reduce repo size and build time.
- The chat proxy's in-memory rate limit is per isolate; bind the optional KV namespace for a shared limit.
- Automated tests cover the chat proxy only (`npm run test:worker`).
