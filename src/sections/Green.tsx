import { useRef } from "react";
import { Figure } from "../components/Figure";
import { useReveal } from "../lib/reveal";
import "./Green.css";

const RULES = [
  { when: "A room's meter reads above 2× the building average", then: "tell the owner before the bill comes" },
  { when: "Water use is up 30% week on week", then: "open a leak check for the caretaker" },
  { when: "The month's kWh target is met, from the bill", then: "unlock the reward and log it as a receipt" },
];

const LAYERS = ["Energy and water SOPs", "Green Auditor (CO2e)", "Green rewards", "Green-loan ready"];

export function Green() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section className="scene green" id="green" ref={ref} aria-labelledby="green-title">
      <div className="container green__grid">
        <div className="scene__head">
          <p className="eyebrow" data-reveal>
            Green mode
          </p>
          <h2 id="green-title" data-split>
            Greener operations, <span className="voice">proven with real data.</span>
          </h2>
          <p className="lede" data-reveal>
            The same Builder and Auditor run energy and water SOPs. Only measured data counts: bills, meters and invoices.
          </p>
          <ul className="green__layers" data-reveal>
            {LAYERS.map((l) => (
              <li className="chip" key={l}>
                {l}
              </li>
            ))}
          </ul>
          <p className="green__sdg" data-reveal>
            <span className="eyebrow">SDGs</span>
            <span className="sdg sdg--main">7</span>
            <span className="sdg sdg--main">12</span>
            <span className="sdg">6</span>
            <span className="sdg">8</span>
            <span className="sdg">9</span>
            <span className="sdg">11</span>
            <span className="sdg">13</span>
          </p>
        </div>

        <div className="green__visual">
          <Figure name="Plot" className="green__fig" tone="mantis" intensity={0.8} label="A bar chart whose bars lift under the pointer" />
          <div className="green__rules">
            <span className="caption">Example green rules</span>
            {RULES.map((r) => (
              <div className="green-rule" key={r.when} data-reveal>
                <span className="green-rule__when">{r.when}</span>
                <span className="green-rule__then">{r.then}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
