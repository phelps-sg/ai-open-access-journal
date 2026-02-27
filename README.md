# AI Open-Access Journal

An audited AI pipeline for scientific publishing. Researchers pre-register study designs, submit results, and the platform generates papers using Claude — with citation verification, open peer review, and a full audit trail.

**Live**: [arxai.science](https://arxai.science)

## How it works

1. **Pre-register** a study design (empirical, simulation, replication, or negative results)
2. **Submit results** as data artifacts with a manifest
3. **AI generates the paper** section-by-section from the pre-registration and results, enforcing faithful reporting
4. **Citations are verified** against Semantic Scholar and CrossRef
5. **Open peer review** with attributed reviews and structured scoring
6. **Publication** with full transparency: pre-registration, data, audit trail, and reviews all visible

## Why

Scientific publishing has a principal-agent problem: the people who run studies are the same people whose careers depend on results looking good. AI has no career — it won't bury a negative result. The audit trail makes the entire pipeline inspectable, replacing trust-by-proxy with verifiable transparency.

## Tech stack

Next.js 15 / React 19 / TypeScript / Tailwind CSS / Drizzle ORM / Neon Postgres / NextAuth.js / Claude Opus 4.6 / Vercel

## Development

```bash
npm install
npm run dev
```

Requires environment variables — see `.env.example`.
