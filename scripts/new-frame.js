#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

const FRAMES_DIR = "frames";
const DEFAULT_TEMPLATE = "example";

/** Lower-case kebab, which is what a slug and a filename both need. */
function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** `my-frame` -> `myFrameFrame` reads badly, so: `my-frame` -> `myFrame`. */
function exportNameFor(slug) {
  const camel = slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return camel.endsWith("Frame") || camel.endsWith("frame")
    ? camel
    : `${camel}Frame`;
}

function git(...args) {
  try {
    return (
      execFileSync("git", args, {
        encoding: "utf8",
        // A missing remote or config key is an expected outcome here, not
        // something to show the author; without this git complains aloud.
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() || undefined
    );
  } catch {
    return undefined;
  }
}

/** The GitHub owner, used to suggest an id that is actually yours. */
function repoOwner() {
  const remote = git("remote", "get-url", "origin");
  const match = remote && /[:/]([^/:]+)\/[^/]+?(?:\.git)?$/.exec(remote);
  return match?.[1];
}

async function existingFrames() {
  const frames = [];
  let entries;
  try {
    entries = await readdir(FRAMES_DIR, { withFileTypes: true });
  } catch {
    return frames;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    try {
      const meta = JSON.parse(
        await readFile(
          path.join(FRAMES_DIR, entry.name, "frame.meta.json"),
          "utf8",
        ),
      );
      frames.push({
        slug: meta.slug ?? entry.name,
        dir: entry.name,
        id: meta.id,
      });
    } catch {
      // Not a frame, or not a readable one — discovery will say so later.
    }
  }
  return frames;
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

async function main() {
  const { values } = parseArgs({
    options: {
      name: { type: "string" },
      description: { type: "string" },
      slug: { type: "string" },
      id: { type: "string" },
      author: { type: "string" },
      url: { type: "string" },
      license: { type: "string" },
      from: { type: "string" },
      yes: { type: "boolean", short: "y" },
    },
    strict: true,
  });

  const frames = await existingFrames();
  const template = values.from ?? DEFAULT_TEMPLATE;
  if (!frames.some((frame) => frame.dir === template)) {
    fail(
      `There is no frame to copy from at ${FRAMES_DIR}/${template}.\n` +
        `Pass --from <folder> to start from a different one.`,
    );
  }

  // --yes drives this from a script or an agent; without it, ask.
  const rl = values.yes
    ? undefined
    : createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (question, fallback) => {
    if (!rl) {
      return fallback;
    }
    const shown = fallback ? ` (${fallback})` : "";
    const answer = (await rl.question(`${question}${shown}: `)).trim();
    return answer || fallback;
  };

  try {
    const name = values.name ?? (await ask("Frame name", ""));
    if (!name) {
      fail("A frame needs a name.");
    }

    const slug = slugify(
      values.slug ?? (await ask("Folder name", slugify(name))),
    );
    if (!slug) {
      fail(`"${name}" does not reduce to a usable folder name; pass --slug.`);
    }

    const owner = repoOwner();
    const id =
      values.id ??
      (await ask(
        "Frame id",
        owner ? `com.github.${slugify(owner)}.${slug}` : `com.example.${slug}`,
      ));

    const description =
      values.description ??
      (await ask("One-line description", "A custom Card Anvil frame."));
    const author =
      values.author ??
      (await ask("Your name", git("config", "user.name") ?? ""));
    const url = values.url ?? (await ask("Your website (optional)", ""));
    const license =
      values.license ?? (await ask("Licence for the art", "CC-BY-4.0"));

    if (!author) {
      fail("A frame needs an author; pass --author.");
    }

    const clash = frames.find(
      (frame) => frame.slug === slug || frame.dir === slug,
    );
    if (clash) {
      fail(
        `${FRAMES_DIR}/${clash.dir} already uses the folder name "${slug}".`,
      );
    }
    const idClash = frames.find((frame) => frame.id === id);
    if (idClash) {
      fail(
        `${FRAMES_DIR}/${idClash.dir} already claims the id "${id}".\n` +
          `An id is permanent identity — two frames cannot share one.`,
      );
    }

    const target = path.join(FRAMES_DIR, slug);
    await mkdir(FRAMES_DIR, { recursive: true });
    await cp(path.join(FRAMES_DIR, template), target, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });

    const exportName = exportNameFor(slug);

    const metaFile = path.join(target, "frame.meta.json");
    const meta = JSON.parse(await readFile(metaFile, "utf8"));
    meta.id = id;
    meta.export = exportName;
    meta.author = url ? { name: author, url } : { name: author };
    meta.license = license;
    await writeFile(metaFile, `${JSON.stringify(meta, null, 2)}\n`);

    const indexFile = path.join(target, "index.ts");
    const source = await readFile(indexFile, "utf8");
    const templateExport = JSON.parse(
      await readFile(
        path.join(FRAMES_DIR, template, "frame.meta.json"),
        "utf8",
      ),
    ).export;
    await writeFile(
      indexFile,
      source
        .replaceAll(templateExport, exportName)
        .replace(/name: ".*"/, `name: ${JSON.stringify(name)}`)
        .replace(
          /description: ".*"/,
          `description: ${JSON.stringify(description)}`,
        ),
    );

    const shown = target.split(path.sep).join("/");
    console.log(`
Created ${shown}

  1. Replace the art in ${shown}/base/ with your own.
  2. pnpm validate
  3. Commit, then Actions -> Release frames -> Run workflow.
`);
  } finally {
    rl?.close();
  }
}

await main();
