import { animatorModule, behaviourModule, frame, poseModule } from './engine.generated';

type Pt = { x: number; y: number; t: number };
type Step = [number, (t: number) => unknown];
interface Options {
  pose: string;
  facing: 'left' | 'right';
  act?: string;
  /** A stop on the roaming mascot's route: stays still while the roaming mascot is active. */
  asStop?: boolean;
}

const PEEK = ['peekaboo', 'woof', 'tilt', 'sneeze'];
const SNUG = ['tilt', 'love', 'sneeze', 'woof'];
const now = () => performance.now() / 1000;

/**
 * Brings a static mascot (`.pup-buddy` with its SVG and speech bubble) to life: it follows the mouse with its eyes,
 * wags, idles with small tricks, and plays a trick when clicked. Ported from the reference's PupBuddy component.
 */
export function attachPup(el: HTMLElement, { pose, facing, act, asStop = false }: Options): () => void {
  const svg = el.querySelector('svg');
  const bubble = el.querySelector<HTMLElement>('.pup-bubble');
  if (!svg || !bubble) return () => {};
  const dir = facing === 'left' ? -1 : 1;
  const d = new animatorModule.f(svg, pose, dir);
  d.wag(0.6);

  let queue: Step[] = [];
  let last = now();
  let idleSince = last;
  let bubbleUntil = 0;
  let pointer: Pt | null = null;
  let lastAct: string | null = null;
  let clicks = 0;
  let lastClick = 0;
  let playing = false;
  let playingUntil = 0;
  let running = false;

  const ctx = {
    d,
    rest: poseModule.o[pose],
    facing: dir,
    say: (text: string, secs = 1.4) => {
      bubble.textContent = text;
      bubble.dataset.show = 'true';
      bubbleUntil = now() + secs;
    },
    hearts: () => behaviourModule.m(el, el.clientWidth * (dir > 0 ? 0.7 : 0.3), 0.25 * el.clientHeight),
  };

  const frameFn = () => {
    const t = now();
    const dt = Math.min(0.05, t - last);
    last = t;
    while (queue.length && queue[0]![0] <= t) queue.shift()![1](t);
    if (playing !== t < playingUntil) {
      playing = !playing;
      el.toggleAttribute('data-playing', playing);
    }
    d.lookAt(pointer && t - pointer.t < 3 ? pointer : null);
    if (act === 'tilt' && !queue.length) d.cock(Math.sin(0.9 * t) > 0.35 ? 13 : Math.sin(0.9 * t) < -0.35 ? -10 : 0);
    if (!queue.length && t - idleSince > 9) {
      idleSince = t;
      queue = Math.random() < 0.5 ? behaviourModule.M.tilt(ctx, t) : [[t, () => d.wag(1)], [t + 2.2, () => d.wag(0.6)]];
    }
    if (bubble.dataset.show === 'true' && t > bubbleUntil) bubble.dataset.show = 'false';
    d.tick(dt, t);
  };

  const run = (want: boolean) => {
    const on = want && !(asStop && document.documentElement.dataset.pup);
    if (on === running) return;
    running = on;
    if (on) {
      last = now();
      frame.y.update(frameFn, true);
    } else frame.Y(frameFn);
  };
  const io = new IntersectionObserver(([en]) => run(Boolean(en?.isIntersecting)));
  io.observe(el);

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') pointer = { x: e.clientX, y: e.clientY, t: now() };
  };
  const onClick = () => {
    const t = now();
    clicks = t - lastClick < 0.7 ? clicks + 1 : 1;
    lastClick = t;
    const list = pose === 'peek' ? PEEK : pose === 'snug' ? SNUG : null;
    const pool = list?.filter((x) => x !== lastAct) ?? [];
    const pick: string = list ? (pool[Math.floor(Math.random() * pool.length)] as string) : behaviourModule.u(lastAct, clicks);
    lastAct = pick;
    d.reset();
    queue = behaviourModule.M[pick](ctx, t);
    playingUntil = queue[queue.length - 1]![0] + 0.4;
    idleSince = t;
  };
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') { d.petting(true); d.wag(1); }
  };
  const onLeave = () => { d.petting(false); d.wag(0.6); };

  addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('click', onClick);
  el.addEventListener('pointerenter', onEnter);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    run(false);
    el.removeAttribute('data-playing');
    io.disconnect();
    removeEventListener('pointermove', onMove);
    el.removeEventListener('click', onClick);
    el.removeEventListener('pointerenter', onEnter);
    el.removeEventListener('pointerleave', onLeave);
  };
}
