import { useEffect, useRef, useState } from "react";
import { RollNumber } from "../components/RollNumber";
import { APPROVAL, EXPIRY_LIMIT, MM_RUN, MM_TIMELINE, MONDAYS, MONTH, PO_LIMIT, jt1, juta, rupiah } from "../data/minimarket";
import { T, gsap, useGSAP, useInView, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./Minimarket.css";

/*
 * Pack 2, live: the same Builder and Auditor running a minimarket's stock and expiry SOP. The
 * shelf replays the real CreateOS run day by day: 24 items, 30 days, two suppliers. The chart
 * is the value of stock expiring within 30 days against the owner's limit, checked on Mondays.
 */

const DAY_MS = 1100;
const HOLD_MS = 2600; // linger on the Monday the limit was crossed, and on the last day

const STATE: Record<string, string> = {
  ok: "in stock",
  ordered: "on order",
  low: "low",
  out: "out of stock",
  marked_down: "marked down",
  stopped: "not reordered",
};

const LAST = MM_TIMELINE.length - 1;
const ALERT_INDEX = MONDAYS.find((m) => m.alert)?.index ?? -1;
const MAX_Y = Math.max(EXPIRY_LIMIT * 1.25, ...MM_TIMELINE.map((d) => d.expiring * 1.1));
const xPct = (i: number) => (i / LAST) * 100;
const yPct = (v: number) => (1 - v / MAX_Y) * 100;
const LINE = MM_TIMELINE.map((d, i) => `${i ? "L" : "M"}${xPct(i) * 10} ${yPct(d.expiring) * 2}`).join(" ");
const AREA = `${LINE} L1000 200 L0 200 Z`;

const weekday = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleString("en-US", { weekday: "short", timeZone: "UTC" });

const METRICS = [
  { value: MONTH.orders, label: `purchase orders, ${jt1(MONTH.ordersValue)} in total` },
  { value: MONTH.switched, label: `late orders moved from Supplier ${MONTH.switchFrom} to ${MONTH.switchTo}` },
  { value: MONTH.markdowns, label: "markdowns before expiry" },
  { value: MONTH.writtenOff, prefix: "Rp", group: true, label: "written off at expiry" },
  { value: MONTH.stopped, label: "slow movers no longer reordered" },
];

function Tick() {
  return (
    <svg className="mm-tick" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0.5" y="0.5" width="15" height="15" rx="2" />
      <path d="M4 8.5 L7 11 L12 5" />
    </svg>
  );
}

export function Minimarket() {
  const ref = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const reduced = useReducedMotion();
  const inView = useInView(boardRef);
  const [day, setDay] = useState(LAST);
  const [playing, setPlaying] = useState(true);
  useReveal(ref);

  // The month starts over from Nov 2 the first time the shelf comes on screen.
  useEffect(() => {
    if (!inView || reduced || started.current) return;
    started.current = true;
    setDay(0);
  }, [inView, reduced]);

  // One day per beat while on screen; the visitor can pause or scrub.
  useEffect(() => {
    if (reduced || !inView || !playing || !started.current) return;
    const hold = day === ALERT_INDEX || day === LAST ? HOLD_MS : DAY_MS;
    const call = gsap.delayedCall(hold / 1000, () => setDay((d) => (d + 1) % MM_TIMELINE.length));
    return () => void call.kill();
  }, [day, inView, playing, reduced]);

  // Items whose status changed today land again; the day's lines arrive one by one.
  useGSAP(
    () => {
      const root = ref.current;
      if (reduced || !started.current || !root) return;
      const changed = root.querySelectorAll(".mm-tile.is-changed");
      const lines = root.querySelectorAll(".mm-feed li");
      const monday = root.querySelector(".mm-check.is-now");
      if (changed.length) gsap.fromTo(changed, { scale: 1.06, autoAlpha: 0.5 }, { scale: 1, autoAlpha: 1, duration: T.arrive, ease: "arrive", stagger: 0.03 });
      if (lines.length) gsap.fromTo(lines, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: T.arrive, ease: "arrive", stagger: T.stagger });
      if (monday) gsap.fromTo(monday, { scale: 1.04, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: T.arrive, ease: "arrive" });
    },
    { scope: ref, dependencies: [day, reduced] },
  );

  const d = MM_TIMELINE[day] ?? MM_TIMELINE[LAST]!;
  const prev = day > 0 ? MM_TIMELINE[day - 1] : undefined;
  const scrub = (i: number) => {
    started.current = true;
    setPlaying(false);
    setDay(i);
  };

  return (
    <section className="scene mm" id="minimarket" ref={ref} aria-labelledby="mm-title">
      <div className="container">
        <div className="scene__head mm__head">
          <p className="eyebrow mm__eyebrow" data-reveal>
            <span className="mm__live" aria-hidden="true" />
            Second live run
          </p>
          <h2 id="mm-title" data-split>
            A different business, the same agents. <span className="voice">Minimarket Berkah runs on stock and expiry.</span>
          </h2>
          <p className="lede" data-reveal>
            Eight lines about reordering, late suppliers and expiry dates. Reeve compiled them, replayed {MM_TIMELINE.length} days
            for {MM_RUN.items} items on CreateOS, and the Auditor passed the build. Only the nouns changed.
          </p>
        </div>

        <div className="mm-board" ref={boardRef} data-reveal>
          <div className="mm-main">
            <header className="mm-bar">
              <span className="mm-bar__title">
                Minimarket Berkah <span>· {MM_RUN.items} items</span>
              </span>
              <span className="mm-bar__day">
                Day {day + 1} of {MM_TIMELINE.length} · <b>{`${weekday(d.date)} ${d.day}`}</b>
              </span>
              {!reduced && (
                <button type="button" className="mm-play" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
                  {playing ? "Pause" : "Play"}
                </button>
              )}
            </header>

            <ul className="mm-shelf" aria-label={`Stock on ${d.day}`}>
              {d.items.map((it, i) => {
                const changed = prev && prev.items[i]?.status !== it.status;
                return (
                  <li key={it.id} className={`mm-tile mm-tile--${it.tone} is-${it.status} ${changed ? "is-changed" : ""}`} title={it.name}>
                    <span className="mm-tile__id" aria-hidden="true">
                      {it.id.slice(1)}
                    </span>
                    <span className="mm-tile__name">{it.short}</span>
                    <span className="mm-tile__state">
                      <span className="sr-only">: </span>
                      {it.flag ?? STATE[it.status] ?? it.status}
                      {it.waiting && <span className="sr-only">, order waiting for your passkey</span>}
                    </span>
                    {it.waiting && (
                      <span className="mm-tile__ask" aria-hidden="true">
                        needs you
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mm-chart">
              <div className="mm-chart__head">
                <span>Stock expiring within 30 days, at cost</span>
                <b>{rupiah(d.expiring)}</b>
              </div>
              <div className="mm-chart__plot">
                <svg className="mm-chart__svg" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
                  <path className="mm-chart__area" d={AREA} />
                  <path className="mm-chart__line" d={LINE} />
                </svg>
                <svg
                  className="mm-chart__svg mm-chart__svg--lit"
                  viewBox="0 0 1000 200"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  style={{ clipPath: `inset(0 ${100 - xPct(day)}% 0 0)` }}
                >
                  <path className="mm-chart__line mm-chart__line--lit" d={LINE} />
                </svg>
                <span className="mm-chart__limit" style={{ top: `${yPct(EXPIRY_LIMIT)}%` }} aria-hidden="true">
                  <span>your limit {rupiah(EXPIRY_LIMIT)}</span>
                </span>
                {MONDAYS.map((m) => (
                  <span
                    key={m.day}
                    className={`mm-chart__monday ${m.alert ? "is-alert" : ""} ${day >= m.index ? "is-done" : ""}`}
                    style={{ left: `${xPct(m.index)}%`, top: `${yPct(m.value)}%` }}
                    aria-hidden="true"
                  />
                ))}
                {ALERT_INDEX >= 0 && (
                  <span
                    className={`mm-chart__callout ${day >= ALERT_INDEX ? "is-on" : ""}`}
                    style={{ left: `${xPct(ALERT_INDEX)}%`, top: `${yPct(MM_TIMELINE[ALERT_INDEX]!.expiring)}%` }}
                    aria-hidden="true"
                  >
                    <span className="mm-chart__callout-long">Monday check · </span>owner alerted
                  </span>
                )}
                <span className="mm-chart__head-line" style={{ left: `${xPct(day)}%` }} aria-hidden="true">
                  <span className="mm-chart__dot" style={{ top: `${yPct(d.expiring)}%` }} />
                </span>
                <input
                  className="mm-chart__scrub"
                  type="range"
                  min={0}
                  max={LAST}
                  value={day}
                  onChange={(e) => scrub(Number(e.currentTarget.value))}
                  aria-label="Day of the test month"
                  aria-valuetext={`${d.day}: ${rupiah(d.expiring)} expiring within 30 days`}
                />
              </div>
              <div className="mm-chart__axis" aria-hidden="true">
                {MONDAYS.map((m) => (
                  <span key={m.day} style={{ left: `${xPct(m.index)}%` }}>
                    Mon {m.day}
                  </span>
                ))}
              </div>
            </div>

            <ul className="mm-feed" aria-label={`What Reeve did on ${d.day}`}>
              {d.lines.slice(0, 4).map((line) => (
                <li key={`${d.date}-${line}`}>{line}</li>
              ))}
            </ul>
          </div>

          <aside className="mm-side" aria-label="Checks and decisions">
            <div className="mm-card mm-checks">
              <header className="mm-card__head">
                <span className="eyebrow">CreateOS run · {MM_RUN.date}</span>
                <span className="chip chip--signal">{MM_RUN.verdict.toUpperCase()}</span>
              </header>
              <ul className="mm-checks__list">
                <li>
                  <Tick />
                  <span>Builder tests</span>
                  <b>
                    {MM_RUN.builder.pass}/{MM_RUN.builder.ran}
                  </b>
                </li>
                <li className="is-auditor">
                  <Tick />
                  <span>Auditor spec cases</span>
                  <b>
                    {MM_RUN.spec.pass}/{MM_RUN.spec.ran}
                  </b>
                </li>
                <li className="is-auditor">
                  <Tick />
                  <span>Planted defects caught</span>
                  <b>
                    {MM_RUN.mutants.killed}/{MM_RUN.mutants.total}
                  </b>
                </li>
              </ul>
            </div>

            <article className="mm-card mm-ask">
              <span className="eyebrow">
                {MONTH.waiting} order waiting for your passkey
              </span>
              <p className="mm-ask__what">
                <b>
                  {APPROVAL.qty} × {APPROVAL.item}
                </b>{" "}
                from Supplier {APPROVAL.supplier}
              </p>
              <p className="mm-ask__why">
                <strong>{jt1(APPROVAL.amount)}</strong> is above your {juta(PO_LIMIT)} limit, so Reeve asks before it orders.
              </p>
              <span className="mm-ask__btn" aria-hidden="true">
                Approve with passkey
              </span>
            </article>

            <article className="mm-card mm-mondays">
              <span className="eyebrow">Monday check · limit {rupiah(EXPIRY_LIMIT)}</span>
              <ol className="mm-mondays__list">
                {MONDAYS.map((m) => (
                  <li
                    key={m.day}
                    className={`mm-check ${m.alert ? "is-alert" : ""} ${day >= m.index ? "is-done" : ""} ${day === m.index ? "is-now" : ""}`}
                  >
                    <span className="mm-check__day">{m.day}</span>
                    <span className="mm-check__value">{day >= m.index ? rupiah(m.value) : "upcoming"}</span>
                    <span className="mm-check__result">{day >= m.index ? (m.alert ? "over · alerted" : "under") : ""}</span>
                  </li>
                ))}
              </ol>
            </article>
          </aside>
        </div>

        <dl className="mm-metrics">
          {METRICS.map((m) => (
            <div className="mm-metric" key={m.label}>
              <dt>{m.label}</dt>
              <dd>
                <RollNumber value={m.value} prefix={m.prefix} group={m.group} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="caption mm__caption">
          Counted from the events of run {MM_RUN.id} on CreateOS, {MM_RUN.date}: sandbox {MM_RUN.sandbox.slice(0, 11)}…, egress
          locked, receipt {MM_RUN.receipt}…. The sales are simulated; the rules, code, checks and receipt are real.
        </p>
      </div>
    </section>
  );
}
