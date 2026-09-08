import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const archive = process.argv[2]
if (!archive) throw new Error('usage: node scripts/consumer-smoke.mjs package.tgz')
const dir = mkdtempSync(join(tmpdir(), 'aihu-plugin-drizzle-consumer-'))
execFileSync('npm', ['init', '-y'], { cwd: dir, stdio: 'ignore' })
execFileSync('npm', ['install', '--ignore-scripts', resolve(archive)], { cwd: dir, stdio: 'inherit' })
execFileSync('node', ['--input-type=module', '-e', `
  const mod = await import('@aihu-plugin/drizzle')
  if (typeof mod.createDrizzleResource !== 'function' || typeof mod.drizzleLoader !== 'function' || typeof mod.drizzle !== 'function') throw new Error('missing public export')
  const fetcher = mod.createDrizzleResource({}, async (_db, key) => 'row:' + key)
  if (await fetcher('consumer') !== 'row:consumer') throw new Error('runtime export failed')
`], { cwd: dir, stdio: 'inherit' })
console.log(`isolated consumer passed in ${dir}`)
