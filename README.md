# Sanket Choudhary – Portfolio

**An interactive portfolio that runs like a desktop operating system in the browser: draggable app windows, a taskbar and start menu on desktop, and a phone-style home screen on mobile.**

Live site: https://sanketc001.github.io/portfolio/

## What it is

Instead of a single scrolling page, each section of the portfolio is an "app" that opens in its own window:

| App | What it shows |
|---|---|
| About Me | Profile, bio and grouped skills |
| Projects Explorer | Public GitHub repositories fetched live from the GitHub API, with a curated fallback list |
| Resume.pdf | Embedded resume viewer |
| Media Gallery | Documents, pictures, music and videos from `public/` |
| Developer Blog | Short posts |
| Certifications | Certificates and credentials |
| Contact / Mail | Contact form backed by Web3Forms |
| Settings | Light/dark mode and wallpaper selection |

The layout adapts to the device: a windowed desktop (taskbar, start menu with search, window management) on larger screens and an app-grid home screen on mobile. A visitor counter is shown via CounterAPI.

## Architecture

```
src/
├── main.tsx / App.tsx       entry; chooses Desktop or HomeScreen via useDevice()
├── context/OSContext.tsx    window manager state, theme, wallpaper, visit counter
├── desktop/                 Desktop, Window, Taskbar, StartMenu
├── mobile/HomeScreen.tsx    mobile launcher
├── components/Apps/         one component per "app"
├── api/github.ts            GitHub repos fetch with 30-minute localStorage cache
└── data/portfolioData.json  all content: profile, skills, projects, media registry
scripts/generate-media-registry.cjs   scans public/{documents,pictures,music,videos}
                                      and writes the gallery entries into portfolioData.json
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
```

## Configuration

No environment variables are required. Site content and keys live in `src/data/portfolioData.json`:

- `profile` – name, title, bio, links, avatar
- `profile.web3forms_key` – Web3Forms access key for the contact form
- `fallbackProjects` – shown if the GitHub API is unavailable or rate-limited

The base path is set to `/portfolio/` in `vite.config.ts` for GitHub Pages.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main` (also `master` and `windows-ui-emulation`, which are kept in sync with `main` by `sync-branches.ps1`).

## Limitations and next steps

- Unauthenticated GitHub API calls are limited to 60 requests/hour per visitor IP; the localStorage cache and fallback list soften this.
- Large media files are served directly from the repository; moving them to a CDN would reduce repo size and build time.
- No automated tests yet.
