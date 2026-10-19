import { useRef } from "react";
import Magnet from "../components/Magnet";
import SplitText from "../components/SplitText";
import { gsap, useGSAP, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./Close.css";

export function Close() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useReveal(ref);

  // The R comes into focus as the section scrolls in: the blurred copy fades as the sharp one lands.
  useGSAP(
    () => {
      if (reduced) return;
      gsap
        .timeline({ scrollTrigger: { trigger: ".close__mark", start: "top 85%", end: "center 50%", scrub: 1 } })
        .fromTo(".close__r--soft", { opacity: 1, scale: 1.06 }, { opacity: 0, scale: 1, ease: "none" }, 0)
        .fromTo(".close__r--sharp", { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, ease: "none" }, 0);
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section className="scene close" id="close" ref={ref} aria-label="Your operations, run on your behalf">
      <div className="close__glow" aria-hidden="true" />
      <div className="container close__grid">
        <div className="close__mark" aria-hidden="true">
          <span className="close__r close__r--soft">R</span>
          <span className="close__r close__r--sharp">R</span>
        </div>
        <div className="close__copy">
          <p className="close__def" data-reveal>
            <span className="voice">reeve (n.)</span> the official who ran an estate on the owner's behalf, and answered for
            every coin.
          </p>
          <SplitText
            tag="h2"
            text="Your operations, run on your behalf."
            className="close__title"
            splitType="words"
            mask
            effect="rise"
            from={{ yPercent: 110, opacity: 1 }}
            to={{ yPercent: 0, opacity: 1 }}
            ease="arrive"
            duration={0.7}
            delay={60}
            textAlign="left"
          />
          <div className="close__ctas" data-reveal>
            <Magnet maxOffset={8} magnetStrength={3} padding={60} spring={{ stiffness: 170, damping: 22, mass: 1 }}>
              <a className="btn" href="#run">
                See it run
              </a>
            </Magnet>
            <a className="btn btn--ghost" href="#top">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__brand">REEVE</span>
        <p className="footer__line">Built for the CreateOS × Stripe hackathon, 2026. Runs on CreateOS sandboxes and Claude.</p>
        <nav aria-label="Footer">
          <ul className="footer__links">
            <li>
              <a href="#how">How it works</a>
            </li>
            <li>
              <a href="#trust">Trust</a>
            </li>
            <li>
              <a href="#proof">Proof</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
