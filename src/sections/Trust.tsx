import { useRef } from "react";
import { Figure, type FigureName, type FigureTone } from "../components/Figure";
import { useReveal } from "../lib/reveal";
import "./Trust.css";

type Guard = { key: string; icon: FigureName; tone: FigureTone; title: string; text: string; label: string };

const GUARDS: Guard[] = [
  {
    key: "llm",
    icon: "Drawer",
    tone: "paper",
    title: "The AI reads rules, not rows",
    text: "Claude sees your SOP and the shape of your data. Tenant records never leave the box.",
    label: "A drawer with dividers and nothing between them",
  },
  {
    key: "box",
    icon: "Cabinet",
    tone: "signal",
    title: "Code goes to the data",
    text: "Each job runs in its own CreateOS microVM with the network locked, then the box is destroyed. Only results come out.",
    label: "A rack of server blades on rails",
  },
  {
    key: "keys",
    icon: "Vault",
    tone: "trust",
    title: "Keys never enter the box",
    text: "No API key or bank credential goes into the sandbox. Payment calls go through a broker that holds them outside.",
    label: "A vault door with a dial and bolts",
  },
  {
    key: "money",
    icon: "Plug",
    tone: "signal",
    title: "Money waits for your passkey",
    text: "A rulebook only goes live after you approve it with Face ID or a fingerprint, signed into the ledger.",
    label: "A plug that stops short of its socket",
  },
];

export function Trust() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section className="scene trust" id="trust" ref={ref} aria-labelledby="trust-title">
      <div className="container">
        <div className="scene__head">
          <p className="eyebrow" data-reveal>
            Trust by design
          </p>
          <h2 id="trust-title" data-split>
            Code goes to the data. <span className="voice">Keys never enter the box.</span>
          </h2>
        </div>
        <div className="trust__map">
          {GUARDS.map((g) => (
            <article className={`guard guard--${g.key}`} key={g.key} data-reveal>
              <Figure name={g.icon} className="guard__fig" plate="var(--ink)" tone={g.tone} intensity={0.7} label={g.label} />
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
