# Sanket Choudhary – Portfolio

**An interactive portfolio that runs like a desktop operating system in the browser, and dresses itself as the visitor's own: Windows 11, macOS or GNOME on desktop, iOS or Android on a phone.**

Live site: https://sanketc001.github.io/portfolio/

## What it is

Instead of a single scrolling page, each section of the portfolio is an "app" that opens in its own window:

| App | What it shows |
|---|---|
| About Me | Name, title, short pitch, location, quick links and résumé button; background and skills |
| Featured Projects | Curated project cards with real screenshots (problem → what I built → stack) and an "All repositories" tab fetched live from the GitHub API (forks, archived repos and the profile repo are skipped) |
| Experience | Work timeline, education and awards |
| Ask my portfolio | Chat that answers questions about the portfolio through the `chat-proxy` worker |
| Contact / Mail | Contact form backed by Web3Forms, or a mailto button when no key is configured |
| Resume.pdf | Interactive resume and the master resume PDF (`public/Resume.pdf`), with links to role-specific versions in `public/resumes/` |
| Certifications | Certificates with issuer, date, credential ID and link |
| Media Gallery | Project screenshots from `public/gallery/` plus anything in `public/{documents,pictures,music,videos}` |
| Developer Blog | Short posts |
| Settings | Desktop style (match my system, or pick one), light/dark mode, system accent colour, wallpaper, and what the browser reported about the device |

The layout adapts to the device: a windowed desktop on larger screens and an app-grid home screen on mobile. A visitor counter from CounterAPI is shown when the real count can be fetched; otherwise it is hidden.

## It looks like your system

The shell is chosen from the visitor's user agent (plus client hints where the browser offers them) and can be overridden in Settings.

| Detected | Shell |
|---|---|
| Windows | Mica taskbar with centred apps, Start menu, tray clock, title-bar buttons on the right |
| macOS, iPadOS at desktop width | Menu bar, magnifying dock, Spotlight-style search, traffic lights on the left |
| Linux, ChromeOS, unrecognised | GNOME top bar, dock down the left edge, full-screen Activities overview |
| iOS | Widget card, squircle icons, glass dock, home indicator |
| Android | "At a glance" header, round icons, search pill, gesture bar |

Each shell uses the system's own font stack, so there are no web fonts to download. Details that come from the visitor's device, all read in the page and never stored or sent anywhere:

- OS name and version, browser and version, device model when shared (`src/system/detect.ts`)
- Battery level and charging state, online/offline (`src/system/hooks.ts`); the battery glyph is simply left out in browsers that don't expose it
- Clock and dates in the visitor's locale, and a time-of-day tint on the animated default wallpaper
- Light or dark mode from `prefers-color-scheme`, and the OS accent colour where the browser exposes the CSS `AccentColor` system colour

The first load of a session opens with a short greeting that says what was detected; any click or key skips it and it is not shown under `prefers-reduced-motion`.

The accent is one CSS variable, `--accent`; the `accent-*` Tailwind palette in `src/index.css` is derived from it, and each shell sets its own tokens under `html[data-os]`.

## Guided tour

On a first visit the site walks the visitor through the most relevant windows, one at a time:

1. About Me → 2. Featured Projects → 3. Experience → 4. Ask my portfolio → 5. Contact

- Desktop: each window opens centred and large enough to read. A footer shows progress (`2 / 5`), a primary **Next: <title> →** button and **Skip tour**. Closing the window with the red button also moves to the next step. After the last step (or a skip) the normal desktop is left as it is.
- Mobile: the About app opens first with the same footer; **Next** walks the same sequence and the back button leaves the tour.
- Completion is stored in `localStorage` (`portfolio_tour_done`). Every storage call is wrapped, so the site works when storage is blocked (the tour then simply shows again on the next visit).
- Restart it from the app launcher (**Take the tour**), the notice shown after the tour, or the **Tour** icon on mobile.
- Animations respect `prefers-reduced-motion`.
- Steps are defined in `src/tour.ts`; the window manager logic is in `src/context/OSContext.tsx`.

