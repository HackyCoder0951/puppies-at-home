// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { loadAllPaths, loadSourceFiles } from './helpers';
import { checkBoundaries, checkModuleAnatomy, checkThinDelivery, findCycle, moduleGraph } from './rules';

/** T-ARCH-01 to T-ARCH-08 against the real source tree (docs/06-quality/15-test-and-qa-plan.md section 2.8). */
describe('architecture rules on the real tree', () => {
  const files = loadSourceFiles();

  it('finds source files to check', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('respects layer, module and shared boundaries (T-ARCH-01, 02, 06)', () => {
    expect(checkBoundaries(files)).toEqual([]);
  });

  it('keeps the module dependency graph acyclic (T-ARCH-03)', () => {
    expect(findCycle(moduleGraph(files))).toBeUndefined();
  });

  it('keeps pages and route handlers thin (T-ARCH-04)', () => {
    expect(checkThinDelivery(files)).toEqual([]);
  });

  it('gives every module the standard anatomy (T-ARCH-05)', () => {
    expect(checkModuleAnatomy(loadAllPaths())).toEqual([]);
  });
});
