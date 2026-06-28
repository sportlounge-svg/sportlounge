# SPORT LOUNGE — Task Tracker (GitHub Pages Deployment & Compatibility)

## Phase 1: Next.js Configuration Updates
- [x] Update `frontend/next.config.ts` (Dynamic basePath for GitHub Actions build)
- [x] Update `frontend/src/lib/api.ts` (Dynamic API_URL for github.io domains)
- [x] Update `frontend/src/app/login/page.tsx` (Dynamic Google OAuth redirect URI with subpath support)
- [x] Update `frontend/src/app/create/page.tsx` (Dynamic Google OAuth redirect URI inside create page)

## Phase 2: Deployment Automation
- [x] Create `.github/workflows/gh-pages.yml` (GitHub Pages deploy action for sport-lounge branch)

## Phase 3: Verification & Compilation Check
- [x] Test Next.js build locally (`npm run build` in `frontend/`)
- [x] Commit and Push changes to `sport-lounge` branch
- [x] Monitor GitHub Pages deployment workflow