## Ask my portfolio (chat)

`src/components/Apps/ChatApp.tsx` posts `{messages:[{role,content}]}` (last 10 messages, 1000 characters max per message) to `VITE_CHAT_ENDPOINT` and renders the streamed reply (`text/event-stream` in OpenAI chat-completions format, with a plain JSON fallback). Answers are rendered with a tiny markdown renderer that never injects HTML. If the endpoint is not configured or a request fails, the window points visitors to Contact and email instead.

The endpoint is the Cloudflare Worker in [`chat-proxy/`](chat-proxy/README.md). It runs Llama 3.1 8B (fp8-fast) on Cloudflare Workers AI (free daily allowance; Azure OpenAI is a config switch), restricts CORS to the site, validates input, adds a server-side system prompt built from `chat-proxy/knowledge.md`, rate-limits per IP and streams the answer back.

## Architecture

```
src/
├── main.tsx / App.tsx       entry; boot greeting, then Desktop or HomeScreen by viewport width
├── context/OSContext.tsx    window manager state, active shell, device info, guided tour, theme, wallpaper, visit counter
├── system/                  OS/browser detection, battery/network/clock hooks, boot flag
├── appRegistry.ts / apps.tsx  the app list (names, icons, colours) and the icon/content components
├── tour.ts                  tour steps (order of the guided tour)
├── desktop/                 Desktop, Window, Launcher, DeviceWidget
├── desktop/shells/          WindowsShell, MacShell, LinuxShell (bars and docks)
├── mobile/HomeScreen.tsx    iOS / Android home screen
├── components/Apps/         one component per "app"
├── api/github.ts            featured projects + GitHub repos fetch (30-minute cache)
├── api/chat.ts              streaming client for the chat proxy
├── utils/                   guarded localStorage helpers, safe markdown renderer
└── data/portfolioData.json  all content: profile, skills, featured projects, media registry
scripts/generate-media-registry.cjs   scans public/{documents,pictures,music,videos}
                                      and writes the gallery entries into portfolioData.json
scripts/import-linkedin.mjs           updates portfolioData.json from a LinkedIn data export
scripts/linkedin-import.config.json   import rules (merges, renames, hidden entries, skill categories)
scripts/build-knowledge.mjs           generates chat-proxy/knowledge.md from portfolioData.json
chat-proxy/                  Cloudflare Worker for the chat (Workers AI), knowledge base, tests
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
npm test           # importer + worker tests, and checks knowledge.md is up to date
npm run test:worker  # chat-proxy worker tests only (Node, no wrangler needed)
npm run knowledge  # regenerate chat-proxy/knowledge.md
npm run import:linkedin -- <export.zip>   # see "Updating from LinkedIn"
```

## Configuration

Site content lives in `src/data/portfolioData.json`:

- `profile` – name, title, LinkedIn headline, pitch, bio, links, avatar
- `featuredProjects` – curated project cards (problem, what was built, stack, screenshots in `public/gallery/`); also the fallback list when the GitHub API is unavailable or rate-limited
- `experience`, `education`, `skills`, `certifications`, `blog`

`profile.name/title/headline/bio/location`, `experience`, `education`, `certifications` and the LinkedIn part of `skills` are written by the LinkedIn importer (see below): change them on LinkedIn or through `scripts/linkedin-import.config.json`, otherwise the next import overwrites the edit. Everything else is curated by hand.

Optional build-time environment variables (see `.env.example`; copy it to `.env.local` for local development):

