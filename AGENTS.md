# AGENTS.md

Guide for coding agents working in this repository. Read [README.md](README.md) first — it is the
author's guide and this file does not repeat it.

## What this is

A repository of custom [Card Anvil](https://github.com/Card-Anvil) card frames, made from
[the frame template](https://github.com/Card-Anvil/frame-template). Frames are authored against
`@cardanvil/frame-kit` and published to GitHub releases as `.cardframe` bundles.

| Task         | Command                          |
| ------------ | -------------------------------- |
| Install      | `pnpm install`                   |
| New frame    | `pnpm new-frame`                 |
| Check frames | `pnpm validate`                  |
| Pack frames  | `pnpm build`                     |
| Typecheck    | `pnpm typecheck`                 |
| Lint         | `pnpm lint` / `pnpm lint:fix`    |
| Format       | `pnpm format` / `pnpm format:ci` |

Node 24+, pnpm (both pinned).

## Card dimensions — be exact

**A Magic card face is 63 × 88 mm.**

Never write **2.5 × 3.5 inches**. That is the poker-card size and it is wrong: 0.5 mm too wide and
0.9 mm too tall, about 24 × 43 pixels at 1200 DPI. It is the kind of error that propagates silently
into layout maths and documentation.

- Prefer **millimetres**. In inches the card is **2.48 × 3.46 in** — never round to 2.5 × 3.5.
- The **3264 × 4440 canvas is not the card face.** It is the full printed sheet _including bleed_:
  2.72 × 3.7 in (69.09 × 93.98 mm) at 1200 DPI, with roughly 3 mm of bleed per edge. Box
  coordinates are relative to that sheet, so `y: 0` is in the bleed, not the top of the card.
- When a number must appear in prose, say which of the two rectangles it describes.

## Conventions

- **Frames are data, not code.** A frame module exports one `Frame` object. Nothing in it runs at
  render time — that is what makes a frame distributable.
- **A barrel is an asset set.** `export { default as w } from "./w.png"` plus
  `import * as base from "./base"`. A barrel must export _only_ keys the target field accepts:
  passing one wholesale type-checks even with extra exports, because excess property checks do not
  apply to namespace objects, and those keys then enter the frame where nothing can resolve them.
- **Validate, do not just type.** `pnpm validate` parses every frame against the real schema, checks
  every asset resolves to a file, and round-trips it through the bundle format. Typing a config as
  `Frame` is weaker than what a loading app enforces.
- **A frame carries its own art.** Assets are imported, never fetched — the bundle is what gets
  installed, so a remote URL would simply be missing.
- **`frame.meta.json` marks a frame.** One per frame directory. It has no `version` field on
  purpose: every frame here is released together under the repository's version.
- Relative imports are extensionless, matching the frame packages upstream.

## Previewing in Card Anvil

`pnpm validate` checks structure; only the app shows pixels. `pnpm build` writes a `.cardframe` per
frame to `dist/`, which installs by dragging it onto the web or desktop app. For an edit loop, run
`pnpm watch` and link `dist/` from the desktop app (**Settings → Frames → Frame folder**), which
repacks into it on every save.

A linked folder is not an install — nothing is copied, and unlinking removes the frames from the
app. A failed rebuild leaves the previous bundle in place rather than dropping the frame, and an
edit that does not change the built output produces an identical bundle, so the app correctly does
nothing.

## Adding a frame

Use `pnpm new-frame` rather than copying by hand — it derives the export name, the id and the
descriptor together, and refuses a slug or id another frame already claims.

## Releasing

Actions → **Release frames** → pick a bump → Run. The workflow computes the next version from the
newest `v*` tag, validates, commits the version, tags, packs, and publishes a GitHub release with
every `.cardframe`, every preview, and `frame-index.json`.

Never hand-edit `version` in `package.json`; the workflow owns it.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
`<type>(<scope>): <description>`, imperative, lower case, no trailing period. Scope by frame where
it makes sense.

The default branch is **`main`**, and it should stay unprotected — the release workflow pushes a
version commit to it. If you protect it, allow `github-actions[bot]` to bypass the rules.
