// Packs this fork's packages as @spindyzel/ui-sdk-*, for Stylebase to
// install by alias. See README.md beside it.
import { execFileSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const version = process.argv[2]
if (!/^\d+\.\d+\.\d+-[\w.]+\.stylebase\.\d+$/.test(version ?? "")) {
  throw new Error("Pass a version like 0.1.0-beta.5.stylebase.1")
}
const root = resolve(import.meta.dirname, "../..")
const out = join(root, ".stylebase")
const packages = ["core", "svelte", "vue", "react"]
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, {
    cwd,
    stdio: ["ignore", "pipe", "inherit"],
  }).toString()

const titles = {
  core: "core",
  svelte: "for Svelte",
  vue: "for Vue",
  react: "for React",
}
const changes = readFileSync(join(import.meta.dirname, "CHANGES.md"), "utf8")
// The fork notice that opens each package's README, as the license asks.
const notice = (name) => `> [!IMPORTANT]
> **Unofficial fork.** \`@spindyzel/ui-sdk-${name}\` is a fork of [UI SDK](https://github.com/vercel-labs/ui) by Husni Ramdani ([husniramdani/ui](https://github.com/husniramdani/ui)), with fixes for Stylebase, a design system built on it. It isn't made, affiliated with or endorsed by Vercel or the UI SDK team. For anything else, use the official \`@ui-sdk/${name}\`, and report problems with this fork at [husniramdani/ui](https://github.com/husniramdani/ui/issues).

${changes}
---

`

rmSync(out, { recursive: true, force: true })
mkdirSync(out)
// Fills each package's docs folder, as upstream's release does.
run("node", ["scripts/package-docs.mjs", ...packages], root)
for (const name of packages) {
  const dir = join(root, "packages", name)
  run("pnpm", ["run", "build"], dir)
  // pnpm pack applies publishConfig and turns `workspace:^` into a range.
  const work = mkdtempSync(join(tmpdir(), "stylebase-pack-"))
  run("pnpm", ["pack", "--pack-destination", work], dir)
  const tarball = readdirSync(work).find((file) => file.endsWith(".tgz"))
  run("tar", ["-xzf", tarball], work)
  const manifestPath = join(work, "package", "package.json")
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  manifest.name = `@spindyzel/ui-sdk-${name}`
  manifest.version = version
  manifest.description = `Unofficial fork of UI SDK ${titles[name]} (vercel-labs/ui), with fixes for Stylebase. Not affiliated with or endorsed by Vercel.`
  manifest.homepage =
    "https://github.com/husniramdani/ui/tree/stylebase/scripts/stylebase"
  manifest.bugs = "https://github.com/husniramdani/ui/issues"
  manifest.repository = {
    type: "git",
    url: "git+https://github.com/husniramdani/ui.git",
    directory: `packages/${name}`,
  }
  const readme = join(work, "package", "README.md")
  writeFileSync(readme, notice(name) + readFileSync(readme, "utf8"))
  if (manifest.peerDependencies?.["@ui-sdk/core"]) {
    manifest.peerDependencies["@ui-sdk/core"] = `^${version}`
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  run(
    "npm",
    ["pack", "--ignore-scripts", "--pack-destination", out],
    join(work, "package")
  )
  rmSync(work, { recursive: true, force: true })
}
console.log(readdirSync(out).join("\n"))
