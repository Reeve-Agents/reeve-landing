import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Figure, type FigureName, type FigureTone } from "../../components/Figure";
import { RECEIPT, RULES, RUN, RUN_LOG, SOP_LINES, linesUpTo, roomsOnDay } from "../../data/kosMelati";
import { T, gsap, useGSAP, useInView, useReducedMotion } from "../../lib/motion";
import "./HeroStage.css";

/*
 * The hero is one connected flow: six product panels on a tilted stage, joined by a thread
 * that lights step by step while a camera travels from panel to panel. The loop opens on a
 * wide shot of the whole flow, dives into each step, and pulls back out once the kos is live.
 */

const W = 1100;
const H = 700;
const CX = W / 2;
const CY = H / 2;

type Step = { key: string; name: string; status: string; icon: FigureName; tone?: FigureTone; ms: number };

const STEPS: Step[] = [
  { key: "describe", name: "Describe", status: "owner writing", icon: "Keyboard", ms: 2800 },
  { key: "compile", name: "Compile", status: "8 rules", icon: "Format", ms: 2400 },
  { key: "simulate", name: "Simulate", status: "in sandbox", icon: "Terminal", ms: 2600 },
  { key: "audit", name: "Audit", status: "checking", icon: "Sieve", tone: "auditor", ms: 2500 },
  { key: "approve", name: "Approve", status: "your turn", icon: "Padlock", ms: 2500 },
  { key: "run", name: "Run", status: "live", icon: "Hub", ms: 4800 },
];
const INTRO = -1;
const FINALE = STEPS.length;
const INTRO_MS = 1400;
const FINALE_MS = 2800;

type BodyProps = { active: boolean; run: number; reduced: boolean };

