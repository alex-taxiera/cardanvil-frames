# Card Anvil frames

A starting point for building and publishing your own [Card Anvil](https://cardanvil.com) card frames.

Click **Use this template** to make your own copy, then follow along below.

---

## What you are making

A frame is **data, not code**: where the title sits, where the art shows through, and the images
that get drawn. Nothing in a frame runs — which is exactly why a frame can be handed to an app
that never compiled it.

This repository already contains one working frame, so you can replace one piece at a time and
check your work after each change rather than starting from nothing.

## Start in your browser

**Code → Codespaces → Create codespace.** Everything installs itself; nothing to set up on your
machine.

## Start on your computer

Install [Node.js 24+](https://nodejs.org) and [pnpm](https://pnpm.io/installation), then:

```bash
pnpm install
```

## Make your frame

```bash
pnpm new-frame
```

Answer four questions and you get a folder under `frames/` that already works. Then replace the
images in `frames/<your-frame>/base/` with your own art, one at a time, running `pnpm validate`
as you go.

Delete `frames/example` once you no longer need it.

## The coordinate space

Every position in `boxes.ts` is **absolute pixels** on a **3264 × 4440** canvas.

> ⚠ **A Magic card face is 63 × 88 mm.** Not 2.5 × 3.5 inches — that is the poker-card size, and
> the difference is 0.5 mm across and 0.9 mm tall, roughly 24 × 43 pixels at the resolution frames
> are drawn at. In inches the card is 2.48 × 3.46. Prefer millimetres.

The canvas is **not** the card face. It is the full printed sheet **including bleed** — 2.72 × 3.7 in
(69.09 × 93.98 mm) at 1200 DPI, with about 3 mm of bleed on every edge. So `y: 0` sits _above_ the
top of the card, in the part that gets trimmed off.

`fontSize` is in **points**, not pixels. The renderer converts.

## Art comes in barrels

An `index.ts` beside your images exports them by name, and that file _is_ an asset set:

```ts
// base/index.ts
export { default as w } from "./w.png";
export { default as u } from "./u.png";
```

```ts
import * as base from "./base";

frameAssets: {
  base;
}
```

The colour keys are `w u b r g m a c l v` — white, blue, black, red, green, gold, artifact,
colourless, land, vehicle.

> ⚠ **Export only keys the field accepts.** Passing a barrel with extra exports still type-checks,
> because TypeScript does not check for excess properties on a whole module — and those extra keys
> then end up in your frame where nothing can use them.

## Check your work

```bash
pnpm validate
```

This loads every frame, checks it against the frame contract, makes sure every image it names is
really there, and packs it in memory to prove it could be loaded back. It reports **everything**
wrong in one run, not the first thing.

Common messages:

| It says                      | It means                                                               |
| ---------------------------- | ---------------------------------------------------------------------- |
| `file not found: …`          | An image was renamed or moved; the import still points at the old path |
| `has no export named "…"`    | `export` in `frame.meta.json` does not match the name in `index.ts`    |
| `ship its own art`           | An asset points at a URL. A frame has to carry its own images          |
| `Invalid option` on a colour | A barrel exports a key that is not a frame colour                      |

## See it in Card Anvil

`pnpm validate` proves your frame is well formed. It cannot tell you whether it looks right — for
that, put it in the app.

### Once, to look at it

```bash
pnpm build
```

That writes a `.cardframe` file per frame into `dist/`. **Drag one onto Card Anvil** — the web app or
the desktop app, either works — and it installs. Your frame then appears in the frame picker beside
the built-in ones, and stays there until you remove it.

### While you work on it

The desktop app can watch a folder instead, so a save shows up without reinstalling anything.

1. Leave a build running:

   ```bash
   pnpm watch
   ```

2. In Card Anvil: **Settings → Frames → Frame folder**, and choose this repository's `dist/` folder —
   the one `pnpm watch` is writing into.

Now every save repacks the frames that changed, and the app picks them up. Edit a coordinate, watch
the box move.

(If you would rather keep the app pointed somewhere tidier, build into it instead:
`pnpm exec frame-kit build --watch --out "<that folder>"`.)

A few things worth knowing:

- **A broken save keeps the last good frame.** If the build fails, the previous bundle stays in
  place and the error prints in your terminal — you do not lose the frame mid-edit.
- **A save that changes nothing does nothing.** Bundles are byte-for-byte deterministic, so
  reformatting a file or saving without an edit produces an identical bundle and the app has no
  reason to redraw.
- **A linked folder is not an install.** Nothing is copied. Stop the watch and unlink the folder and
  the frames are simply gone from the app — which is what you want while iterating, and not what you
  want for a frame you actually use.
- **Web browsers cannot watch a folder**, so this loop is desktop-only. Dragging a `.cardframe` in
  works everywhere.

## Publish

**Actions → Release frames → Run workflow → pick `patch`, `minor` or `major` → Run.**

That is the whole process. You never type a version number and never touch git. Every frame in the
repository is published together under one version.

You get a release containing a `.cardframe` file per frame, a preview image for each, and a
`frame-index.json` describing the lot.

> If your default branch is protected, the release cannot push its version commit. Either leave
> `main` unprotected or allow `github-actions[bot]` to bypass the rules.

## Share it

Give people this link — it always points at your newest release:

```
https://github.com/<you>/<your-repo>/releases/latest/download/frame-index.json
```

Or point them at the Releases page to download a `.cardframe` directly.

## Before you publish art

GitHub refuses files over 100 MB and release assets over 2 GiB. Full-size frame art is large, so
keep individual images well under 100 MB — `pnpm validate` will tell you if one is too big.

You are responsible for the rights to the art you publish. Put an honest value in your frame's
`license` field; it travels into the index where anyone installing your frame can read it.

## Layouts beyond `normal`

The example handles `normal` — ordinary creatures, spells and artifacts. A frame can declare more:
`saga`, `transform`, `modal_dfc`, `normal_planeswalker` and others, each with its own boxes and art.
A frame only has to declare the layouts it supports; the rest show as unavailable in the app.

The commented schema in
[`@cardanvil/frame-kit`](https://github.com/Card-Anvil/frames/blob/trunk/packages/frame-kit/src/schema/frame.ts)
is the reference for what every field does, and
[Card Anvil's own frames](https://github.com/Card-Anvil/frames) are worked examples of the harder
ones.

## Commands

| Command                     | What it does                  |
| --------------------------- | ----------------------------- |
| `pnpm new-frame`            | Scaffold a new frame          |
| `pnpm validate`             | Check every frame             |
| `pnpm build`                | Pack every frame into `dist/` |
| `pnpm watch`                | Repack into `dist/` on save   |
| `pnpm typecheck`            | Type-check                    |
| `pnpm lint` / `pnpm format` | Tidy the code                 |
