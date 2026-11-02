'use client';

import { useEffect } from 'react';

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

/** "Meet the pups": on wide screens the scene pins and the door track slides sideways as you scroll (ported from the reference). */
function useMeet() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.tp-meet');
    const range = section?.querySelector<HTMLElement>('[data-pin-range]');
    const track = section?.querySelector<HTMLElement>('.tp-meet__track');
    const hall = section?.querySelector<HTMLElement>('.tp-meet__hall');
    if (!section || !range || !track || !hall) return;
    const doors = [...track.children] as HTMLElement[];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let overflow = 0;
    let target = 0;
    let shown = 0;
    let raf = 0;
    let pinned = false;

    const paint = (x: number, animate: boolean) => {
      track.style.transform = `translateX(${x.toFixed(1)}px)`;
      hall.style.setProperty('--floor-x', `${x.toFixed(1)}px`);
      const edge = 0.36 * innerWidth;
      doors.forEach((d) => {
        const open = d.offsetLeft + x < edge;
        if ((d.dataset.open === 'true') !== open) { d.dataset.open = String(open); void animate; }
      });
    };
    // While the scene is pinned, Teddy walks on the spot as the doors slide past (pose "walk", act "treadmill").
    const stop = section.querySelector<HTMLElement>('[data-pup-stop]');
    const setStop = (walk: boolean) => {
      if (!stop) return;
      const changed = (stop.dataset.pose === 'walk') !== walk;
      stop.dataset.pose = walk ? 'walk' : 'sit';
      if (walk) stop.dataset.act = 'treadmill'; else delete stop.dataset.act;
      if (changed) setTimeout(() => dispatchEvent(new Event('resize')), 0);
    };
    const measure = () => {
      pinned = matchMedia('(min-width: 1024px)').matches && !reduced;
      setStop(pinned);
      if (!pinned) {
        delete section.dataset.pinned; range.style.height = ''; range.style.setProperty('--pinned', '0');
        track.style.transform = ''; hall.style.removeProperty('--door-w'); hall.style.removeProperty('--floor-x');
        doors.forEach((d) => { d.dataset.open = 'true'; });
        return;
      }
      section.dataset.pinned = 'true';
      overflow = Math.max(0, track.scrollWidth - innerWidth);
      range.style.height = `calc(100vh + ${Math.round(0.8 * overflow)}px)`;
      range.style.setProperty('--pinned', '1');
      const head = range.querySelector<HTMLElement>('.tp-meet__head');
      const plate = Math.max(64, ...[...track.querySelectorAll<HTMLElement>('.tp-door__plate')].map((e) => e.offsetHeight));
      const floor = hall.querySelector<HTMLElement>('.tp-meet__floor')?.offsetHeight ?? 0;
      const w = Math.max(128, Math.min(256, 0.15 * innerWidth, (range.clientHeight - (head ? head.offsetTop + head.offsetHeight : 0) - floor - plate - 40) / 1.3));
      hall.style.setProperty('--door-w', `${w.toFixed(0)}px`);
      overflow = Math.max(0, track.scrollWidth - innerWidth);
      onScroll();
    };
    const onScroll = () => {
      if (!pinned) return;
      const r = range.getBoundingClientRect();
      target = -clamp(-r.top / Math.max(1, r.height - innerHeight)) * overflow;
      if (!raf) raf = requestAnimationFrame(step);
    };
    const step = () => {
      shown += (target - shown) * 0.18;
      if (Math.abs(target - shown) < 0.4) shown = target;
      paint(shown, true);
      raf = shown === target ? 0 : requestAnimationFrame(step);
    };
    measure();
    shown = target;
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', measure); ro.disconnect(); };
  }, []);
}

/** "Your puppy journey": on wide screens the chat plays step by step as the steps scroll into view (ported from the reference). */
function useChat() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.tp-chat');
    const list = section?.querySelector<HTMLElement>('.tp-chat__steps');
    const screen = section?.querySelector<HTMLElement>('.tp-phone__screen');
    if (!section || !list || !screen) return;
    if (!matchMedia('(min-width: 1024px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const steps = [...list.children] as HTMLElement[];
    const groups = [...screen.querySelectorAll<HTMLElement>('.tp-msg-group')];
    const typing = screen.querySelector<HTMLElement>('.tp-typing');
    const status = section.querySelector<HTMLElement>('.tp-phone__status');
    let current = -1;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const render = (k: number, busy: boolean) => {
      steps.forEach((s, i) => {
        if (i === k) s.setAttribute('data-active', 'true'); else s.removeAttribute('data-active');
        if (i < k) s.setAttribute('data-done', 'true'); else s.removeAttribute('data-done');
      });
      groups.forEach((g, i) => { g.dataset.show = i < k || (i === k && !busy) ? 'true' : 'false'; });
      if (typing) typing.dataset.show = busy ? 'true' : 'false';
      if (status) status.textContent = busy ? 'typing…' : 'online';
    };
    render(-1, false);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const k = steps.indexOf(en.target as HTMLElement);
        if (k <= current) return;
        current = k;
        clearTimeout(timer);
        render(k, true);
        timer = setTimeout(() => render(k, false), 750);
      }),
      { rootMargin: '-28% 0px -62% 0px' },
    );
    steps.forEach((s) => io.observe(s));
    return () => { clearTimeout(timer); io.disconnect(); groups.forEach((g) => { g.dataset.show = 'true'; }); if (typing) typing.dataset.show = 'false'; };
  }, []);
}

/** Scroll-driven behaviour of the home page scenes. Renders nothing. */
export function HomeBehaviors() {
  useMeet();
  useChat();
  return null;
}
