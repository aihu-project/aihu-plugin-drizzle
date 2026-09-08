import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const configPath = process.env.NPM_CONFIG_USERCONFIG || join(process.env.HOME || '', '.npmrc')
const forbiddenEnvironment = ['NODE_AUTH_TOKEN', 'NPM_TOKEN', 'NPM_CONFIG_TOKEN']
const present = forbiddenEnvironment.filter((name) => Object.hasOwn(process.env, name))
if (present.length > 0) throw new Error(`token environment remains set: ${present.join(', ')}`)

if (existsSync(configPath)) {
  const original = readFileSync(configPath, 'utf8')
  const sanitized = original
    .split('\n')
    .filter((line) => !/(?:_authToken|_auth|token)\s*=|NODE_AUTH_TOKEN/i.test(line))
    .join('\n')
  if (sanitized !== original) writeFileSync(configPath, sanitized)
  if (/(?:_authToken|_auth|token)\s*=|NODE_AUTH_TOKEN/i.test(sanitized)) {
    throw new Error(`auth token configuration remains in ${configPath}`)
  }
}
console.log(`OIDC publish auth configuration is token-free: ${configPath}`)
