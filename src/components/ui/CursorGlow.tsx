"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const CLICKABLE =
  "a,button,[role='button'],input,select,textarea,label[for],[data-cursor-glow]";

/** Amber cursor follower (desktop, fine pointer only). */
export function CursorGlow() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const scale = useRef(1);
  const targetScale = useRef(1);
  const rafRef = useRef(0);
  const ready = useRef(false);

  useEffect(() => {
    if (reduceMotion === true) return;

    const mqFine = window.matchMedia("(pointer: fine)");
    const mqWide = window.matchMedia("(min-width: 1024px)");
    const isOn = () => mqFine.matches && mqWide.matches;

    const syncClass = () => {
      document.documentElement.classList.toggle("cursor-glow-enabled", isOn());
    };

    const resetVisibility = () => {
      ready.current = false;
      if (rootRef.current) rootRef.current.style.opacity = "0";
    };

    const onMq = () => {
      syncClass();
      if (!isOn()) resetVisibility();
    };

    syncClass();
    mqFine.addEventListener("change", onMq);
    mqWide.addEventListener("change", onMq);

    const setInteractive = (clientX: number, clientY: number) => {
      const el = document.elementFromPoint(clientX, clientY);
      targetScale.current = el?.closest(CLICKABLE) ? 1.38 : 1;
    };

    const onMove = (e: MouseEvent) => {
      if (!isOn()) return;
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      setInteractive(e.clientX, e.clientY);
      if (!ready.current) {
        pos.current.x = e.clientX;
        pos.current.y = e.clientY;
        ready.current = true;
        if (rootRef.current) rootRef.current.style.opacity = "1";
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      const on = isOn();
      if (on && ready.current) {
        pos.current.x = lerp(pos.current.x, target.current.x, 0.15);
        pos.current.y = lerp(pos.current.y, target.current.y, 0.15);
        scale.current = lerp(scale.current, targetScale.current, 0.14);

        const root = rootRef.current;
        const dot = dotRef.current;
        if (root) {
          root.style.transform = `translate3d(${pos.current.x}px,${pos.current.y}px,0)`;
        }
        if (dot) {
          dot.style.transform = `translate(-50%, -50%) scale(${scale.current})`;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      mqFine.removeEventListener("change", onMq);
      mqWide.removeEventListener("change", onMq);
      document.documentElement.classList.remove("cursor-glow-enabled");
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      resetVisibility();
    };
  }, [reduceMotion]);

  if (reduceMotion === true) return null;

  return (
    <div ref={rootRef} className="cursor-glow-root" style={{ opacity: 0 }} aria-hidden>
      <div ref={dotRef} className="cursor-glow-dot" />
    </div>
  );
}
