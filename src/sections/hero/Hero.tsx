import { useRef } from "react";
import Magnet from "../../components/Magnet";
import Noise from "../../components/Noise";
import { RollNumber } from "../../components/RollNumber";
import { Rotator } from "../../components/Rotator";
import { NEXT_BUSINESSES, RUN } from "../../data/kosMelati";
import { MM_RUN } from "../../data/minimarket";
import { START_URL } from "../../lib/app";
import { SplitText, T, gsap, useGSAP, useReducedMotion } from "../../lib/motion";
import "./Hero.css";
import { HeroStage } from "./HeroStage";

const METRICS = [
  { value: RUN.builderTests, suffix: `/${RUN.builderTests}`, label: "Builder tests pass" },
  { value: RUN.specCases, suffix: `/${RUN.specCases}`, label: "Auditor checks pass" },
  { value: RUN.mutants, suffix: `/${RUN.mutants}`, label: "planted bugs caught" },
  { value: RUN.seconds, suffix: " s", decimals: 1, label: "full run on CreateOS" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const split = SplitText.create(".hero__copy h1", { type: "lines", mask: "lines" });
      gsap
        .timeline({ defaults: { duration: T.arrive, ease: "arrive" } })
        .from(".hero__copy .eyebrow", { y: 16, autoAlpha: 0 }, 0.1)
        .from(split.lines, { yPercent: 110, duration: T.headline, stagger: 0.08 }, 0.15)
        .from(".hero__copy > :not(h1):not(.eyebrow)", { y: 24, scale: 1.04, autoAlpha: 0, stagger: 0.08, transformOrigin: "0% 50%" }, 0.55)
        .from(".stage-col", { y: 40, scale: 1.04, autoAlpha: 0, duration: T.headline }, 0.35)
        .from(".metric", { y: 16, autoAlpha: 0, stagger: T.stagger }, 0.9);
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section className="hero" id="top" ref={ref} aria-labelledby="hero-title">
      <div className="hero__light" aria-hidden="true">
        <div className="hero__glow hero__glow--a" />
        <div className="hero__glow hero__glow--b" />
        <div className="hero__scrim" />
      </div>
      <Noise opacity={0.08} fps={12} blendMode="overlay" className="hero__grain" />

      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">AI agents for business operations</p>
          <h1 id="hero-title">
            Describe how your business runs. <span className="voice">Reeve's agents run it for you.</span>
          </h1>
          <p className="lede">
            A <b>Builder agent</b> turns your SOP into tested code and runs it. An <b>Auditor agent</b> checks every rule.
            Nothing touches your money until <b>you approve with your fingerprint.</b>
          </p>
          <div className="hero__ctas">
            <Magnet maxOffset={8} magnetStrength={3} padding={60} spring={{ stiffness: 170, damping: 22, mass: 1 }}>
              <a className="btn" href={START_URL}>
                Start free
              </a>
            </Magnet>
            <a className="btn btn--ghost" href="#run">
              See it run
            </a>
          </div>
          <div className="hero__live">
            <p className="hero__for">
              <span>Live on two SOPs</span>
              <a className="hero__case" href="#run">
                <span className="hero__case-dot" aria-hidden="true" />
                Kos Melati <span>{RUN.rooms} rooms, rent</span>
              </a>
              <a className="hero__case" href="#minimarket">
                <span className="hero__case-dot" aria-hidden="true" />
                Minimarket Berkah <span>{MM_RUN.items} items, stock</span>
              </a>
            </p>
            <p className="hero__for hero__next">
              Next: <Rotator words={NEXT_BUSINESSES} />
            </p>
          </div>
        </div>

        <HeroStage />
      </div>

      <div className="container">
        <dl className="hero__metrics">
          {METRICS.map((m) => (
            <div className="metric" key={m.label}>
              <dt className="metric__label">{m.label}</dt>
              <dd className="metric__value">
                <RollNumber value={m.value} decimals={m.decimals} suffix={m.suffix} delay={0.7} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="caption hero__source">From the Kos Melati run on CreateOS, {RUN.date}. Nothing on this page is mocked data.</p>
      </div>
    </section>
  );
}
