#!/usr/bin/env node
// Downloads every `drive:<fileId>` photo listed in src/data/members.json into
// public/members, so the site ships its own copies. Google Drive serves no CORS
// headers, and the ASCII effect reads pixels off a canvas, so a hotlinked Drive
// image would taint the canvas and break the portraits entirely.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'members')

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const roster = JSON.parse(
  await readFile(join(root, 'src', 'data', 'members.json'), 'utf8'),
)

await mkdir(outDir, { recursive: true })

let downloaded = 0
for (const entry of roster) {
  if (!entry.photo?.startsWith('drive:')) continue

  const id = entry.photo.slice('drive:'.length)
  const target = join(outDir, `${slug(entry.name)}.jpg`)
  const res = await fetch(
    `https://drive.google.com/uc?export=download&id=${id}`,
    { redirect: 'follow' },
  )

  if (!res.ok) {
    console.error(`✗ ${entry.name}: HTTP ${res.status}`)
    process.exitCode = 1
    continue
  }

  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) {
    // Drive answers with an HTML interstitial when a file is not shared with
    // "anyone with the link", or when it is too large to scan.
    console.error(`✗ ${entry.name}: got ${type}, check the file is public`)
    process.exitCode = 1
    continue
  }

  await writeFile(target, Buffer.from(await res.arrayBuffer()))
  console.log(`✓ ${entry.name} → public/members/${slug(entry.name)}.jpg`)
  downloaded++
}

console.log(`${downloaded} photo(s) synced.`)
