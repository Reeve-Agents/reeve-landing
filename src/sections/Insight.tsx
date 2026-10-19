import { useRef } from "react";
import { Figure, type FigureName } from "../components/Figure";
import { gsap, useGSAP, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./Insight.css";

const LANE: { icon: FigureName; text: string; tone?: "auditor" }[] = [
  { icon: "Format", text: "Agent writes the rules as code" },
  { icon: "Terminal", text: "Tests and a simulation run" },
  { icon: "Sieve", text: "A second agent checks it", tone: "auditor" },
  { icon: "Padlock", text: "You approve with a passkey" },
  { icon: "Hub", text: "Then money moves" },
];

export function Insight() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useReveal(ref);

  // The maker-checker lane lights hop by hop as it crosses the middle of the screen.
  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".lane--good", start: "top 75%", end: "bottom 40%", scrub: 1 },
      });
      gsap.utils.toArray<HTMLElement>(".lane--good .node").forEach((node, i) => {
        tl.fromTo(node, { opacity: 0.35 }, { opacity: 1, duration: 0.2, ease: "none" }, i * 0.25);
        const link = node.querySelector(".node__link");
        if (link) tl.fromTo(link, { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "none" }, i * 0.25 + 0.05);
      });
      tl.fromTo(".lane--bad .lane__break", { scaleX: 1 }, { scaleX: 0.42, duration: 0.6, ease: "none" }, 0);
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section className="scene insight" id="insight" ref={ref} aria-labelledby="insight-title">
      <div className="container">
        <div className="scene__head">
          <p className="eyebrow" data-reveal>
            The idea
          </p>
          <h2 id="insight-title" data-split>
            Don't let AI touch the money. <span className="voice">Let it prove the rules.</span>
          </h2>
        </div>

        <div className="lanes">
          <div className="lane lane--bad" data-reveal>
            <span className="lane__tag">What most agents do</span>
            <div className="lane__row">
              <span className="lane__end">AI agent with your bank login</span>
              <span className="lane__wire" aria-hidden="true">
                <span className="lane__break" />
              </span>
              <Figure name="Plug" className="lane__fig" tone="danger" label="A plug that never reaches the socket" />
              <span className="lane__end">Your money</span>
            </div>
          </div>

          <div className="lane lane--good" data-reveal>
            <span className="lane__tag lane__tag--good">Reeve: maker-checker, for agents</span>
            <ol className="lane__nodes">
              {LANE.map((n, i) => (
                <li className="node" key={n.text}>
                  <Figure name={n.icon} className="node__fig" plate="var(--void)" tone={n.tone ?? "signal"} intensity={0.6} />
                  <span className="node__text">{n.text}</span>
                  {i < LANE.length - 1 && <span className="node__link" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
