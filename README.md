# @aihu-plugin/drizzle

> **Aihu** — agentic discovery and interaction, for human purpose.

Drizzle ORM data adapter for aihu — typed createResource fetchers and defineLoader helpers (Postgres / SQLite / libSQL).

Part of the **meta-framework** layer of Aihu. Provides whole-app capability — file-based routing, SSR, loaders, cookies — without the boilerplate other meta-frameworks impose. See the [Aihu documentation](https://aihu.dev) for the meta-framework contract.

<!-- BEGIN_HANDWRITTEN: prose -->
Server-only. Wraps a Drizzle query into the two data-access shapes aihu uses:

```ts
import { drizzle } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import { createResource } from '@aihu-plugin/data'
import { defineRoute } from '@aihu/server'
import { createDrizzleResource, drizzleLoader } from '@aihu-plugin/drizzle'

const db = drizzle(client)

// 1. A createResource-compatible fetcher: (key: string) => Promise<T>
const fetchUser = createDrizzleResource(
  db,
  (db, id: number) => db.select().from(users).where(eq(users.id, id)),
  { parseKey: Number },
)
const user = createResource(idSignal, fetchUser)

// 2. A defineLoader for SSR routes
const userLoader = drizzleLoader(db, (db, ctx) =>
  db.select().from(users).where(eq(users.id, Number(ctx.params.id))),
)
export const userRoute = defineRoute('/users/:id', handler, { loader: userLoader })
```

`drizzle-orm` and its drivers (`postgres`, `@libsql/client`) are **optional peer dependencies** referenced via `import type` only — importing this package never breaks when no Drizzle peer is installed. You supply the `db` handle; the adapter only awaits the query.

### Plugin registration

`@aihu-plugin/drizzle` also exports a `drizzle()` plugin factory that registers
the adapter under the Plugin Contract (§3, §7.1) — a `serverOnly: true`
registration shim, currently a no-op (`contributes: {}`) until query-macro
lowering lands:

```ts
// aihu.config.ts
import { drizzle } from '@aihu-plugin/drizzle'
import { defineAihuConfig } from '@aihu/server'

export default defineAihuConfig({
  plugins: [drizzle()],
})
```
<!-- END_HANDWRITTEN: prose -->

## Install

<!-- BEGIN_AUTOGEN: install -->
<!-- package metadata is checked by tests/metadata-drift.test.ts -->

```bash
npm install @aihu-plugin/drizzle
# or
bun add @aihu-plugin/drizzle
```

<sub><i>Auto-generated against `@aihu-plugin/drizzle@0.1.7`.</i></sub>

<!-- END_AUTOGEN: install -->

## Package facts

<!-- BEGIN_AUTOGEN: stats -->
<!-- package metadata is checked by tests/metadata-drift.test.ts -->

| | |
|---|---|
| **Version** | `0.1.7` |
| **Tier** | B — Meta-framework — Drizzle ORM data adapter (typed resources + loaders) |
| **Published files** | 3 entries |
| **License** | MIT |

<sub><i>Auto-generated against `@aihu-plugin/drizzle@0.1.7`.</i></sub>

<!-- END_AUTOGEN: stats -->

## Exports

<!-- BEGIN_AUTOGEN: exports -->
<!-- package metadata is checked by tests/metadata-drift.test.ts -->

| Subpath | ESM | CJS |
|---|---|---|
| `.` | `./dist/index.js` | `—` |

<sub><i>Auto-generated against `@aihu-plugin/drizzle@0.1.7`.</i></sub>

<!-- END_AUTOGEN: exports -->

## Dependencies

<!-- BEGIN_AUTOGEN: deps -->
<!-- package metadata is checked by tests/metadata-drift.test.ts -->

**Dependencies:**

- `@aihu/server` — `^0.6.0`

**Peer dependencies:**

- `drizzle-orm` — `>=0.29.0`

<sub><i>Auto-generated against `@aihu-plugin/drizzle@0.1.7`.</i></sub>

<!-- END_AUTOGEN: deps -->

## See also

<!-- BEGIN_AUTOGEN: see-also -->
<!-- package metadata is checked by tests/metadata-drift.test.ts -->

- [@aihu-plugin/data](https://www.npmjs.com/package/@aihu-plugin/data)
- [Aihu framework](https://aihu.dev)

<sub><i>Auto-generated against `@aihu-plugin/drizzle@0.1.7`.</i></sub>

<!-- END_AUTOGEN: see-also -->

## License

<!-- BEGIN_AUTOGEN: license -->
<!-- package metadata is checked by tests/metadata-drift.test.ts -->

MIT — see [LICENSE](./LICENSE).

<sub><i>Auto-generated against `@aihu-plugin/drizzle@0.1.7`.</i></sub>

<!-- END_AUTOGEN: license -->
