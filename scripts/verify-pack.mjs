import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

const root = new URL('..', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)))
const packed = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts'], {
  cwd: root,
  encoding: 'utf8',
}))[0]
const archive = new URL(`../${packed.filename}`, import.meta.url)
const archivePath = archive.pathname
if (!existsSync(archivePath)) throw new Error(`npm pack did not create ${archivePath}`)

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
console.log(`verified ${packed.filename}: ${packedManifest.name}@${packedManifest.version}`)