export function HeroStage() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const litRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotRef = useRef<SVGCircleElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevPhase = useRef(INTRO);
  const scale = useRef(0.7);

  const inView = useInView(rootRef);
  const [phase, setPhase] = useState(INTRO);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paths, setPaths] = useState<string[]>([]);
  const [narrow, setNarrow] = useState(false);

  const shown = reduced ? FINALE : phase;
  const auto = playing && inView && !reduced;
  const go = (p: number) => {
    setPhase(p);
    setRun((r) => r + 1);
  };

  // Measure the panels once laid out, and draw the thread through their centres.
  useLayoutEffect(() => {
    const measure = () => {
      const c = panelRefs.current.map((p) => (p ? [p.offsetLeft + p.offsetWidth / 2, p.offsetTop + p.offsetHeight / 2] : [CX, CY]));
      setPaths(
        c.slice(0, -1).map(([ax = CX, ay = CY], i) => {
          const [bx = CX, by = CY] = c[i + 1] ?? [];
          if (Math.abs(bx - ax) < 120) return `M${ax} ${ay} C${ax + 110} ${ay},${bx + 110} ${by},${bx} ${by}`;
          const mx = (ax + bx) / 2;
          return `M${ax} ${ay} C${mx} ${ay},${mx} ${by},${bx} ${by}`;
        }),
      );
    };
    measure();
    void document.fonts?.ready.then(measure);
  }, []);

  // Fit the 1100×700 stage into its column.
  useEffect(() => {
    const root = rootRef.current;
    const fit = fitRef.current;
    if (!root || !fit) return;
    const ro = new ResizeObserver(() => {
      setNarrow(window.matchMedia("(max-width: 1023px)").matches);
      const k = Math.min(root.clientWidth / (W + 60), root.clientHeight / (H + 60));
      scale.current = k;
      fit.style.setProperty("--k", k.toFixed(4));
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Advance on GSAP's clock so steps and tweens pause together.
  useEffect(() => {
    if (!auto) return;
    const ms = phase === INTRO ? INTRO_MS : phase === FINALE ? FINALE_MS : STEPS[phase]!.ms;
    const call = gsap.delayedCall(ms / 1000, () => go(phase === FINALE ? INTRO : phase + 1));
    return () => {
      call.kill();
    };
  }, [auto, phase, run]);

  // Camera, thread and rail follow the phase.
  useGSAP(
    () => {
      const cam = camRef.current;
      const from = prevPhase.current;
      prevPhase.current = shown;
      if (!cam) return;

      const panel = shown === INTRO || shown === FINALE ? null : panelRefs.current[shown];
      let zoom = 1;
      let px = CX;
      let py = CY;
      if (panel) {
        px = panel.offsetLeft + panel.offsetWidth / 2;
        py = panel.offsetTop + panel.offsetHeight / 2;
        const root = rootRef.current;
        zoom = narrow && root ? Math.min(3.4, Math.max(1, (root.clientWidth - 24) / (panel.offsetWidth * scale.current))) : 1.3;
      }
      const follow = narrow ? 1 : 0.84;
      const target = { x: -(px - CX) * zoom * follow, y: -(py - CY) * zoom * follow, scale: zoom };
      if (reduced) gsap.set(cam, target);
      else gsap.to(cam, { ...target, duration: T.camera, ease: "camera", overwrite: "auto" });

      // Segment i joins step i to step i + 1; it is lit once the flow has reached step i + 1.
      litRefs.current.forEach((lit, i) => {
        const seg = segRefs.current[i];
        if (!lit || !seg) return;
        const len = seg.getTotalLength();
        const on = shown === FINALE || (shown !== INTRO && shown > i);
        gsap.set(lit, { strokeDasharray: len });
        if (reduced) gsap.set(lit, { strokeDashoffset: on ? 0 : len });
        else if (shown === i + 1 && from === i)
          gsap.fromTo(lit, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: T.camera, ease: "camera", overwrite: "auto" });
        else gsap.to(lit, { strokeDashoffset: on ? 0 : len, duration: T.camera, ease: "camera", overwrite: "auto" });
      });

      // The dot carries the work along the segment just lit, then slips under the next panel.
      const dot = dotRef.current;
      const seg = shown >= 1 && shown < FINALE ? segRefs.current[shown - 1] : null;
      if (dot && seg && !reduced && from === shown - 1) {
        const len = seg.getTotalLength();
        const p = { t: 0 };
        gsap.set(dot, { opacity: 1 });
        gsap.to(p, {
          t: 1,
          duration: T.camera,
          ease: "camera",
          onUpdate: () => {
            const pt = seg.getPointAtLength(len * p.t);
            dot.setAttribute("cx", String(pt.x));
            dot.setAttribute("cy", String(pt.y));
          },
          onComplete: () => void gsap.to(dot, { opacity: 0, duration: T.leave, ease: "leave" }),
        });
      } else if (dot) gsap.set(dot, { opacity: 0 });

      // Rail: finished steps full, the current one fills over its duration.
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.killTweensOf(bar);
        const done = shown === FINALE || (shown !== INTRO && i < shown);
        gsap.set(bar, { scaleX: done ? 1 : 0 });
        if (i === shown && auto) gsap.to(bar, { scaleX: 1, duration: STEPS[i]!.ms / 1000, ease: "none" });
      });
    },
    { dependencies: [shown, run, narrow, paths.length, reduced, auto], scope: rootRef },
  );

  // The stage leans up to 2° toward the pointer.
  const onPointerMove = (e: React.PointerEvent) => {
    const el = tiltRef.current;
    const box = rootRef.current?.getBoundingClientRect();
    if (!el || !box || reduced || narrow) return;
    gsap.to(el, {
      "--lx": `${(((e.clientX - box.left) / box.width - 0.5) * 4).toFixed(2)}deg`,
      "--ly": `${(-((e.clientY - box.top) / box.height - 0.5) * 4).toFixed(2)}deg`,
      duration: T.camera,
      ease: "arrive",
      overwrite: "auto",
    });
  };
  const onPointerLeave = () => {
    if (tiltRef.current) gsap.to(tiltRef.current, { "--lx": "0deg", "--ly": "0deg", duration: T.camera, ease: "arrive" });
  };

  const state = (i: number) => (shown === i ? "on" : shown === FINALE || (shown !== INTRO && i < shown) ? "done" : "rest");
  const bodies: ((p: BodyProps) => ReactNode)[] = [DescribeBody, CompileBody, SimulateBody, AuditBody, ApproveBody, RunBody];
  const status =
    shown === INTRO
      ? "The whole flow, start to finish"
      : shown === FINALE
        ? "Live: all six steps done"
        : `Step ${shown + 1} of 6 · ${STEPS[shown]!.name}`;

  return (
    <div className="stage-col">
      <div className="stage" ref={rootRef} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
        <div className="stage__tilt" ref={tiltRef}>
          <div className="stage__fit" ref={fitRef}>
            <div
              className="stage__cam"
              ref={camRef}
              role="group"
              aria-label="Reeve running the Kos Melati SOP: describe, compile, simulate, audit, approve, run"
            >
              <svg className="thread" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
                {paths.map((d, i) => (
                  <path key={`s${i}`} d={d} className="thread__seg" ref={(el) => void (segRefs.current[i] = el)} />
                ))}
                {paths.map((d, i) => (
                  <path key={`l${i}`} d={d} className="thread__lit" ref={(el) => void (litRefs.current[i] = el)} />
                ))}
                <circle r="6" className="thread__dot" ref={dotRef} opacity="0" />
              </svg>

              {STEPS.map((s, i) => {
                const Body = bodies[i]!;
                const st = state(i);
                return (
                  <article
                    key={s.key}
                    className={`fp fp--${s.key} is-${st}`}
                    ref={(el) => void (panelRefs.current[i] = el)}
                    aria-current={st === "on" ? "step" : undefined}
                  >
                    <header className="fp__head">
                      <Figure
                        name={s.icon}
                        className="fp__icon"
                        plate={st === "on" ? "var(--ink-signal)" : "var(--ink)"}
                        tone={s.tone ?? "signal"}
                        intensity={0.7}
                        play={st === "on" && !reduced}
                      />
                      <span className="fp__num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="fp__name">{s.name}</span>
                      <span className={`fp__state ${st === "done" ? "is-done" : ""}`}>{st === "done" ? "done" : s.status}</span>
                    </header>
                    <div className="fp__body">
                      <Body active={st === "on"} run={run} reduced={reduced} />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="stage__rail">
        <p className="stage__status" aria-live="polite">
          <span className={`stage__dot ${shown === FINALE || shown === 5 ? "is-live" : ""}`} aria-hidden="true" />
          {status}
        </p>
        <ol className="rail">
          {STEPS.map((s, i) => (
            <li key={s.key}>
              <button type="button" className="rail__btn" aria-current={shown === i ? "step" : undefined} onClick={() => go(i)}>
                <span className="rail__track">
                  <span className="rail__bar" ref={(el) => void (barRefs.current[i] = el)} />
                </span>
                <span className="rail__label">
                  <span className="rail__n">{String(i + 1).padStart(2, "0")}</span> {s.name}
                </span>
              </button>
            </li>
          ))}
        </ol>
        {!reduced && (
          <button
            type="button"
            className="stage__pause"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause the demo" : "Play the demo"}
          >
            {playing ? (
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <rect x="2.5" y="2" width="2.4" height="8" />
                <rect x="7.1" y="2" width="2.4" height="8" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 2 L10 6 L3 10 Z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- 01 Describe ---------------- */
function DescribeBody({ active, run, reduced }: BodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!active || reduced) return;
      gsap
        .timeline({ delay: T.camera * 0.6 })
        .from(".msg--owner", { y: 16, scale: 1.04, autoAlpha: 0, duration: T.arrive, ease: "arrive" })
        .from(".mk", { backgroundColor: "rgba(198,255,51,0)", color: "#f6f7ed", duration: 0.42, ease: "arrive", stagger: 0.45 }, "+=0.15")
        .from(".msg--reeve", { y: 20, scale: 1.06, autoAlpha: 0, duration: T.arrive, ease: "arrive" }, "+=0.1");
    },
    { dependencies: [active, run, reduced], scope: ref, revertOnUpdate: true },
  );
  return (
    <div className="b-describe" ref={ref}>
      <div className="msg msg--owner">
        <span className="msg__who">Owner, in Bahasa Indonesia</span>
        {SOP_LINES.map((l) => (
          <p className="msg__line" key={l.mark}>
            <span className="msg__id">
              {l.before}
              <mark className="mk">{l.mark}</mark>
              {l.after}
            </span>
            <span className="msg__en">{l.en}</span>
          </p>
        ))}
      </div>
      <div className="msg msg--reeve">
        <span className="msg__who">Reeve</span>
        <p>
          Got it: <strong>8 rules</strong>. <strong>5 questions</strong> before anything goes live.
        </p>
      </div>
    </div>
  );
}

/* ---------------- 02 Compile ---------------- */
function CompileBody({ active, run, reduced }: BodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = RULES.filter((r) => ["R1", "R3", "R6", "R7"].includes(r.id));
  useGSAP(
    () => {
      if (!active || reduced) return;
      gsap
        .timeline({ delay: T.camera * 0.6 })
        .from(".rule", { x: -24, scale: 1.06, autoAlpha: 0, duration: T.arrive, ease: "arrive", stagger: 0.14 })
        .from(".b-compile__foot > *", { y: 12, autoAlpha: 0, duration: T.arrive, ease: "arrive", stagger: T.stagger }, "+=0.05");
    },
    { dependencies: [active, run, reduced], scope: ref, revertOnUpdate: true },
  );
  return (
    <div className="b-compile" ref={ref}>
      <ul className="rules">
        {shown.map((r) => (
          <li className="rule" key={r.id}>
            <span className="rule__id">{r.id}</span>
            <span className="rule__body">
              <span className="rule__title">{r.title}</span>
              {r.note && <span className="rule__note">{r.note}</span>}
            </span>
            <span className={`rule__kind ${r.auditor ? "is-auditor" : ""}`}>{r.kind}</span>
          </li>
        ))}
      </ul>
      <div className="b-compile__foot">
        <span className="chip chip--signal">rules.py · {RUN.rulesLines} lines</span>
        <span className="chip">{RUN.questions} questions back</span>
      </div>
    </div>
  );
}

/* ---------------- 03 Simulate ---------------- */
function SimulateBody({ active, run, reduced }: BodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lines = RUN_LOG.slice(3, 8);
  useGSAP(
    () => {
      if (!active || reduced) return;
      gsap
        .timeline({ delay: T.camera * 0.6 })
        .from(".term__line", { y: 8, autoAlpha: 0, duration: 0.24, ease: "arrive", stagger: 0.24 })
        .from(".sim-bar__fill", { scaleX: 0, duration: 1.5, ease: "power1.inOut" }, 0);
    },
    { dependencies: [active, run, reduced], scope: ref, revertOnUpdate: true },
  );
  return (
    <div className="b-sim" ref={ref}>
      <div className="b-sim__chips">
        <span className="chip">CreateOS microVM</span>
        <span className="chip chip--trust">egress locked</span>
      </div>
      <div className="term" role="log" aria-label="Sandbox log">
        {lines.map((l) => (
          <div className="term__line" key={l.ms}>
            <span className="term__ms">{l.ms}</span>
            <span className={l.tone ? `t-${l.tone}` : undefined}>{l.text}</span>
          </div>
        ))}
      </div>
      <div className="sim-bar">
        <span className="sim-bar__label">
          {RUN.rooms} rooms × {RUN.days} days · {RUN.seconds} s
        </span>
        <span className="sim-bar__track">
          <span className="sim-bar__fill" />
        </span>
      </div>
    </div>
  );
}

/* ---------------- 04 Audit ---------------- */
const METERS = [
  { label: "Builder tests", of: RUN.builderTests },
  { label: "Spec cases", of: RUN.specCases },
  { label: "Planted bugs caught", of: RUN.mutants },
];

function AuditBody({ active, run, reduced }: BodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!active || reduced) return;
      const tl = gsap.timeline({ delay: T.camera * 0.6 });
      tl.from(".meter__fill", { scaleX: 0, duration: T.roll, ease: "arrive", stagger: T.stagger }, 0);
      ref.current?.querySelectorAll<HTMLElement>(".meter__val").forEach((el, i) => {
        const of = Number(el.dataset.of);
        const n = { v: 0 };
        tl.to(n, { v: of, duration: T.roll, ease: "arrive", onUpdate: () => void (el.textContent = `${Math.round(n.v)}/${of}`) }, i * T.stagger);
      });
      tl.from(".verdict", { y: 10, scale: 1.06, autoAlpha: 0, duration: T.arrive, ease: "arrive" }, T.roll + 0.05);
    },
    { dependencies: [active, run, reduced], scope: ref, revertOnUpdate: true },
  );
  return (
    <div className="b-audit" ref={ref}>
      {METERS.map((m) => (
        <div className="meter" key={m.label}>
          <span className="meter__label">{m.label}</span>
          <span className="meter__val" data-of={m.of}>
            {m.of}/{m.of}
          </span>
          <span className="meter__track">
            <span className="meter__fill" />
          </span>
        </div>
      ))}
      <div className="verdict">
        <span className="verdict__stamp">PASS</span>
        <span className="verdict__note">Every planted bug was caught, so the tests can be trusted.</span>
      </div>
    </div>
  );
}

/* ---------------- 05 Approve ---------------- */
function ApproveBody({ active, run, reduced }: BodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!active || reduced) return;
      gsap
        .timeline({ delay: T.camera * 0.6 })
        .fromTo(".phone__wait", { autoAlpha: 1 }, { autoAlpha: 0, y: -6, duration: T.leave, ease: "leave" }, 1.1)
        .from(".phone__ok", { autoAlpha: 0, y: 10, scale: 1.06, duration: T.arrive, ease: "arrive" }, 1.22);
    },
    { dependencies: [active, run, reduced], scope: ref, revertOnUpdate: true },
  );
  return (
    <div className="phone" ref={ref}>
      <span className="phone__notch" aria-hidden="true" />
      <span className="phone__q">Approve the Kos Melati rulebook?</span>
      <span className="phone__meta">
        8 rules · Auditor PASS
        <br />
        receipt {RECEIPT.receipt.slice(0, 8)}…
      </span>
      <Figure name="Padlock" className="phone__fig" plate="var(--void)" intensity={0.8} play={active && !reduced} />
      <span className="phone__state">
        <span className="phone__wait">Approve with passkey</span>
        <span className="phone__ok">Approved</span>
      </span>
    </div>
  );
}

/* ---------------- 06 Run ---------------- */
function RunBody({ active, run, reduced }: BodyProps) {
  const [day, setDay] = useState(29);
  useEffect(() => {
    if (!active || reduced) {
      setDay(29);
      return;
    }
    setDay(-1);
    let d = -1;
    let call: gsap.core.Tween | null = null;
    const tick = () => {
      d += 1;
      setDay(d);
      if (d < 29) call = gsap.delayedCall(d === 14 ? 0.45 : 0.1, tick);
    };
    call = gsap.delayedCall(T.camera * 0.7, tick);
    return () => void call?.kill();
  }, [active, run, reduced]);

  const rooms = roomsOnDay(day);
  const paid = rooms.filter((r) => r.status === "paid").length;
  const events = linesUpTo(day);

  return (
    <div className="b-run">
      <div className="b-run__top">
        <div className="tiles" role="img" aria-label={`Kos Melati rooms on November ${day + 1}: ${paid} of 30 paid`}>
          {rooms.map((r) => (
            <span key={r.id} className={`tile is-${r.status} ${r.fee ? "has-fee" : ""}`}>
              {r.id.slice(1)}
            </span>
          ))}
        </div>
        <div className="b-run__side">
          <span className="b-run__day">{day < 0 ? "Oct 31" : `Nov ${day + 1}`}</span>
          <span className="b-run__paid">
            <strong>{paid}</strong> of 30 paid
          </span>
          <ul className="legend">
            <li>
              <i className="lg lg--paid" />
              paid
            </li>
            <li>
              <i className="lg lg--fee" />
              late fee
            </li>
            <li>
              <i className="lg lg--notice" />
              exit notice
            </li>
          </ul>
        </div>
      </div>
      <ul className="feed">
        {events.slice(-2).map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
