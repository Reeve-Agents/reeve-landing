import { useEffect, useState } from "react";
import { SIGN_IN_URL, START_URL } from "../lib/app";
import "./Nav.css";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#run", label: "Live run" },
  { href: "#mobile", label: "Mobile" },
  { href: "#trust", label: "Trust" },
  { href: "#proof", label: "Proof" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`nav ${solid ? "is-solid" : ""}`}>
      <div className="container nav__inner">
        <a className="nav__brand" href="#top" aria-label="Reeve, back to top">
          REEVE
        </a>
        <nav aria-label="Sections">
          <ul className="nav__links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__actions">
          <a className="nav__signin" href={SIGN_IN_URL}>
            Sign in
          </a>
          <a className="btn nav__cta" href={START_URL}>
            Start free
          </a>
        </div>
      </div>
    </header>
  );
}
