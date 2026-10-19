import { useRef } from "react";
import { Figure, type FigureName, type FigureTone } from "../components/Figure";
import { useReveal } from "../lib/reveal";
import "./Roles.css";

type Role = { key: string; name: string; verbs: string; text: string; icon: FigureName; tone: FigureTone; figLabel: string };

const ROLES: Role[] = [
  {
    key: "builder",
    name: "Builder",
    verbs: "builds · runs · maintains",
    text: "Turns each rule into Python, tests it, runs it in a locked sandbox, and re-tests every change before it ships.",
    icon: "Branches",
    tone: "signal",
    figLabel: "A commit graph whose history rises under the pointer",
  },
  {
    key: "auditor",
    name: "Auditor",
    verbs: "tests · judges · monitors",
    text: "Writes its own checks from your rulebook, never from the Builder's code, then plants bugs to prove those checks catch them.",
    icon: "Loupe",
    tone: "auditor",
    figLabel: "A loupe passing over a ruled sheet",
  },
  {
    key: "owner",
    name: "You, the owner",
    verbs: "approve with a passkey",
    text: "See what will happen in plain words and approve with Face ID or a fingerprint. Money waits for that.",
    icon: "Phone",
    tone: "paper",
    figLabel: "A phone shown in layers",
  },
];

export function Roles() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section className="scene roles" id="roles" ref={ref} aria-labelledby="roles-title">
      <div className="container">
        <div className="scene__head">
          <p className="eyebrow" data-reveal>
            Three roles
          </p>
          <h2 id="roles-title" data-split>
            Reeve turns your SOP into software <span className="voice">that checks itself.</span>
          </h2>
        </div>

        <div className="roles__map">
          {ROLES.map((r) => (
            <article className={`role role--${r.key}`} key={r.key} data-reveal>
              <Figure name={r.icon} className="role__fig" plate="var(--ink)" tone={r.tone} intensity={0.7} label={r.figLabel} />
              <div className="role__copy">
                <h3>{r.name}</h3>
                <p className="role__verbs">{r.verbs}</p>
                <p className="role__text">{r.text}</p>
              </div>
            </article>
          ))}

          <p className="roles__flow roles__flow--a" data-reveal>
            code and tests
          </p>
          <p className="roles__flow roles__flow--b" data-reveal>
            verdict and receipt
          </p>
        </div>
      </div>
    </section>
  );
}
