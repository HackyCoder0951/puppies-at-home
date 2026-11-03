import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatted } from './format';

const html = (text: string) => render(<p>{formatted(text)}</p>).container.innerHTML;

describe('formatted', () => {
  it('turns **bold** into bold text and star bullets into dots, and never emits HTML from the text', () => {
    expect(html('Here is **Max** now')).toBe('<p>Here is <strong>Max</strong> now</p>');
    expect(html('* one\n* two')).toBe('<p>• one\n• two</p>');
    expect(html('<img src=x onerror=alert(1)> **ok**')).toContain('&lt;img');
  });
  it('hides a half-typed bold marker while streaming', () => {
    expect(html('Meet **Ma')).toBe('<p>Meet Ma</p>');
  });
});
