import { useRef } from "react";
import { Figure } from "../components/Figure";
import { LEDGER, RECEIPT } from "../data/kosMelati";
import { T, gsap, useGSAP, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./Proof.css";

const FIELDS: [string, string][] = [
  ["rulebook", RECEIPT.rulebook],
  ["code", RECEIPT.code],
  ["data", RECEIPT.data],
  ["result", RECEIPT.result],
];

export function Proof() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useReveal(ref);

  // The ledger fills block by block as it scrolls in: receipts, then the anchor that seals them.
  useGSAP(
    () => {
      if (reduced) return;
      gsap.from(".block", {
        y: 24,
        scale: 1.06,
        autoAlpha: 0,
        duration: T.arrive,
        ease: "arrive",
        stagger: 0.09,
        scrollTrigger: { trigger: ".ledger", start: "top 80%", once: true },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section className="scene proof" id="proof" ref={ref} aria-labelledby="proof-title">
      <div className="container">
        <div className="scene__head">
          <p className="eyebrow" data-reveal>
            Proof, not promises
          </p>
          <h2 id="proof-title" data-split>
            Every run leaves a receipt. <span className="voice">Every receipt has a history.</span>
          </h2>
        </div>

        <div className="proof__chain">
          <article className="receipt" data-reveal>
            <header className="receipt__head">
              <span className="eyebrow">Receipt</span>
              <span className="chip chip--signal">PASS</span>
            </header>
            <dl className="receipt__fields">
              {FIELDS.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}…</dd>
                </div>
              ))}
            </dl>
            <p className="receipt__foot">
              <span>{RECEIPT.receipt}…</span>
              <span>{RECEIPT.at}</span>
            </p>
          </article>

          <div className="proof__merkle" data-reveal>
            <Figure name="Settle" className="proof__fig" tone="trust" intensity={0.7} label="Twelve tiles sliding into a tree" />
            <span className="proof__root">
              Merkle root <b>{RECEIPT.root}…</b>
            </span>
          </div>
        </div>

        <div className="ledger" role="list" aria-label="Ledger entries from 18 Oct 2026">
          {LEDGER.map((b) => (
            <div
              role="listitem"
              key={b.seq}
              className={`block block--${b.kind} ${b.verdict === "fail" ? "is-fail" : ""}`}
              title={`#${b.seq} ${b.kind} ${b.hash}`}
            >
              <span className="block__seq">#{b.seq}</span>
              <span className="block__kind">{b.kind === "anchor" ? `anchor · ${b.leaves}` : b.verdict}</span>
              <span className="block__hash">{b.hash}</span>
            </div>
          ))}
        </div>
        <p className="caption proof__note">
          The real ledger from 18 Oct 2026. Entry #0 is a FAIL: the Auditor caught a bug planted in the first build, and the
          fixed build passed at #1. Each entry is hash-chained to the one before it.
        </p>

        <ul className="proof__layers" data-reveal>
          <li className="chip chip--signal">Hash-chained ledger</li>
          <li className="chip chip--signal">Merkle root per batch</li>
          <li className="chip chip--trust">On-chain anchor on 0G · next</li>
          <li className="chip chip--auditor">Auditor identity, ERC-8004 · next</li>
        </ul>
        <p className="caption">Proof only. Payments stay in rupiah.</p>
      </div>
    </section>
  );
}
