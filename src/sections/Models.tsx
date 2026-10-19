import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Figure } from "../components/Figure";
import { T, gsap, useGSAP, useInView, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./Models.css";

/*
 * The SOP parser is the owner's choice. Every parser's cards run down one wire into the same
 * Auditor. Status is what has been verified, nothing more: Opus 5.5 and Haiku 5.5 read both
 * sample SOPs into the hand-written rulebook's 8 cards and passed; the OpenAI-compatible
 * services and Ollama are built but have not been run against a live service yet.
 */

type Status = "verified" | "supported" | "built";
type Parser = { key: string; name: string; meta: string; price: string; out: number | null; status: Status };

const PARSERS: Parser[] = [
  { key: "opus", name: "Claude Opus 5.5", meta: "the default", price: "$4 / $20", out: 20, status: "verified" },
  { key: "sonnet", name: "Claude Sonnet 5.5", meta: "same Anthropic SDK path", price: "$2 / $10", out: 10, status: "supported" },
  { key: "haiku", name: "Claude Haiku 5.5", meta: "the budget Claude", price: "$0.10 / $0.50", out: 0.5, status: "verified" },
  {
    key: "cloud",
    name: "OpenRouter · Gemini · Groq · DeepSeek · OpenAI",
    meta: "any OpenAI-compatible service",
    price: "their price, some free tiers",
    out: null,
    status: "built",
  },
  { key: "ollama", name: "Ollama", meta: "runs on your computer, the SOP never leaves it", price: "free", out: 0, status: "built" },
];

const STATUS: Record<Status, { label: string; chip: string }> = {
  verified: { label: "same 8 cards · Auditor PASS", chip: "chip--signal" },
  supported: { label: "supported", chip: "" },
  built: { label: "built · not yet run live", chip: "mdl-chip--built" },
};

const MAX_OUT = Math.max(...PARSERS.map((p) => p.out ?? 0));
const CYCLE_MS = 2600;

export function Models() {
  const ref = useRef<HTMLElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const auditorRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const litRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotRef = useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(graphRef);
  const [wires, setWires] = useState<{ d: string[]; w: number; h: number }>({ d: [], w: 0, h: 0 });
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  useReveal(ref);

  // Wires are measured from the layout: into the Auditor's side on desktop, down a rail on phones.
  useLayoutEffect(() => {
    const graph = graphRef.current;
    const aud = auditorRef.current;
    if (!graph || !aud) return;
    const measure = () => {
      const vertical = window.matchMedia("(max-width: 899px)").matches;
      const A = { l: aud.offsetLeft, t: aud.offsetTop, b: aud.offsetTop + aud.offsetHeight };
      const rail = graph.offsetWidth - 10;
      const d = rowRefs.current.map((el, i) => {
        if (!el) return "";
        const r = el.offsetLeft + el.offsetWidth;
        const cy = el.offsetTop + el.offsetHeight / 2;
        if (vertical) return `M${r} ${cy} H${rail - 8} Q${rail} ${cy} ${rail} ${cy + 8} V${A.t}`;
        const y = A.t + 48 + ((A.b - A.t - 96) * (i + 1)) / (PARSERS.length + 1);
        return `M${r} ${cy} C${(r + A.l) / 2} ${cy},${(r + A.l) / 2} ${y},${A.l} ${y}`;
      });
      setWires({ d, w: graph.offsetWidth, h: graph.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(graph);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // One parser after another while on screen; hovering or focusing a row holds it.
  useEffect(() => {
    if (reduced || !inView || hovering) return;
    const call = gsap.delayedCall(CYCLE_MS / 1000, () => setActive((a) => (a + 1) % PARSERS.length));
    return () => void call.kill();
  }, [active, inView, hovering, reduced]);

  // The active parser's wire lights from its row to the Auditor, and the Auditor takes the cards.
  useGSAP(
    () => {
      litRefs.current.forEach((p, i) => {
        if (!p) return;
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len });
        if (reduced) gsap.set(p, { strokeDashoffset: 0, opacity: i === active ? 1 : 0 });
        else if (i !== active) gsap.to(p, { strokeDashoffset: len, duration: T.leave, ease: "leave", overwrite: "auto" });
      });
      const path = litRefs.current[active];
      const dot = dotRef.current;
      if (reduced || !path || !dot || !inView) return;
      const len = path.getTotalLength();
      const p = { t: 0 };
      gsap
        .timeline()
        .fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.7, ease: "camera", overwrite: "auto" }, 0)
        .set(dot, { opacity: 1 }, 0)
        .to(
          p,
          {
            t: 1,
            duration: 0.7,
            ease: "camera",
            onUpdate: () => {
              const pt = path.getPointAtLength(len * p.t);
              dot.setAttribute("cx", String(pt.x));
              dot.setAttribute("cy", String(pt.y));
            },
          },
          0,
        )
        .to(dot, { opacity: 0, duration: T.leave, ease: "leave" }, 0.7)
        .fromTo(".mdl-auditor", { scale: 1.02 }, { scale: 1, duration: T.arrive, ease: "arrive" }, 0.62);
    },
    { scope: ref, dependencies: [active, wires, reduced, inView] },
  );

  return (
    <section className="scene mdl" id="models" ref={ref} aria-labelledby="models-title">
      <div className="container mdl__grid">
        <div className="mdl__copy">
          <p className="eyebrow" data-reveal>
            Choose the model
          </p>
          <h2 id="models-title" data-split>
            Pick the model that fits your budget. <span className="voice">The same Auditor checks the result.</span>
          </h2>
          <p className="mdl__lede" data-reveal>
            The model only turns your SOP into rule cards. The code, the tests and the Auditor are the same whichever model reads
            it, so a small shop can start cheap, or free on its own computer.
          </p>
        </div>

        <div className="mdl-graph" ref={graphRef} data-reveal onPointerLeave={() => setHovering(false)}>
          <svg className="mdl-wires" width={wires.w} height={wires.h} aria-hidden="true">
            {wires.d.map((d, i) => (
              <path key={`w${i}`} d={d} className="mdl-wire" />
            ))}
            {wires.d.map((d, i) => (
              <path key={`l${i}`} d={d} className="mdl-wire mdl-wire--lit" ref={(el) => void (litRefs.current[i] = el)} />
            ))}
            <circle r="4.5" className="mdl-wire__dot" ref={dotRef} opacity="0" />
          </svg>

          <ul className="mdl-list" aria-label="SOP parsers you can choose">
            {PARSERS.map((p, i) => (
              <li key={p.key}>
                <button
                  type="button"
                  className={`mdl-row ${i === active ? "is-active" : ""}`}
                  ref={(el) => void (rowRefs.current[i] = el)}
                  aria-pressed={i === active}
                  onPointerEnter={() => {
                    setHovering(true);
                    setActive(i);
                  }}
                  onFocus={() => {
                    setHovering(true);
                    setActive(i);
                  }}
                  onBlur={() => setHovering(false)}
                  onClick={() => setActive(i)}
                >
                  <span className="mdl-row__name">{p.name}</span>
                  <span className={`chip mdl-row__chip ${STATUS[p.status].chip}`}>{STATUS[p.status].label}</span>
                  <span className="mdl-row__meta">{p.meta}</span>
                  <span className={`mdl-row__bar ${p.out === null ? "is-varies" : ""}`} aria-hidden="true">
                    {p.out !== 0 && <span style={{ width: p.out === null ? "100%" : `${(p.out / MAX_OUT) * 100}%` }} />}
                  </span>
                  <span className="mdl-row__price">{p.price}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mdl-auditor" ref={auditorRef}>
            <Figure name="Loupe" className="mdl-auditor__fig" plate="var(--ink)" tone="auditor" intensity={0.7} play={!reduced && inView} />
            <span className="mdl-auditor__name">The same Auditor</span>
            <ul className="mdl-auditor__checks">
              <li>Cards that do not fit the schema are rejected before anything runs</li>
              <li>Its own spec, written from your rulebook</li>
              <li>Planted bugs, constraints, a locked sandbox</li>
            </ul>
            <span className="chip chip--auditor">PASS, or it does not run</span>
          </div>
        </div>

        <p className="caption mdl__note">
          Prices per million tokens, input / output. Verified so far: Claude Opus 5.5 and Haiku 5.5 each read both sample SOPs,
          Kos Melati and Minimarket Berkah, into the same 8 rule cards as the hand-written rulebook, and each of those rulebooks passed the Auditor.
          The other services and Ollama are built in but have not been run against a live service yet.
        </p>
      </div>
    </section>
  );
}
