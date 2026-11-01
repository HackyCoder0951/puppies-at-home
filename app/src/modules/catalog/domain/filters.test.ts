import { describe, expect, it } from 'vitest';
import { isSelected, parseFilter, toggleFilter } from './filters';

describe('filter URL handling', () => {
  it('parses params and ignores bad values', () => {
    expect(parseFilter({ origin: 'mars', sex: ['male', 'x'], breed: 'Shih Tzu' })).toEqual({
      origin: undefined, collections: [], breeds: ['shih-tzu'], sexes: ['male'],
    });
    expect(parseFilter({ origin: 'imported' }).origin).toBe('imported');
  });
  it('toggles values and treats origin as single select', () => {
    const f = toggleFilter({}, 'breeds', 'maltipoo');
    expect(isSelected(f, 'breeds', 'maltipoo')).toBe(true);
    expect(toggleFilter(f, 'breeds', 'maltipoo').breeds).toEqual([]);
    expect(toggleFilter({ origin: 'imported' }, 'origin', 'imported').origin).toBeUndefined();
    expect(toggleFilter({ origin: 'imported' }, 'origin', 'local').origin).toBe('local');
  });
});
