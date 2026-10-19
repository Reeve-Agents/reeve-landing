import {
  Branches,
  Cabinet,
  Dish,
  Drawer,
  Format,
  Hub,
  Keyboard,
  Lockers,
  Loupe,
  Padlock,
  Phone,
  Plot,
  Plug,
  Query,
  Relay,
  Riffle,
  Settle,
  Sieve,
  Slow,
  Stack,
  Terminal,
  Vault,
} from "@lucasmarkes/hairline/react";
import type { CSSProperties } from "react";
import "./Figure.css";

/** Hairline figures are Reeve's icon system (MASTER.md, "Figure map"). */
const FIGURES = {
  Branches,
  Cabinet,
  Dish,
  Drawer,
  Format,
  Hub,
  Keyboard,
  Lockers,
  Loupe,
  Padlock,
  Phone,
  Plot,
  Plug,
  Query,
  Relay,
  Riffle,
  Settle,
  Sieve,
  Slow,
  Stack,
  Terminal,
  Vault,
};

export type FigureName = keyof typeof FIGURES;
export type FigureTone = "signal" | "auditor" | "trust" | "mantis" | "danger" | "paper";

const HI: Record<FigureTone, string> = {
  signal: "var(--signal)",
  auditor: "var(--auditor-text)",
  trust: "var(--trust-text)",
  mantis: "var(--mantis)",
  danger: "var(--danger)",
  paper: "var(--paper)",
};

type Props = {
  name: FigureName;
  /** The surface the figure sits on; plates are filled with it. */
  plate?: string;
  tone?: FigureTone;
  intensity?: number;
  play?: boolean;
  /** Accessible description. Omit for an icon next to a text label: it is then hidden. */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export function Figure({ name, plate = "var(--void)", tone = "signal", intensity = 0.5, play = false, label, className = "", style }: Props) {
  const Component = FIGURES[name];
  const vars = {
    "--hairline-plate": plate,
    "--hairline-hi": HI[tone],
    ...style,
  } as CSSProperties;
  return (
    <div className={`figure ${className}`} style={vars}>
      <Component
        theme="dark"
        intensity={intensity}
        play={play}
        label={label}
        aria-hidden={label ? undefined : true}
        className="figure__draw"
      />
    </div>
  );
}