| Variable | Used by | When unset |
|---|---|---|
| `VITE_CHAT_ENDPOINT` | Ask my portfolio | Chat shows an offline notice that points to Contact and email |
| `VITE_WEB3FORMS_KEY` | Contact form ([Web3Forms](https://web3forms.com) access key) | Contact shows a mailto button instead of the form |

`chat-proxy/knowledge.md` (the chat's knowledge base) is generated from `portfolioData.json` plus the hand-written sections in `chat-proxy/knowledge.extra.md` (availability, awards, notes that are not in the JSON). Do not edit it directly: change the JSON or the extra file and run `npm run knowledge`. The deploy workflow regenerates it before deploying the worker, and `npm test` fails when the committed copy is stale.

The base path is set to `/portfolio/` in `vite.config.ts` for GitHub Pages.

## Updating from LinkedIn

LinkedIn's API does not give individuals their full profile, so the data export is the source.

1. **Request the export.** On LinkedIn: **Settings → Data privacy → Get a copy of your data**. Either option works (picking only Profile, Positions, Education, Skills and Certifications is faster). LinkedIn emails a download link; save the `.zip` outside the repo, or inside it as `*LinkedInDataExport*.zip` or under `linkedin-export/` (both are git-ignored).
2. **Preview, then import.**
   ```bash
   npm run import:linkedin -- ~/Downloads/Basic_LinkedInDataExport_10-21-2026.zip --dry-run
   npm run import:linkedin -- ~/Downloads/Basic_LinkedInDataExport_10-21-2026.zip
   ```
   The path can also be an extracted folder. The importer reads only `Profile.csv`, `Profile Summary.csv`, `Positions.csv`, `Education.csv`, `Skills.csv` and `Certifications.csv`; messages, connections, contact details and every other file in the export are never opened or copied. It stops with an error when `Profile.csv` or `Positions.csv` is missing. It prints what changed (profile fields, experience entries, education, certificates added/removed, new skills and their categories) and then regenerates `chat-proxy/knowledge.md`.
3. **Adjust the rules if needed** in `scripts/linkedin-import.config.json` and run the import again (it is idempotent):
   - `profile.titleOverride`: short title shown on the site (the full LinkedIn headline is kept as `profile.headline`)
   - `experience.merge`: positions with the same start date shown as one entry (e.g. employer and client), with a combined company and role
   - `experience.rename` / `experience.roles`: company names, and role text keyed by `"Company|Title"` or `"Company"`
   - `experience.keepCuratedDescription`: companies whose description in `portfolioData.json` is kept instead of LinkedIn's (an empty LinkedIn description always keeps the existing one)
   - `experience.hide`, `education.hide`, `certifications.hide`
   - `certifications.relevantKeywords`: certificates matching these (in priority order) are listed first, then newest first
   - `skills.categories` (skill → category; unmapped skills go to `skills.defaultCategory`), `skills.rename`, `skills.hide`. LinkedIn skills are added to the curated categories without duplicates; curated skills are never removed.
4. **Review** with `git diff src/data/portfolioData.json chat-proxy/knowledge.md` and `npm run dev`, then run `npm test`.
5. **Commit and push.** The workflow rebuilds the site and redeploys the chat worker with the regenerated knowledge base.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main` (also `master` and `windows-ui-emulation`, which are kept in sync with `main` by `sync-branches.ps1`).

The build reads two repository variables (**Settings → Secrets and variables → Actions → Variables**): `VITE_CHAT_ENDPOINT` and `VITE_WEB3FORMS_KEY`.

### Chat proxy

The same workflow deploys the worker in `chat-proxy/` and builds the site with its URL, once two repository **secrets** exist: `CLOUDFLARE_API_TOKEN` (template "Edit Cloudflare Workers") and `CLOUDFLARE_ACCOUNT_ID`. No model API key is needed. To deploy by hand instead: `cd chat-proxy && npx wrangler deploy`, then set `VITE_CHAT_ENDPOINT` to the printed URL. Details in [`chat-proxy/README.md`](chat-proxy/README.md).

## Limitations and next steps

- Unauthenticated GitHub API calls are limited to 60 requests/hour per visitor IP; the localStorage cache and fallback list soften this.
- Large media files are served directly from the repository; moving them to a CDN would reduce repo size and build time.
- The chat proxy's in-memory rate limit is per isolate; bind the optional KV namespace for a shared limit.
- Automated tests cover the chat proxy, the LinkedIn importer and the knowledge builder (`npm test`); there are no UI tests.
