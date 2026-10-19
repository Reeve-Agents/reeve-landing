import { useEffect, useRef, useState } from "react";
import { Figure } from "../components/Figure";
import { RECEIPT, RUN, TODAY } from "../data/kosMelati";
import { T, gsap, useGSAP, useInView, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./MobileApp.css";

/*
 * The owner's side lives on a phone: a web app installed from the browser (PWA). Two phones
 * show it: the day's summary for the kos, and the approval that only a fingerprint can give.
 */

type Phase = "ask" | "scan" | "done";
const PHASE_MS: Record<Phase, number> = { ask: 1600, scan: 1300, done: 2800 };
const NEXT: Record<Phase, Phase> = { ask: "scan", scan: "done", done: "ask" };

const CHIPS = ["Installs from the browser", "Daily summary", "Room status", "Payment alerts", "Bahasa or English"];

export function MobileApp() {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(stageRef);
  const [phase, setPhase] = useState<Phase>("done");
  useReveal(ref);

  // The approval loops while the phones are on screen: ask, fingerprint, approved.
  useEffect(() => {
    if (reduced || !inView) {
      setPhase("done");
      return;
    }
    const call = gsap.delayedCall(PHASE_MS[phase] / 1000, () => setPhase((p) => NEXT[p]));
    return () => void call.kill();
  }, [phase, inView, reduced]);
  useEffect(() => {
    if (inView && !reduced) setPhase("ask");
  }, [inView, reduced]);

  // Phones arrive from oversize, the summary fills in, the toast lands when approved.
  useGSAP(
    () => {
      if (reduced) return;
      gsap
        .timeline({ scrollTrigger: { trigger: ".phones", start: "top 75%", once: true } })
        .from(".ph--today", { y: 48, scale: 1.06, autoAlpha: 0, duration: 0.6, ease: "arrive" })
        .from(".ph--approve", { y: 64, scale: 1.06, autoAlpha: 0, duration: 0.6, ease: "arrive" }, 0.12)
        .from(".kpi__fill", { scaleX: 0, duration: T.roll, ease: "arrive" }, 0.45)
        .from(".today__stats > *, .feed-m li", { y: 12, autoAlpha: 0, duration: T.arrive, ease: "arrive", stagger: T.stagger }, 0.5);
    },
    { scope: ref, dependencies: [reduced] },
  );
  useGSAP(
    () => {
      if (reduced) return;
      if (phase === "done") gsap.fromTo(".toast", { y: -16, scale: 1.06, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: T.arrive, ease: "arrive" });
      else gsap.to(".toast", { y: -10, scale: 0.98, autoAlpha: 0, duration: T.leave, ease: "leave" });
    },
    { scope: ref, dependencies: [phase, reduced] },
  );

  // The phones lean up to 2° toward the pointer.
  const onMove = (e: React.PointerEvent) => {
    const el = stageRef.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      "--lx": `${(((e.clientX - r.left) / r.width - 0.5) * 4).toFixed(2)}deg`,
      "--ly": `${(-((e.clientY - r.top) / r.height - 0.5) * 4).toFixed(2)}deg`,
      duration: T.camera,
      ease: "arrive",
      overwrite: "auto",
    });
  };
  const onLeave = () => stageRef.current && gsap.to(stageRef.current, { "--lx": "0deg", "--ly": "0deg", duration: T.camera, ease: "arrive" });

  return (
    <section className="scene mobile" id="mobile" ref={ref} aria-labelledby="mobile-title">
      <div className="container mobile__grid">
        <div className="mobile__copy">
          <div className="scene__head">
            <p className="eyebrow" data-reveal>
              On your phone
            </p>
            <h2 id="mobile-title" data-split>
              Run the kos from your phone. <span className="voice">Approve with a fingerprint.</span>
            </h2>
            <p className="lede" data-reveal>
              Reeve installs from the browser like an app, with no app store. Each morning you see the day in one screen, and
              anything that touches money waits for your touch.
            </p>
          </div>

          <div className="feats">
            <article className="feat" data-reveal>
              <Figure name="Padlock" className="feat__fig" plate="var(--ink)" intensity={0.7} label="A padlock whose shackle opens" />
              <h3>Approve with your fingerprint</h3>
              <p>Passkeys, no passwords. Rule changes and refunds over your limit wait for Face ID or a fingerprint.</p>
            </article>
            <article className="feat" data-reveal>
              <Figure name="Phone" className="feat__fig" plate="var(--ink)" intensity={0.7} label="A phone shown in layers" />
              <h3>Ask in your own words</h3>
              <p>Type or say “siapa yang belum bayar?” and get the answer from the same rulebook the agents run.</p>
            </article>
          </div>

          <div className="also" data-reveal>
            <span className="eyebrow">Also in the app</span>
            <ul>
              {CHIPS.map((c) => (
                <li className="chip" key={c}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="phones" ref={stageRef} onPointerMove={onMove} onPointerLeave={onLeave}>
          {/* Phone 1: today's summary */}
          <div className="ph ph--today" role="img" aria-label={`Today screen on ${TODAY.date}: ${TODAY.collected} of ${TODAY.target} collected, ${TODAY.paid} of 30 rooms paid`}>
            <div className="ph__screen">
              <div className="ph__status" aria-hidden="true">
                <span>9:41</span>
                <span className="ph__island" />
                <span>5G</span>
              </div>
              <div className="today__head">
                <span className="today__name">Kos Melati</span>
                <span className="today__date">{TODAY.date}</span>
              </div>
              <div className="kpi">
                <span className="kpi__label">Collected this month</span>
                <span className="kpi__value">{TODAY.collected}</span>
                <span className="kpi__of">of {TODAY.target} target</span>
                <span className="kpi__track">
                  <span className="kpi__fill" style={{ transform: `scaleX(${TODAY.collectedRatio.toFixed(3)})` }} />
                </span>
                <span className="kpi__note">Below target on the 15th: Reeve told you this morning.</span>
              </div>
              <div className="today__stats">
                <span>
                  <b>{TODAY.paid}/30</b> paid
                </span>
                <span>
                  <b>{TODAY.fees}</b> late fees
                </span>
                <span>
                  <b>{TODAY.notices}</b> notices
                </span>
              </div>
              <ul className="feed-m">
                {TODAY.activity.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <nav className="tabs" aria-hidden="true">
                <span className="is-on">Today</span>
                <span>
                  Approvals <i>1</i>
                </span>
                <span>Rooms</span>
                <span>Chat</span>
              </nav>
            </div>
          </div>

          {/* Phone 2: the approval */}
          <div className={`ph ph--approve is-${phase}`} role="img" aria-label="Approval screen: approve the Kos Melati rulebook with your fingerprint">
            <div className="ph__screen">
              <div className="ph__status" aria-hidden="true">
                <span>9:41</span>
                <span className="ph__island" />
                <span>5G</span>
              </div>
              <span className="appr__eyebrow">Needs your approval</span>
              <h4 className="appr__title">Kos Melati rulebook</h4>
              <p className="appr__meta">
                8 rules · Auditor PASS · {RUN.mutants}/{RUN.mutants} planted bugs caught
              </p>
              <ul className="appr__list">
                <li>Invoices go to all 30 rooms on the 1st</li>
                <li>Late fees never pass 10% of rent</li>
                <li>Refunds over Rp500,000 come to you</li>
              </ul>
              <div className="appr__lock">
                <Figure name="Padlock" className="appr__fig" plate="var(--void)" intensity={0.9} play={phase === "scan" && !reduced} />
                <span className="appr__ring" aria-hidden="true" />
              </div>
              <span className="appr__btn">
                <span className="appr__btn-ask">Touch to approve</span>
                <span className="appr__btn-scan">Reading fingerprint</span>
                <span className="appr__btn-done">Approved</span>
              </span>
              <span className="appr__receipt">receipt {RECEIPT.receipt.slice(0, 8)}…</span>
            </div>
          </div>

          <div className="toast" role="status">
            <span className="toast__tick" aria-hidden="true" />
            <span>
              <b>Approved with fingerprint</b>
              <br />
              Signed into the ledger
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
