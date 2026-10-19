import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Figure, type FigureName } from "../components/Figure";
import { FLOW_EVENTS, RUN } from "../data/kosMelati";
import { T, gsap, useGSAP, useInView, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./FlowRun.css";

/*
 * The live run as a node graph: the owner's tools on the left, Reeve in the middle with the
 * four checks every action passes, the work it does on the right. Each beat replays one real
 * day of the Kos Melati test month along the wires.
 */

type Node = { icon: FigureName; name: string; meta: string };

const INPUTS: Node[] = [
  { icon: "Phone", name: "Owner's chat", meta: "the SOP, in Bahasa" },
  { icon: "Drawer", name: "Tenant list", meta: "30 rooms, move-in dates" },
  { icon: "Vault", name: "Bank and e-wallet", meta: "payments coming in" },
  { icon: "Slow", name: "Daily clock", meta: "runs every morning" },
];

const OUTPUTS: Node[] = [
  { icon: "Dish", name: "Tenant messages", meta: "invoices, reminders, notices" },
  { icon: "Riffle", name: "Invoices and fees", meta: "payment links, late fees, credit" },
  { icon: "Lockers", name: "Room status", meta: "paid, partial, overdue" },
  { icon: "Query", name: "Owner alerts", meta: "targets, approvals, questions" },
];

const GATES = [
  { label: "Builder tests", value: `${RUN.builderTests}/${RUN.builderTests}` },
  { label: "Auditor checks", value: `${RUN.mutants}/${RUN.mutants} bugs caught` },
  { label: "Sandbox", value: "network locked" },
  { label: "Owner", value: "approved by passkey" },
];

const BEAT_MS = 2900;

export function FlowRun() {
  const ref = useRef<HTMLElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const inRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inWire = useRef<(SVGPathElement | null)[]>([]);
  const outWire = useRef<(SVGPathElement | null)[]>([]);
  const inLit = useRef<(SVGPathElement | null)[]>([]);
  const outLit = useRef<(SVGPathElement | null)[]>([]);
  const dotRef = useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(graphRef);
  const [wires, setWires] = useState<{ ins: string[]; outs: string[]; w: number; h: number }>({ ins: [], outs: [], w: 0, h: 0 });
  const [beat, setBeat] = useState(-1);
  useReveal(ref);

  // Wires are measured from the real layout, so the graph reflows from a row (desktop) to a column (phone).
  useLayoutEffect(() => {
    const graph = graphRef.current;
    const core = coreRef.current;
    if (!graph || !core) return;
    const measure = () => {
      const vertical = window.matchMedia("(max-width: 899px)").matches;
      // Offsets, not client rects: the graph may be mid-arrival (scaled) when this runs.
      const rel = (el: HTMLElement) => {
        const l = el.offsetLeft;
        const t = el.offsetTop;
        return { l, r: l + el.offsetWidth, t, b: t + el.offsetHeight, cx: l + el.offsetWidth / 2, cy: t + el.offsetHeight / 2 };
      };
      const C = rel(core);
      const curve = (x1: number, y1: number, x2: number, y2: number) =>
        vertical
          ? `M${x1} ${y1} C${x1} ${(y1 + y2) / 2},${x2} ${(y1 + y2) / 2},${x2} ${y2}`
          : `M${x1} ${y1} C${(x1 + x2) / 2} ${y1},${(x1 + x2) / 2} ${y2},${x2} ${y2}`;
      const spread = (i: number, n: number, a: number, b: number) => a + ((b - a) * (i + 1)) / (n + 1);
      const ins = inRefs.current.map((el, i) => {
        if (!el) return "";
        const n = rel(el);
        return vertical
          ? curve(n.cx, n.b, spread(i, INPUTS.length, C.l + 24, C.r - 24), C.t)
          : curve(n.r, n.cy, C.l, spread(i, INPUTS.length, C.t + 40, C.b - 40));
      });
      const outs = outRefs.current.map((el, i) => {
        if (!el) return "";
        const n = rel(el);
        return vertical
          ? curve(spread(i, OUTPUTS.length, C.l + 24, C.r - 24), C.b, n.cx, n.t)
          : curve(C.r, spread(i, OUTPUTS.length, C.t + 40, C.b - 40), n.l, n.cy);
      });
      setWires({ ins, outs, w: graph.offsetWidth, h: graph.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(graph);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // One beat per real day; the graph only plays while it is on screen.
  useEffect(() => {
    if (reduced || !inView) return;
    const call = gsap.delayedCall(beat < 0 ? 0.4 : BEAT_MS / 1000, () => setBeat((b) => (b + 1) % FLOW_EVENTS.length));
    return () => void call.kill();
  }, [beat, inView, reduced]);

  useGSAP(
    () => {
      const ev = FLOW_EVENTS[beat];
      const all = [...inLit.current, ...outLit.current];
      all.forEach((p) => {
        if (!p) return;
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len });
        if (reduced) gsap.set(p, { strokeDashoffset: 0, opacity: 0.35 });
        else gsap.to(p, { strokeDashoffset: len, duration: T.leave, ease: "leave", overwrite: "auto" });
      });
      if (!ev || reduced) return;
      const a = inLit.current[ev.from];
      const aSeg = inWire.current[ev.from];
      const b = outLit.current[ev.to];
      const bSeg = outWire.current[ev.to];
      const dot = dotRef.current;
      if (!a || !b || !aSeg || !bSeg || !dot) return;
      const travel = (seg: SVGPathElement) => {
        const len = seg.getTotalLength();
        const p = { t: 0 };
        return gsap.to(p, {
          t: 1,
          duration: 0.6,
          ease: "camera",
          onUpdate: () => {
            const pt = seg.getPointAtLength(len * p.t);
            dot.setAttribute("cx", String(pt.x));
            dot.setAttribute("cy", String(pt.y));
          },
        });
      };
      gsap
        .timeline()
        .set(dot, { opacity: 1 }, 0.2)
        .fromTo(a, { strokeDashoffset: a.getTotalLength() }, { strokeDashoffset: 0, duration: 0.6, ease: "camera" }, 0.2)
        .add(travel(aSeg), 0.2)
        .fromTo(".gate__tick", { scale: 1.06, opacity: 0.4 }, { scale: 1, opacity: 1, duration: T.arrive, ease: "arrive", stagger: T.stagger }, 0.75)
        .fromTo(b, { strokeDashoffset: b.getTotalLength() }, { strokeDashoffset: 0, duration: 0.6, ease: "camera" }, 1.05)
        .add(travel(bSeg), 1.05)
        .to(dot, { opacity: 0, duration: T.leave, ease: "leave" }, 1.65)
        .fromTo(".flow-now__text", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: T.arrive, ease: "arrive" }, 0.1);
    },
    { dependencies: [beat, wires, reduced], scope: ref },
  );

  const ev = FLOW_EVENTS[beat] ?? FLOW_EVENTS[FLOW_EVENTS.length - 1]!;
  const live = beat >= 0 && !reduced;

  return (
    <section className="scene flowrun" id="run" ref={ref} aria-labelledby="run-title">
      <div className="container">
        <div className="scene__head flowrun__head">
          <p className="eyebrow" data-reveal>
            Live run
          </p>
          <h2 id="run-title" data-split>
            Plug in the tools you already use. <span className="voice">Reeve runs your rules between them.</span>
          </h2>
          <p className="lede" data-reveal>
            Chat, the tenant list, payments and the calendar go in. Every action passes the Builder's tests, the Auditor and your
            approval before anything goes out.
          </p>
        </div>

        <div className="flow" ref={graphRef} data-reveal>
          <svg className="flow__wires" width={wires.w} height={wires.h} aria-hidden="true">
            {wires.ins.map((d, i) => (
              <path key={`iw${i}`} d={d} className="wire" ref={(el) => void (inWire.current[i] = el)} />
            ))}
            {wires.outs.map((d, i) => (
              <path key={`ow${i}`} d={d} className="wire" ref={(el) => void (outWire.current[i] = el)} />
            ))}
            {wires.ins.map((d, i) => (
              <path key={`il${i}`} d={d} className="wire wire--lit" ref={(el) => void (inLit.current[i] = el)} />
            ))}
            {wires.outs.map((d, i) => (
              <path key={`ol${i}`} d={d} className="wire wire--lit" ref={(el) => void (outLit.current[i] = el)} />
            ))}
            <circle r="5" className="wire__dot" ref={dotRef} opacity="0" />
          </svg>

          <div className="flow__col flow__col--in">
            <span className="flow__label">Your tools</span>
            {INPUTS.map((n, i) => (
              <div
                key={n.name}
                className={`node node--in ${live && ev.from === i ? "is-active" : ""}`}
                ref={(el) => void (inRefs.current[i] = el)}
              >
                <Figure name={n.icon} className="node__icon" plate="var(--ink)" intensity={0.6} play={live && ev.from === i} />
                <span className="node__text">
                  <span className="node__name">{n.name}</span>
                  <span className="node__meta">{n.meta}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="core" ref={coreRef}>
            <header className="core__head">
              <span className="core__brand">Reeve</span>
              <span className="core__rule">Kos Melati rulebook · 8 rules</span>
            </header>
            <p className="core__day">
              Running <b>{ev.day}</b>
            </p>
            <ul className="gates">
              {GATES.map((g) => (
                <li className="gate" key={g.label}>
                  <svg className="gate__tick" viewBox="0 0 16 16" aria-hidden="true">
                    <rect x="0.5" y="0.5" width="15" height="15" rx="2" />
                    <path d="M4 8.5 L7 11 L12 5" />
                  </svg>
                  <span className="gate__text">
                    <span className="gate__label">{g.label}</span>
                    <span className="gate__value">{g.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flow__col flow__col--out">
            <span className="flow__label">The work done</span>
            {OUTPUTS.map((n, i) => (
              <div
                key={n.name}
                className={`node node--out ${live && ev.to === i ? "is-active" : ""}`}
                ref={(el) => void (outRefs.current[i] = el)}
              >
                <Figure name={n.icon} className="node__icon" plate="var(--ink)" intensity={0.6} play={live && ev.to === i} />
                <span className="node__text">
                  <span className="node__name">{n.name}</span>
                  <span className="node__meta">{n.meta}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flow-now" aria-live="polite">
          <span className="flow-now__day">{ev.day}</span>
          <span className="flow-now__text">{ev.text}</span>
        </div>
        <p className="caption flowrun__caption">
          Days from the Kos Melati test month; checks from the real CreateOS run on {RUN.date}. Connectors go through Composio and
          the payment rails (Xendit, Midtrans, Stripe).
        </p>
      </div>
    </section>
  );
}
