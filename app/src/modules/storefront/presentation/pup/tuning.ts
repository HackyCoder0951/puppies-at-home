/**
 * Roaming mascot tuning: edit the numbers below to change how fast Teddy moves. Nothing else needs touching.
 *
 * Teddy's position follows the scroll bar, so "speed" means how much scrolling it takes him to walk from one stop
 * to the next. More scroll per walk = slower, calmer walk; less = faster.
 *
 * Live tuning in the browser console (no rebuild): change a value and fire a resize so the route is recalculated:
 *   pupTuning.travelScale = 2; dispatchEvent(new Event('resize'))
 *
 * These values are read by pup/engine.generated.ts. If that file is ever regenerated from the reference, re-apply the
 * two patched spots (search for "pupTuning").
 */
export const pupTuning = {
  /**
   * Scroll distance per walk, as a multiple of the reference. 1 = reference speed, 1.5 = a third slower,
   * 2 = half speed, 0.7 = faster. Very large values leave Teddy no time to pause at stops (the route squeezes).
   */
  travelScale: 1.6,
  /**
   * Gait: pixels of ground per leg cycle. Larger = slower, longer strides (reference 46). Keep near 40 to 70.
   */
  stepLength: 56,
};

if (typeof window !== 'undefined') {
  (window as unknown as { pupTuning: typeof pupTuning }).pupTuning = pupTuning;
}
