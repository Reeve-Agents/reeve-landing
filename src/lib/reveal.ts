import type { RefObject } from "react";
import { ARRIVE_FROM, ARRIVE_TO, ScrollTrigger, SplitText, T, gsap, useGSAP, useReducedMotion } from "./motion";

/**
 * Elements marked `data-reveal` inside the scope arrive (from 1.06× and 24px below) as they
 * scroll in. Headlines marked `data-split` rise line by line out of a mask. The DOM renders them visible; only the script hides them, so the page is complete
 * without JavaScript and under reduced motion.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      const root = scope.current;
      if (!root || reduced) return;
      gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-split]")).forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: T.headline,
              ease: "arrive",
              stagger: 0.08,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        });
      });
      const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-reveal]"));
      if (!items.length) return;
      gsap.set(items, ARRIVE_FROM);
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { ...ARRIVE_TO, stagger: T.stagger }),
      });
    },
    { scope, dependencies: [reduced] },
  );
}
