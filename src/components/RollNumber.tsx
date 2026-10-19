import { useRef } from "react";
import { T, gsap, useGSAP, useReducedMotion } from "../lib/motion";

type Props = { value: number; decimals?: number; prefix?: string; suffix?: string; group?: boolean; className?: string; delay?: number };

/** A real figure that rolls up to its value over 900ms the first time it scrolls into view. */
export function RollNumber({ value, decimals = 0, prefix = "", suffix = "", group = false, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  // group: thousands separators, as rupiah are written ("Rp64,800").
  const format = (v: number) => `${prefix}${group ? Math.round(v).toLocaleString("en-US") : v.toFixed(decimals)}${suffix}`;
  const final = format(value);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;
      const n = { v: 0 };
      gsap.to(n, {
        v: value,
        duration: T.roll,
        delay,
        ease: "arrive",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onStart: () => {
          el.textContent = format(0);
        },
        onUpdate: () => {
          el.textContent = format(n.v);
        },
      });
    },
    { dependencies: [value, decimals, prefix, suffix, group, reduced] },
  );

  return (
    <span ref={ref} className={className} aria-label={final}>
      {final}
    </span>
  );
}
