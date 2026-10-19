import { useRef, type ReactNode } from "react";
import { Figure, type FigureName, type FigureTone } from "../components/Figure";
import { MONTH_END, RUN, SOP_LINES } from "../data/kosMelati";
import { gsap, useGSAP, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./Steps.css";

type Step = { n: string; name: string; text: string; icon: FigureName; tone?: FigureTone; detail: ReactNode };

const STEPS: Step[] = [
  {
    n: "01",
    name: "Describe",
    text: "Write the SOP the way you would brief a new manager, in chat, in your own language.",
    icon: "Keyboard",
    detail: (
      <div className="sd-chat">
        {SOP_LINES.map((l) => (
          <p key={l.mark}>
            {l.before}
            <mark>{l.mark}</mark>
            {l.after}
          </p>
        ))}
      </div>
    ),
  },
  {
    n: "02",
    name: "Compile",
    text: "Each line becomes a rule card. Anything unclear comes back to you as a question, never a guess.",
    icon: "Format",
    detail: (
      <div className="sd-cards">
        <div className="sd-card">
          <span className="sd-card__id">R3 · late fee</span>
          <span>5% of rent on day 7, once per invoice</span>
        </div>
        <div className="sd-card sd-card--q">
          <span className="sd-card__id">Question for you</span>
          <span>Is the 5% on the full rent, or on what is still unpaid?</span>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    name: "Simulate",
    text: "The Builder writes the code and replays your month in a locked sandbox before anything real happens.",
    icon: "Terminal",
    detail: (
      <div className="sd-stat">
        <strong>
          {RUN.rooms} rooms × {RUN.days} days
        </strong>
        <span>replayed in {RUN.seconds} s on CreateOS, egress locked</span>
      </div>
    ),
  },
  {
    n: "04",
    name: "Audit",
    text: "A second agent checks every rule against its own expectations, then hides bugs in the code to prove the tests catch them.",
    icon: "Sieve",
    tone: "auditor",
    detail: (
      <div className="sd-stat sd-stat--auditor">
        <strong>
          {RUN.specCases}/{RUN.specCases} checks · {RUN.mutants}/{RUN.mutants} bugs caught
        </strong>
        <span>verdict PASS</span>
      </div>
    ),
  },
  {
    n: "05",
    name: "Approve",
    text: "You see what will happen in plain words and approve with your passkey. Refunds over your limit wait for you.",
    icon: "Padlock",
    detail: (
      <div className="sd-approve">
        <span>Approve the Kos Melati rulebook?</span>
        <span className="sd-approve__btn">Approve with passkey</span>
      </div>
    ),
  },
  {
    n: "06",
    name: "Run and maintain",
    text: "Reeve runs the SOP every day. Change a rule and the whole check runs again before the change goes live.",
    icon: "Hub",
    detail: (
      <div className="sd-stat">
        <strong>
          {MONTH_END.paid} of 30 rooms settled
        </strong>
        <span>by Nov 30 in the test month · {MONTH_END.notices} still on notice for rent or fees</span>
      </div>
    ),
  },
];

export function Steps() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useReveal(ref);

  // Desktop: the section pins and the six panels slide past, one per screen of scroll.
  useGSAP(
    () => {
      if (reduced) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const track = ref.current?.querySelector<HTMLElement>(".steps__track");
        if (!track) return;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".steps__pin",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
          },
        });
        gsap.fromTo(".steps__bar", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".steps__pin", start: "top top", end: () => `+=${distance()}`, scrub: true } });
        gsap.utils.toArray<HTMLElement>(".step").forEach((panel) => {
          gsap.from(panel.querySelectorAll(".step__copy > *, .step__detail"), {
            y: 24,
            scale: 1.06,
            autoAlpha: 0,
            stagger: 0.06,
            duration: 0.33,
            ease: "arrive",
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 70%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section className="steps" id="how" ref={ref} aria-labelledby="steps-title">
      <div className="steps__pin">
        <div className="container steps__head">
          <p className="eyebrow" data-reveal>
            How it works
          </p>
          <h2 id="steps-title" data-split>
            From plain words <span className="voice">to proven operations.</span>
          </h2>
        </div>
        <div className="steps__mask">
        <ol className="steps__track">
          {STEPS.map((s) => (
            <li className="step" key={s.n}>
              <span className="step__num" aria-hidden="true">
                {s.n}
              </span>
              <div className="step__copy">
                <h3 className="step__name">
                  <span className="sr-only">Step {s.n}: </span>
                  {s.name}
                </h3>
                <p className="step__text">{s.text}</p>
              </div>
              <Figure name={s.icon} className="step__fig" plate="var(--ink)" tone={s.tone ?? "signal"} intensity={0.7} />
              <div className="step__detail">{s.detail}</div>
            </li>
          ))}
        </ol>
        </div>
        <div className="container steps__progress" aria-hidden="true">
          <span className="steps__bar" />
        </div>
      </div>
    </section>
  );
}
