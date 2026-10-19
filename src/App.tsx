import { useRef } from "react";
import { ScrollSmoother, ScrollTrigger, useGSAP, useReducedMotion } from "./lib/motion";
import { Close, Footer } from "./sections/Close";
import { FlowRun } from "./sections/FlowRun";
import { Green } from "./sections/Green";
import { Hero } from "./sections/hero/Hero";
import { Insight } from "./sections/Insight";
import { Minimarket } from "./sections/Minimarket";
import { MobileApp } from "./sections/MobileApp";
import { Models } from "./sections/Models";
import { Nav } from "./sections/Nav";
import { Problem } from "./sections/Problem";
import { Proof } from "./sections/Proof";
import { Roles } from "./sections/Roles";
import { Steps } from "./sections/Steps";
import { Trust } from "./sections/Trust";

const NAV_OFFSET = 68;

export function App() {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Smooth scrolling for the whole page, and in-page links that glide to their section.
  useGSAP(
    () => {
      if (reduced || !wrapper.current || !content.current) return;
      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current,
        content: content.current,
        smooth: 1.1,
        effects: false,
        smoothTouch: 0,
      });
      ScrollTrigger.refresh();
      const onClick = (e: MouseEvent) => {
        const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
        const id = link?.getAttribute("href");
        if (!link || !id || id === "#main") return;
        const target = id === "#top" ? 0 : document.querySelector(id);
        if (target === null) return;
        e.preventDefault();
        smoother.scrollTo(target, true, `top ${NAV_OFFSET}px`);
        history.replaceState(null, "", id);
      };
      document.addEventListener("click", onClick);
      return () => {
        document.removeEventListener("click", onClick);
        smoother.kill();
      };
    },
    { dependencies: [reduced] },
  );

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <div id="smooth-wrapper" ref={wrapper}>
        <div id="smooth-content" ref={content}>
          <main id="main">
            <Hero />
            <Problem />
            <Insight />
            <Roles />
            <Steps />
            <FlowRun />
            <Minimarket />
            <Models />
            <MobileApp />
            <Trust />
            <Proof />
            <Green />
            <Close />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
