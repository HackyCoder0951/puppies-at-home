/**
 * Architecture rules for the modular monolith (docs/02-architecture/21-modular-monolith-architecture.md section 6).
 * Pure functions: they take file paths and sources and return violations, so they can be tested
 * with synthetic inputs and run against the real tree.
 */
export interface SourceFile {
  /** Path relative to the repository root, using forward slashes, for example `src/modules/catalog/domain/x.ts`. */
  readonly path: string;
  readonly source: string;
  /** Which root the file lives in; backend files may not import app-only layers. */
  readonly origin?: 'app' | 'backend';
}

export interface Violation {
  readonly rule: string;
  readonly path: string;
  readonly detail: string;
}

const MODULE_LAYERS = ['domain', 'application', 'infrastructure', 'presentation'] as const;
type Layer = (typeof MODULE_LAYERS)[number];

const FRAMEWORK_PATTERNS = [/^react($|\/)/, /^react-dom($|\/)/, /^next($|\/)/, /^zod($|\/)/, /^@supabase\//];

/** Extracts import specifiers from `import`, `export ... from` and dynamic `import()` statements. */
export function importsOf(source: string): string[] {
  const out: string[] = [];
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[\w*\s{},$]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bexport\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    for (const m of source.matchAll(re)) {
      if (m[1]) out.push(m[1]);
    }
  }
  return out;
}

interface Location {
  readonly module?: string;
  readonly layer?: Layer;
  readonly area: 'module' | 'shared' | 'platform' | 'navigation' | 'composition' | 'app' | 'other';
}

export function locate(path: string): Location {
  const m = /^src\/modules\/([^/]+)\/([^/]+)/.exec(path);
  if (m) {
    const layer = (MODULE_LAYERS as readonly string[]).includes(m[2] ?? '') ? (m[2] as Layer) : undefined;
    return { module: m[1], layer, area: 'module' };
  }
  if (path.startsWith('src/shared/')) return { area: 'shared' };
  if (path.startsWith('src/platform/')) return { area: 'platform' };
  if (path.startsWith('src/navigation/')) return { area: 'navigation' };
  if (path.startsWith('src/composition/')) return { area: 'composition' };
  if (path.startsWith('src/app/')) return { area: 'app' };
  return { area: 'other' };
}

