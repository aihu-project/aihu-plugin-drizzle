import { readFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url)))
const encodedName = manifest.name.startsWith('@')
  ? manifest.name.replace('/', '%2f')
  : manifest.name
const url = `https://registry.npmjs.org/${encodedName}/${manifest.version}`
const response = await fetch(url, { headers: { accept: 'application/json' } })

if (response.status === 404) {
  console.log(`${manifest.name}@${manifest.version}: confirmed E404 (unpublished)`)
  process.exit(0)
}

const body = (await response.text()).slice(0, 500)
if (response.ok) {
  console.error(`::error::${manifest.name}@${manifest.version} already exists on npm`)
} else {
  console.error(`::error::expected E404, received HTTP ${response.status}: ${body}`)
}
process.exit(1)
