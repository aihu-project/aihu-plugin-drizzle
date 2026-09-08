import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

// package.json and the generated README facts share a version/name seam that
// an import graph cannot see. Keep the tracked docs honest when preparing a
// patch release from this standalone repository.
test('README generated facts match package metadata', () => {
  const root = resolve(import.meta.dirname, '..')
  const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  const readme = readFileSync(resolve(root, 'README.md'), 'utf8')
  expect(readme).toContain(`@aihu-plugin/drizzle@${packageJson.version}`)
  expect(readme).toContain(`| **Version** | \`${packageJson.version}\` |`)
  expect(readme).not.toContain('workspace:')
})