/** Resolves a relative import to a repository-relative path without extension handling. */
export function resolveRelative(fromPath: string, spec: string): string {
  const parts = fromPath.split('/').slice(0, -1);
  for (const seg of spec.split('/')) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

const isTest = (path: string) => /\.test\.[tj]sx?$/.test(path);

export function checkBoundaries(files: readonly SourceFile[]): Violation[] {
  const v: Violation[] = [];
  const add = (rule: string, path: string, detail: string) => v.push({ rule, path, detail });

  for (const f of files) {
    if (!f.path.startsWith('src/')) continue;
    const here = locate(f.path);
    const test = isTest(f.path);

    for (const spec of importsOf(f.source)) {
      const relTarget = spec.startsWith('.') ? resolveRelative(f.path, spec) : undefined;
      const target = relTarget ? locate(relTarget) : undefined;

      // A-1 domain purity
      if (here.layer === 'domain' && !test) {
        if (FRAMEWORK_PATTERNS.some((re) => re.test(spec))) {
          add('domain-purity', f.path, `domain imports framework package "${spec}"`);
        }
        if (/^@(platform|nav|composition|modules)\b/.test(spec)) {
          add('domain-purity', f.path, `domain imports "${spec}"; domain may use only shared kernel and lib`);
        }
        if (target?.layer && target.layer !== 'domain') {
          add('domain-purity', f.path, `domain imports ${target.layer} layer via "${spec}"`);
        }
      }

      // A-2 application must not depend on infrastructure or presentation
      if (here.layer === 'application' && !test) {
        if (target?.layer === 'infrastructure' || target?.layer === 'presentation') {
          add('layer-direction', f.path, `application imports ${target.layer} via "${spec}"`);
        }
        if (FRAMEWORK_PATTERNS.some((re) => re.test(spec)) && !/^zod($|\/)/.test(spec)) {
          add('layer-direction', f.path, `application imports framework package "${spec}"`);
        }
      }

      // A-3 presentation must not import infrastructure; infrastructure must not import presentation
      if (here.layer === 'presentation' && !test) {
        if (target?.layer === 'infrastructure' || /^@modules\/[^/]+\/infrastructure/.test(spec)) {
          add('layer-direction', f.path, `presentation imports infrastructure via "${spec}"`);
        }
      }
      if (here.layer === 'infrastructure' && !test) {
        if (target?.layer === 'presentation' || /^@modules\/[^/]+\/presentation/.test(spec)) {
          add('layer-direction', f.path, `infrastructure imports presentation via "${spec}"`);
        }
      }

      // A-4 shared knows no business concepts
      if (here.area === 'shared' && /^@(modules|platform|nav|composition)\b/.test(spec)) {
        add('shared-independence', f.path, `shared imports "${spec}"`);
      }
      if (here.area === 'platform' && /^@(modules|nav|composition)\b/.test(spec)) {
        add('platform-independence', f.path, `platform imports "${spec}"`);
      }

      // A-5 no deep alias imports into another module (only composition and tests may)
      const deep = /^@modules\/([^/]+)\/(.+)$/.exec(spec);
      if (deep && here.area !== 'composition' && !test) {
        add('module-public-api', f.path, `deep import "${spec}"; import "@modules/${deep[1]}" instead`);
      }

      // A-6 relative imports must not leave the module
      if (relTarget && here.area === 'module' && here.module) {
        if (target?.area === 'module' && target.module !== here.module) {
          add('module-boundary', f.path, `relative import "${spec}" reaches module "${target.module}"`);
        }
      }

      // A-7 a module's own code does not import its own public barrel through the alias
      if (here.area === 'module' && here.module && new RegExp(`^@modules/${here.module}$`).test(spec) && !test) {
        add('module-self-import', f.path, `module imports its own public API "${spec}"; use relative imports inside a module`);
      }
    }

    // A-10 the backend root never imports the app root (UI, navigation, composition, app modules)
    if (f.origin === 'backend') {
      for (const spec of importsOf(f.source)) {
        if (/^@(shared|nav|composition|modules)\b/.test(spec)) add('backend-independence', f.path, `backend code imports "${spec}"; the backend must not depend on app/`);
      }
    }

    // A-9 backend SDKs live in platform, the adapters folder and infrastructure/supabase adapters only
    {
      for (const spec of importsOf(f.source)) {
        if (/^@supabase\//.test(spec) || /^@upstash\//.test(spec)) {
          const allowed = f.path.startsWith('src/platform/') || f.path.startsWith('src/adapters/') || /^src\/modules\/[^/]+\/infrastructure\/supabase\//.test(f.path) || test;
          if (!allowed) add('sdk-boundary', f.path, `"${spec}" may only be imported in src/platform, src/adapters or a module's infrastructure/supabase adapter`);
        }
        // service-role client only in cron, webhook, bootstrap and the platform itself
        if (/platform\/supabase\/service|@platform\/supabase\/service/.test(spec)) {
          const ok = /^src\/app\/api\/(internal|webhooks)\//.test(f.path) || f.path.startsWith('src/platform/') || /^scripts\//.test(f.path) || test;
          if (!ok) add('service-role', f.path, 'the service-role client may only be used in cron, webhook and bootstrap code');
        }
      }
    }

    // A-8 only shared/config reads the environment
    if (/\bprocess\.env\b/.test(f.source) && !f.path.startsWith('src/shared/config/') && !f.path.startsWith('src/config/') && !test) {
      add('env-access', f.path, 'process.env is read outside src/shared/config');
    }
  }
  return v;
}

/** Module dependency graph through public-API imports (`@modules/<name>`). */
export function moduleGraph(files: readonly SourceFile[]): Map<string, Set<string>> {
  const g = new Map<string, Set<string>>();
  for (const f of files) {
    const here = locate(f.path);
    if (here.area !== 'module' || !here.module || isTest(f.path)) continue;
    g.set(here.module, g.get(here.module) ?? new Set());
    for (const spec of importsOf(f.source)) {
      const m = /^@modules\/([^/]+)/.exec(spec);
      if (m?.[1] && m[1] !== here.module) g.get(here.module)?.add(m[1]);
    }
  }
  return g;
}

/** Returns one cycle (as a list of module names) or undefined if the graph is acyclic. */
export function findCycle(graph: ReadonlyMap<string, ReadonlySet<string>>): string[] | undefined {
  const state = new Map<string, 'visiting' | 'done'>();
  const stack: string[] = [];
  const visit = (n: string): string[] | undefined => {
    if (state.get(n) === 'done') return undefined;
    if (state.get(n) === 'visiting') return [...stack.slice(stack.indexOf(n)), n];
    state.set(n, 'visiting');
    stack.push(n);
    for (const next of graph.get(n) ?? []) {
      const c = visit(next);
      if (c) return c;
    }
    stack.pop();
    state.set(n, 'done');
    return undefined;
  };
  for (const n of graph.keys()) {
    const c = visit(n);
    if (c) return c;
  }
  return undefined;
}

const codeLines = (source: string) =>
  source
    .split('\n')
    .filter((l) => l.trim() !== '' && !/^\s*(\/\/|\/\*|\*)/.test(l)).length;

/** Routing shell stays thin: pages and route handlers hold no business logic. */
export function checkThinDelivery(files: readonly SourceFile[], maxPageLines = 40, maxHandlerLines = 60): Violation[] {
  const v: Violation[] = [];
  for (const f of files) {
    if (/^src\/app\/.*\/page\.tsx$/.test(f.path) || f.path === 'src/app/page.tsx') {
      const n = codeLines(f.source);
      if (n > maxPageLines) v.push({ rule: 'thin-pages', path: f.path, detail: `${n} code lines (max ${maxPageLines})` });
    }
    if (/^src\/app\/.*\/route\.ts$/.test(f.path)) {
      const n = codeLines(f.source);
      if (n > maxHandlerLines) v.push({ rule: 'thin-handlers', path: f.path, detail: `${n} code lines (max ${maxHandlerLines})` });
    }
  }
  return v;
}

/** Each module must have the standard anatomy (docs/02-architecture/21 section 4). */
export function checkModuleAnatomy(paths: readonly string[]): Violation[] {
  const v: Violation[] = [];
  const set = new Set(paths);
  const modules = new Set(paths.map((p) => /^src\/modules\/([^/]+)\//.exec(p)?.[1]).filter(Boolean) as string[]);
  for (const m of modules) {
    for (const required of ['index.ts', 'module.config.ts', 'README.md']) {
      if (!set.has(`src/modules/${m}/${required}`)) {
        v.push({ rule: 'module-anatomy', path: `src/modules/${m}`, detail: `missing ${required}` });
      }
    }
    for (const layer of MODULE_LAYERS) {
      if (![...set].some((p) => p.startsWith(`src/modules/${m}/${layer}/`))) {
        v.push({ rule: 'module-anatomy', path: `src/modules/${m}`, detail: `missing layer folder ${layer}` });
      }
    }
  }
  return v;
}
