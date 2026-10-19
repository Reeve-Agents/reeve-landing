// Base styles first, so every section's stylesheet loads after them and wins at equal specificity.
import "./styles/tokens.css";
import "./styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { gsap } from "./lib/motion";

// Dev only: lets the browser checks finish every running tween before a screenshot.
if (import.meta.env.DEV) (window as unknown as { gsap: typeof gsap }).gsap = gsap;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
