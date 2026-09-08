import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const packDir = join(root, '.release', 'pack')
rmSync(packDir, { recursive: true, force: true })
mkdirSync(packDir, { recursive: true })

const result = JSON.parse(execFileSync('npm', [
  'pack', '--json', '--ignore-scripts', '--pack-destination', packDir,
], { cwd: root, encoding: 'utf8' }))
if (!Array.isArray(result) || result.length !== 1 || typeof result[0]?.filename !== 'string') {
  throw new Error('npm pack did not return exactly one archive filename')
}

const archives = readdirSync(packDir).filter((entry) => entry.endsWith('.tgz'))
if (archives.length !== 1 || archives[0] !== result[0].filename) {
  throw new Error(`pack directory does not contain exactly the captured archive: ${archives.join(', ')}`)
}

const archivePath = join(packDir, result[0].filename)
execFileSync(process.execPath, [join(root, 'scripts', 'verify-pack.mjs'), archivePath], {
  cwd: root,
  stdio: 'inherit',
})
process.stdout.write(`${archivePath}\n`)
