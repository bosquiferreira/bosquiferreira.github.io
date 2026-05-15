# ceciliapozzi.github.io

Portfolio of Cecilia Pozzi (interior design studio). Static site built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages.

## Local development

Requirements: Node.js 20+ (tested on 20 LTS, works on 22+).

```bash
npm install
npm run serve
```

Site is served at <http://localhost:8080/>. Hot-reload on file changes.

Other scripts:

```bash
npm run build   # one-off build into _site/
npm run clean   # remove _site/
```

## Project structure

```
src/
├── _data/
│   ├── site.json          Global metadata (title, URL, GTM id, contact info)
│   └── projects.json      All projects (title, hero, gallery, subtitle, dates)
├── _includes/
│   ├── layouts/
│   │   ├── base.njk       HTML shell (head, header, content, footer, scripts)
│   │   └── project.njk    Project page layout with JSON-LD
│   └── partials/
│       ├── head.njk       Meta tags, Open Graph, Twitter Cards, site-wide JSON-LD
│       ├── header.njk     Site nav
│       ├── footer.njk     Footer with contact info
│       ├── scripts.njk    Cookie banner markup + JS bundle reference
│       └── project-card.njk
├── assets/
│   ├── css/styles.css     Site stylesheet (ex-Litespeed bundle + Complianz vars + theme tokens)
│   ├── css/complianz-banner.css   Cookie banner CSS variables
│   ├── js/app.js          Site JS bundle
│   ├── fonts/             icomoon icon font
│   └── img/
│       ├── projects/<slug>/    Per-project galleries + WebP variants
│       ├── furniture/<slug>/
│       ├── home/, about/, contact/, legal/
│       └── shared/        Logos, favicons, project thumbnails
├── projects/
│   ├── index.njk          Projects grid (consumes _data/projects.json)
│   └── project.njk        Generates one page per project via Pagination
├── furniture/             Three furniture detail pages
├── legal/                 cookies.njk, legal-notice.njk, privacy.njk
├── index.njk              Home
├── about.njk
├── contact.njk
├── sitemap.njk            Generated /sitemap.xml
└── robots.txt
```

The `legacy/` directory at the repo root contains the original WordPress static mirror (HTML + wp-content/). Not used by the build, kept for reference.

## Adding a project

1. Add an entry to [src/_data/projects.json](src/_data/projects.json):

```json
{
  "slug": "new-project",
  "title": "Project Name",
  "subtitle": "Renovation and decoration project",
  "location": "Home decoration Barcelona",
  "description": "First paragraph used as meta description.",
  "date": "2026-05-15T10:00:00+00:00",
  "hero": "assets/img/projects/new-project/hero.jpg",
  "heroWidth": 1024,
  "heroHeight": 683,
  "paragraphs": ["First paragraph.", "Second paragraph."],
  "images": [
    { "url": "assets/img/projects/new-project/01.jpg", "width": 4896, "height": 3264 },
    { "url": "assets/img/projects/new-project/02.jpg", "width": 4896, "height": 3264 }
  ]
}
```

2. Drop the original images at `src/assets/img/projects/new-project/`. Include WebP variants beside each original (`01.jpg` + `01.jpg.webp`) for the `<picture>` source.

3. `npm run build`. The page is generated at `/projects/new-project/` automatically.

## Editing a static page

`src/about.njk`, `src/contact.njk`, `src/furniture/*.njk`, `src/legal/*.njk` are Nunjucks pages with front matter. Edit the HTML body directly. Front matter exposes:

- `title`, `description` — meta tags
- `permalink` — URL
- `bodyClass` — body class string (the legacy CSS relies on `wp-theme-calacatta`, `wpb-js-composer`, etc., which are injected automatically by [src/_includes/layouts/base.njk](src/_includes/layouts/base.njk); the `bodyClass` value is appended)
- `ogImage`, `ogImageWidth`, `ogImageHeight` — Open Graph image

## Deployment

GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml). On push to `main` or `eleventy`, the workflow:

1. Runs `npx @11ty/eleventy` with `PATH_PREFIX` set from `actions/configure-pages` (handles project-page subpaths automatically).
2. Uploads `_site/` as a Pages artifact.
3. Deploys with `actions/deploy-pages@v4`.

Enable Pages in the repo settings: **Settings → Pages → Source: GitHub Actions**.

## Notes

- Path prefix (`PATH_PREFIX`) is injected at build time. Locally it's `/`. In CI it picks up the GitHub Pages base path automatically via `actions/configure-pages`, so the site works whether deployed at a custom domain or at `<user>.github.io/<repo>/`.
- The CSS bundle (`src/assets/css/styles.css`) is a single 480 KB file inherited from the original WordPress site (Litespeed-compiled). Many selectors are scoped to WP-style body classes (`.wp-theme-calacatta`, `.wpb-js-composer`, `.home`, etc.), which is why the base layout still injects them.
