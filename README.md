# IMBEGNAL

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Free and open-source platform for learning roadmaps, certifications, courses, and career guidance.

**Live:** https://imbegnal.com

## What is IMBEGNAL?

Instead of searching across 20 websites, find every roadmap, certification, course, YouTube resource, book, and career path — all in one place, completely free.

## Features

- **Courses**: 8 tracks, 67 interactive lessons in English and Arabic (full RTL)
- **Lesson player**: in-browser code exercises (HTML/JS/Python), quizzes with instant feedback, course outline, per-lesson summary
- **AI tutor** on every lesson (Claude), grounded in the lesson text
- **Notes** per lesson (Markdown, autosave, export) and a student **dashboard** with streaks, XP and levels
- **Accounts**: email + password, GitHub (and optional Google) — progress syncs across devices; guests learn without signing up
- **Roadmaps & certifications** with curated resources
- Light / dark mode, mobile-first, SEO-optimized (per-lesson pages, sitemap, JSON-LD)

See [docs/PLATFORM.md](docs/PLATFORM.md) for architecture, deployment and the product roadmap.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build
```

The API lives in [`worker/`](worker) (Cloudflare Worker + D1).

## How to Contribute
See the guid on how to contribute [here](CONTRIBUTING.md)

## License

MIT — built for learners worldwide.
