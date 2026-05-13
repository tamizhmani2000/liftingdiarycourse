# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lifting Diary Course - A Next.js application for tracking lifting workouts. Built with Next.js 16.2.4 (App Router), React 19, TypeScript 5 (strict mode), and Tailwind CSS v4.

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

No test runner is configured yet.

## Architecture

### Tech Stack
- **Framework**: Next.js 16.2.4 with App Router (server components by default)
- **Language**: TypeScript 5, strict mode, `moduleResolution: "bundler"`
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` (imported with `@import "tailwindcss"` — no separate config file needed)
- **Fonts**: Geist Sans (`--font-geist-sans`) and Geist Mono (`--font-geist-mono`) via `next/font/google`
- **Linting**: ESLint 9 flat config (`eslint.config.mjs`) extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

### CSS Theming
`globals.css` defines CSS custom properties (`--background`, `--foreground`) and wires them into Tailwind's theme via `@theme inline`. Dark mode uses `prefers-color-scheme`. Font variables set in `layout.tsx` are exposed to Tailwind as `--font-sans` and `--font-mono` via the same `@theme inline` block.

## Docs-First Rule

**IMPORTANT**: Before generating any code, Claude Code MUST first read and consult the relevant documentation files in the `/docs` directory. All implementation decisions should align with the guidelines found there.

- Check `/docs` for relevant doc files before writing or modifying any code
- Currently available: `docs/ui.md`, `docs/data-fetching.md`, `docs/data-mutations.md`, `docs/auth.md`
- If a relevant doc exists for the area being changed (UI, architecture, conventions, etc.), that doc takes precedence over assumptions

### Conventions
- Path alias `@/*` maps to `src/*`
- Client components require `'use client'` directive; all others are server components
- Use `next/image` for all images (auto-optimization)
- Responsive design uses Tailwind's mobile-first breakpoints (`sm:`, `md:`, etc.) with dark mode via `dark:` prefix
