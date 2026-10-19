import { useRef } from "react";
import { gsap, useGSAP, useReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/reveal";
import "./Problem.css";

const SHEET = [
  { room: "07", rent: "1.500.000", status: "Lunas", tone: "ok" },
  { room: "12", rent: "3.000.000", status: "Dobel?", tone: "warn" },
  { room: "18", rent: "1.500.000", status: "Belum", tone: "bad" },
  { room: "21", rent: "750.000", status: "Sebagian", tone: "warn" },
  { room: "27", rent: "", status: "Belum", tone: "bad" },
];

export function Problem() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useReveal(ref);

  // The fragments start scattered and pile onto the desk as the visitor scrolls.
  useGSAP(
    () => {
      if (reduced) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".problem__board", start: "top 80%", end: "center 45%", scrub: 1 },
        });
        tl.from(".frag--chat", { x: -120, y: 80, rotate: -14, scale: 1.06, autoAlpha: 0, ease: "none" }, 0)
          .from(".frag--sheet", { x: 140, y: -60, rotate: 12, scale: 1.06, autoAlpha: 0, ease: "none" }, 0.1)
          .from(".frag--cal", { x: 90, y: 120, rotate: -10, scale: 1.06, autoAlpha: 0, ease: "none" }, 0.2)
          .from(".frag--agent", { y: 140, scale: 1.06, autoAlpha: 0, ease: "none" }, 0.35);
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section className="scene problem" id="problem" ref={ref} aria-labelledby="problem-title">
      <div className="container problem__grid">
        <div className="scene__head problem__head">
          <p className="eyebrow" data-reveal>
            The problem
          </p>
          <h2 id="problem-title" data-split>
            Small businesses run on chat and spreadsheets.{" "}
            <span className="voice">Automation breaks on edge cases. AI agents can't be trusted with money.</span>
          </h2>
          <ul className="problem__chips" data-reveal>
            <li className="chip chip--danger">Late payments</li>
            <li className="chip chip--danger">Manual mistakes</li>
            <li className="chip chip--danger">Risky AI access</li>
          </ul>
        </div>

        <div className="problem__board" role="img" aria-label="Illustration: a boarding house run by hand. Tenants promise to pay next week in chat, a spreadsheet shows a double payment and unpaid rooms, late days are circled on a calendar, and an AI agent asks for full bank access.">
          <div className="frag frag--chat panel">
            <span className="frag__label">Chat · tenants</span>
            <p className="bubble">Kak, bayar minggu depan ya</p>
            <p className="bubble">Udah transfer kak, cek ya</p>
            <p className="bubble bubble--me">Kamar 12, kok transfernya dua kali?</p>
          </div>

          <div className="frag frag--sheet panel">
            <span className="frag__label">Sewa_November_final2.xlsx</span>
            <table>
              <thead>
                <tr>
                  <th>Kamar</th>
                  <th>Sewa</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SHEET.map((r) => (
                  <tr key={r.room}>
                    <td>{r.room}</td>
                    <td>{r.rent}</td>
                    <td className={`is-${r.tone}`}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="frag frag--cal panel">
            <span className="frag__label">November</span>
            <div className="cal">
              {Array.from({ length: 30 }, (_, i) => (
                <span key={i} className={[8, 15].includes(i + 1) ? "is-circled" : undefined}>
                  {i + 1}
                </span>
              ))}
            </div>
            <span className="frag__note">Denda? Lupa dicatat.</span>
          </div>

          <div className="frag frag--agent">
            <span className="frag__label">AI agent</span>
            <p>To collect rent for you, I need your bank login.</p>
            <span className="chip chip--danger">full bank access</span>
          </div>
        </div>
      </div>
      <p className="container caption problem__caption">Illustration of how a 30-room kos runs by hand.</p>
    </section>
  );
}
