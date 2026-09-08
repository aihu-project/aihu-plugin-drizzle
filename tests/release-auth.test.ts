import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'

test('release workflow cannot regress to setup-node token auth', () => {
  const workflow = readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8')
  expect(workflow).toContain('npm@11.5.1')
  expect(workflow).not.toContain('registry-url:')
  expect(workflow).toContain('unset NODE_AUTH_TOKEN NPM_TOKEN NPM_CONFIG_TOKEN')
  expect(workflow).toContain('npm publish "${{ steps.pack.outputs.tarball }}"')
  expect(workflow).not.toMatch(/find .*\.tgz/)
})

test('OIDC auth sanitizer removes dummy token config and rejects token env', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aihu-plugin-drizzle-auth-'))
  const config = join(dir, '.npmrc')
  writeFileSync(config, 'registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n')
  const script = new URL('../scripts/sanitize-oidc-auth.mjs', import.meta.url).pathname
  const clean = spawnSync(process.execPath, [script], {
    env: { ...process.env, NPM_CONFIG_USERCONFIG: config, NODE_AUTH_TOKEN: undefined, NPM_TOKEN: undefined, NPM_CONFIG_TOKEN: undefined },
    encoding: 'utf8',
  })
  expect(clean.status).toBe(0)
  expect(readFileSync(config, 'utf8')).not.toMatch(/authToken|NODE_AUTH_TOKEN/i)

  const dirty = spawnSync(process.execPath, [script], {
    env: { ...process.env, NPM_CONFIG_USERCONFIG: config, NODE_AUTH_TOKEN: 'dummy' },
    encoding: 'utf8',
  })
  expect(dirty.status).not.toBe(0)
})
