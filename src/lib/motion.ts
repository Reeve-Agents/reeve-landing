import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useState } from "react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase, useGSAP);

// MASTER.md motion tokens. Durations in seconds for GSAP.
CustomEase.create("arrive", "0.16,1,0.3,1");
CustomEase.create("leave", "0.7,0,0.84,0");
// Moving between two resting states (the hero camera): ease in and out.
CustomEase.create("camera", "0.65,0,0.35,1");

export const T = {
  micro: 0.15,
  arrive: 0.33,
  leave: 0.22,
  camera: 0.9,
  headline: 0.7,
  roll: 0.9,
  stagger: 0.06,
} as const;

/** Arrive from oversize and slightly below; never from zero. */
export const ARRIVE_FROM = { y: 24, scale: 1.06, autoAlpha: 0 } as const;
export const ARRIVE_TO = { y: 0, x: 0, scale: 1, autoAlpha: 1, duration: T.arrive, ease: "arrive" } as const;
export const LEAVE_TO = { y: -12, scale: 0.98, autoAlpha: 0, duration: T.leave, ease: "leave" } as const;

const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** True while the element is at least partly on screen. */
export function useInView<T extends Element>(ref: React.RefObject<T | null>, rootMargin = "0px"): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

export { gsap, ScrollSmoother, ScrollTrigger, SplitText, useGSAP };
