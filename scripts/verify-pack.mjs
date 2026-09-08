import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const archivePath = resolve(process.argv[2] ?? '')
if (!process.argv[2]) throw new Error('usage: node scripts/verify-pack.mjs .release/pack/package.tgz')
if (!existsSync(archivePath)) throw new Error(`packed archive does not exist: ${archivePath}`)

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)))

const packedManifest = JSON.parse(execFileSync('tar', ['-xOf', archivePath, 'package/package.json'], { encoding: 'utf8' }))
const fail = (message) => { throw new Error(`packed package check failed: ${message}`) }
if (packedManifest.name !== manifest.name) fail(`name ${packedManifest.name} != ${manifest.name}`)
if (packedManifest.version !== manifest.version) fail(`version ${packedManifest.version} != ${manifest.version}`)
if (packedManifest.main !== './dist/index.js') fail('main does not point to dist/index.js')
if (packedManifest.module !== './dist/index.js') fail('module does not point to dist/index.js')
if (packedManifest.types !== './dist/index.d.ts') fail('types does not point to dist/index.d.ts')
if (packedManifest.exports?.['.']?.import !== './dist/index.js') fail('ESM export does not point to dist/index.js')
if (packedManifest.exports?.['.']?.types !== './dist/index.d.ts') fail('types export does not point to dist/index.d.ts')
if (packedManifest.dependencies?.['@aihu/server'] !== manifest.dependencies['@aihu/server']) fail('published dependency range changed')
if (JSON.stringify(packedManifest).includes('workspace:')) fail('workspace dependency leaked into tarball')

const entries = execFileSync('tar', ['-tzf', archivePath], { encoding: 'utf8' }).split('\n')
for (const required of ['package/dist/index.js', 'package/dist/index.d.ts', 'package/README.md', 'package/LICENSE']) {
  if (!entries.includes(required)) fail(`missing ${required}`)
}
if (entries.some((entry) => entry.startsWith('package/src/') || entry.startsWith('package/tests/'))) fail('source or tests leaked into published files')
console.error(`verified ${archivePath}: ${packedManifest.name}@${packedManifest.version}`)
