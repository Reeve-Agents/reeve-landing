import { useEffect, useRef, useState } from "react";
import { T, gsap, useReducedMotion } from "../lib/motion";

/** Swaps one word for the next: the old word leaves up, the new one arrives from below. */
export function Rotator({ words, every = 2400 }: { words: string[]; every?: number }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      const el = ref.current;
      if (!el) return;
      gsap.to(el, {
        y: "-60%",
        scale: 0.98,
        autoAlpha: 0,
        duration: T.leave,
        ease: "leave",
        onComplete: () => {
          setI((n) => (n + 1) % words.length);
          gsap.fromTo(el, { y: "70%", scale: 1.06, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: T.arrive, ease: "arrive" });
        },
      });
    }, every);
    return () => window.clearInterval(id);
  }, [reduced, every, words.length]);

  return (
    <span className="rotator">
      <span className="sr-only">{words.join(", ")}</span>
      <span className="rotator__word" ref={ref} aria-hidden="true">
        {reduced ? words[words.length - 1] : words[i]}
      </span>
    </span>
  );
}
