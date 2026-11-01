// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  checkBoundaries,
  checkModuleAnatomy,
  checkThinDelivery,
  findCycle,
  importsOf,
  locate,
  moduleGraph,
  resolveRelative,
} from './rules';

/** The rules are tested with synthetic violations so a silent checker cannot pass unnoticed. */
const f = (path: string, source: string) => ({ path, source });
const rulesOf = (files: ReturnType<typeof f>[]) => checkBoundaries(files).map((x) => x.rule);

describe('importsOf', () => {
  it('reads static, re-export, type and dynamic imports', () => {
    const src = `
      import a from 'react';
      import type { B } from "@shared/kernel";
      import { c } from './c';
      export * from '../d';
      export { e } from "./e";
      const x = await import('next/image');
    `;
    expect(importsOf(src)).toEqual(
      expect.arrayContaining(['react', '@shared/kernel', './c', '../d', './e', 'next/image']),
    );
  });
});

describe('locate and resolveRelative', () => {
  it('places files in module layers', () => {
    expect(locate('src/modules/catalog/domain/x.ts')).toMatchObject({ module: 'catalog', layer: 'domain' });
    expect(locate('src/shared/kernel/a.ts').area).toBe('shared');
    expect(locate('src/app/(site)/page.tsx').area).toBe('app');
  });
  it('resolves relative paths', () => {
    expect(resolveRelative('src/modules/catalog/domain/a.ts', '../application/b')).toBe(
      'src/modules/catalog/application/b',
    );
    expect(resolveRelative('src/modules/catalog/domain/a.ts', './b')).toBe('src/modules/catalog/domain/b');
  });
});

describe('checkBoundaries detects violations', () => {
  it('domain importing a framework package', () => {
    expect(rulesOf([f('src/modules/catalog/domain/a.ts', "import React from 'react';")])).toContain('domain-purity');
    expect(rulesOf([f('src/modules/catalog/domain/a.ts', "import { z } from 'zod';")])).toContain('domain-purity');
  });
  it('domain importing application, platform or another module', () => {
    expect(rulesOf([f('src/modules/catalog/domain/a.ts', "import x from '../application/u';")])).toContain('domain-purity');
    expect(rulesOf([f('src/modules/catalog/domain/a.ts', "import x from '@platform/logger';")])).toContain('domain-purity');
    expect(rulesOf([f('src/modules/catalog/domain/a.ts', "import x from '@modules/content';")])).toContain('domain-purity');
  });
  it('application importing infrastructure or presentation', () => {
    expect(rulesOf([f('src/modules/catalog/application/u.ts', "import m from '../infrastructure/mock/repo';")])).toContain('layer-direction');
    expect(rulesOf([f('src/modules/catalog/application/u.ts', "import m from '../presentation/Card';")])).toContain('layer-direction');
  });
  it('presentation importing infrastructure', () => {
    expect(rulesOf([f('src/modules/catalog/presentation/Card.tsx', "import r from '../infrastructure/mock/repo';")])).toContain('layer-direction');
  });
  it('infrastructure importing presentation', () => {
    expect(rulesOf([f('src/modules/catalog/infrastructure/r.ts', "import C from '../presentation/Card';")])).toContain('layer-direction');
  });
  it('shared importing a module', () => {
    expect(rulesOf([f('src/shared/ui/Button.tsx', "import { x } from '@modules/catalog';")])).toContain('shared-independence');
  });
  it('deep alias import into a module, except from composition', () => {
    expect(rulesOf([f('src/app/(site)/page.tsx', "import { P } from '@modules/catalog/domain/Puppy';")])).toContain('module-public-api');
    expect(rulesOf([f('src/composition/container.ts', "import { R } from '@modules/catalog/infrastructure/mock/repo';")])).not.toContain('module-public-api');
  });
  it('relative import reaching another module', () => {
    expect(rulesOf([f('src/modules/catalog/application/u.ts', "import x from '../../content/domain/Faq';")])).toContain('module-boundary');
  });
  it('module importing its own public API', () => {
    expect(rulesOf([f('src/modules/catalog/presentation/C.tsx', "import { m } from '@modules/catalog';")])).toContain('module-self-import');
  });
  it('process.env outside shared/config', () => {
    expect(rulesOf([f('src/modules/catalog/application/u.ts', 'const x = process.env.FOO;')])).toContain('env-access');
    expect(rulesOf([f('src/shared/config/env.ts', 'parse(process.env);')])).not.toContain('env-access');
  });
  it('allows valid imports', () => {
    expect(
      checkBoundaries([
        f('src/modules/catalog/application/u.ts', "import type { Puppy } from '../domain/Puppy'; import { ok } from '@shared/kernel';"),
        f('src/modules/catalog/presentation/Card.tsx', "import { X } from '../application/dto'; import { Button } from '@shared/ui'; import { y } from '@modules/content';"),
        f('src/app/(site)/page.tsx', "import { m } from '@modules/catalog';"),
      ]),
    ).toEqual([]);
  });
});

describe('module graph', () => {
  it('detects a cycle', () => {
    const g = moduleGraph([
      f('src/modules/a/application/x.ts', "import {} from '@modules/b';"),
      f('src/modules/b/application/y.ts', "import {} from '@modules/a';"),
    ]);
    expect(findCycle(g)).toEqual(expect.arrayContaining(['a', 'b']));
  });
  it('accepts a DAG', () => {
    const g = moduleGraph([
      f('src/modules/a/application/x.ts', "import {} from '@modules/b';"),
      f('src/modules/b/application/y.ts', "import {} from '@shared/kernel';"),
    ]);
    expect(findCycle(g)).toBeUndefined();
  });
});

describe('thin delivery', () => {
  it('flags long pages', () => {
    const long = Array.from({ length: 60 }, (_, i) => `const a${i} = ${i};`).join('\n');
    expect(checkThinDelivery([f('src/app/(site)/page.tsx', long)]).map((x) => x.rule)).toContain('thin-pages');
  });
  it('accepts short pages and ignores comments', () => {
    expect(checkThinDelivery([f('src/app/(site)/page.tsx', '// c\nexport default function P() { return null; }')])).toEqual([]);
  });
});

describe('module anatomy', () => {
  it('reports missing files and layers', () => {
    const v = checkModuleAnatomy(['src/modules/x/domain/index.ts', 'src/modules/x/index.ts']);
    const details = v.map((x) => x.detail);
    expect(details).toEqual(expect.arrayContaining(['missing module.config.ts', 'missing README.md', 'missing layer folder application']));
  });
  it('accepts a complete module', () => {
    const base = 'src/modules/x/';
    const paths = ['index.ts', 'module.config.ts', 'README.md', 'domain/i.ts', 'application/i.ts', 'infrastructure/i.ts', 'presentation/i.ts'].map((p) => base + p);
    expect(checkModuleAnatomy(paths)).toEqual([]);
  });
});
