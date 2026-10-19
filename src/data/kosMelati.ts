/**
 * Real data only. Sources:
 * - fixtures/kos-melati/sop.md and rulebook.json (the owner's SOP and the compiled rules)
 * - .reeve/db.json run run_mvdetcvcug1b on CreateOS, 18 Oct 2026 (log, timings, verdict)
 * - .reeve/ledger.jsonl (receipts and anchors)
 * - fixtures/kos-melati/sim-events.json (the 185 events that run produced: 30 rooms, 45 days)
 */

import sim from "@reeve/core/fixtures/kos-melati/sim-events.json";
import { addDays, collectedBy, dayLines, juta, money, roomsAt, shortDate, type RoomView, type SimEventLike } from "@reeve/core/simview";

export type SopLine = { before: string; mark: string; after: string; en: string };

export const SOP_LINES: SopLine[] = [
  {
    before: "Tagihan sewa dikirim ke semua penghuni ",
    mark: "setiap tanggal 1",
    after: ".",
    en: "Send rent invoices to every tenant on the 1st.",
  },
  {
    before: "",
    mark: "H+7 belum lunas kena denda 5%",
    after: " dari harga sewa.",
    en: "Unpaid after 7 days: a 5% late fee on the rent.",
  },
  {
    before: "Refund ",
    mark: "di atas Rp500.000 harus saya setujui",
    after: " dulu.",
    en: "Refunds over Rp500,000 need my approval first.",
  },
];

export type Rule = { id: string; kind: string; title: string; note?: string; auditor?: boolean };

export const RULES: Rule[] = [
  { id: "R1", kind: "schedule", title: "Invoice every tenant on the 1st" },
  { id: "R2", kind: "reminder", title: "Remind on day 3 and day 10 if unpaid" },
  { id: "R3", kind: "late fee", title: "5% of rent on day 7, once per invoice", note: "+3 days for tenants of 12+ months" },
  { id: "R4", kind: "notice", title: "Exit notice on day 14 if still unpaid" },
  { id: "R5", kind: "credit", title: "Overpayment becomes credit next month" },
  { id: "R6", kind: "limit", title: "Total fees never above 10% of rent", auditor: true },
  { id: "R7", kind: "approval", title: "Refunds over Rp500,000 go to the owner", auditor: true },
  { id: "R8", kind: "KPI", title: "Rp45 jt a month, checked on the 15th" },
];

export const RUN = {
  id: "run_mvdetcvcug1b",
  date: "18 Oct 2026",
  sandbox: "sb-01m56s4yz8k9s4z7y9k3a91bwk",
  builderTests: 7,
  specCases: 11,
  mutants: 29,
  seconds: 3.9,
  files: 40,
  execMs: 176.29,
  rulesLines: 73,
  questions: 5,
  rooms: 30,
  days: 45,
};

export const RUN_LOG: { ms: number; text: string; tone?: "ok" | "lock" | "aud" | "trust" }[] = [
  { ms: 0, text: "queued job for rulebook on createos" },
  { ms: 4, text: "compiled rules.py (73 lines) from rulebook ac632db3" },
  { ms: 5, text: "auditor prepared 11 spec cases and 29 planted defects", tone: "aud" },
  { ms: 977, text: "sandbox sb-01m56s4y created · egress locked", tone: "lock" },
  { ms: 2752, text: "uploaded 40 files" },
  { ms: 2754, text: "exec python3 -E -s -m reeve_runtime.job job" },
  { ms: 3658, text: "exit 0 · exec 176.29 ms", tone: "ok" },
  { ms: 3888, text: "sandbox destroyed" },
  { ms: 3893, text: "receipt 30f17bb7… → ledger #9", tone: "trust" },
  { ms: 3894, text: "auditor verdict: PASS", tone: "ok" },
];

export const EGRESS_PROBE = [
  { host: "example.com", result: "blocked" },
  { host: "api.stripe.com", result: "blocked" },
];

export const RECEIPT = {
  run: "run_mvdetcvcug1b",
  at: "2026-10-18 05:53:31 UTC",
  rulebook: "ac632db3a2e48fe5",
  code: "6ebb474032c463e2",
  data: "14b8c2cd2c8de947",
  result: "04c8ace1eba0bf39",
  receipt: "30f17bb71ea7d20d",
  root: "cd646f908d689b89",
};

export const LEDGER: { seq: number; kind: "receipt" | "anchor"; at: string; hash: string; verdict?: "pass" | "fail"; leaves?: number }[] = [
  { seq: 0, kind: "receipt", at: "05:20:59", hash: "596ec039", verdict: "fail" },
  { seq: 1, kind: "receipt", at: "05:21:00", hash: "3243f4fe", verdict: "pass" },
  { seq: 2, kind: "anchor", at: "05:21:00", hash: "8fabe083", leaves: 2 },
  { seq: 3, kind: "receipt", at: "05:27:46", hash: "cb58ae31", verdict: "pass" },
  { seq: 4, kind: "anchor", at: "05:27:46", hash: "c867f110", leaves: 1 },
  { seq: 5, kind: "receipt", at: "05:43:29", hash: "2bd05382", verdict: "pass" },
  { seq: 6, kind: "anchor", at: "05:43:29", hash: "2fe8c5a6", leaves: 1 },
  { seq: 7, kind: "receipt", at: "05:52:11", hash: "9bd54896", verdict: "pass" },
  { seq: 8, kind: "anchor", at: "05:52:11", hash: "98ab2dfb", leaves: 5 },
  { seq: 9, kind: "receipt", at: "05:53:31", hash: "30f17bb7", verdict: "pass" },
  { seq: 10, kind: "anchor", at: "05:53:31", hash: "cd646f90", leaves: 6 },
];

/* ---------- The simulated month, as the engine actually ran it ---------- */


/** The 185 events the CreateOS run produced for 30 rooms over 45 days. */
export const EVENTS: SimEventLike[] = sim.events;
export const MONTH_START = "2026-11-01";
export const KPI_TARGET = 45_000_000;

export const dateOfDay = (d: number) => addDays(MONTH_START, d);
export const roomsOnDay = (d: number): RoomView[] => (d < 0 ? roomsAt(EVENTS, "2026-10-31") : roomsAt(EVENTS, dateOfDay(d)));

/** Plain lines for everything that happened up to day d, newest last, each prefixed with its date. */
export function linesUpTo(d: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= d; i++) {
    const date = dateOfDay(i);
    for (const line of dayLines(EVENTS, date)) out.push(`${shortDate(date)} · ${line}`);
  }
  return out;
}

const on = (date: string, type: string) => EVENTS.filter((e) => e.date === date && e.type === type);
const kpi = EVENTS.find((e) => e.type === "kpi_alert" && e.date === "2026-11-15");

export type FlowEvent = { day: string; from: number; to: number; text: string };

/** Beats of the live-run graph. from: input index, to: output index. Counts read from the events. */
export const FLOW_EVENTS: FlowEvent[] = [
  { day: "Nov 1", from: 3, to: 1, text: `${on("2026-11-01", "invoice").length} invoices sent with payment links` },
  { day: "Nov 1", from: 2, to: 2, text: `${on("2026-11-01", "payment").length} rooms paid the same day` },
  { day: "Nov 4", from: 3, to: 0, text: `${on("2026-11-04", "reminder").length} reminders sent to unpaid rooms` },
  { day: "Nov 6", from: 2, to: 2, text: `${on("2026-11-06", "payment").length} more rooms paid after the reminder` },
  { day: "Nov 8", from: 3, to: 1, text: `${on("2026-11-08", "late_fee").length} late fees of Rp75,000 added` },
  { day: "Nov 11", from: 3, to: 0, text: `${on("2026-11-11", "reminder").length} second reminders sent` },
  { day: "Nov 11", from: 1, to: 1, text: "Long-stay tenant: late fee only after the 3-day grace" },
  { day: "Nov 15", from: 3, to: 0, text: `${on("2026-11-15", "notice").length} exit notices sent, unpaid rent or fees` },
  { day: "Nov 15", from: 2, to: 3, text: `${juta(kpi?.amount ?? 0)} of Rp45 jt collected, owner alerted` },
];

const nov15 = roomsAt(EVENTS, "2026-11-15");
const nov30 = roomsAt(EVENTS, "2026-11-30");

/** The owner's phone on Nov 15. */
export const TODAY = {
  date: "Nov 15",
  collected: juta(kpi?.amount ?? collectedBy(EVENTS, "2026-11-15")),
  collectedRatio: (kpi?.amount ?? 0) / KPI_TARGET,
  target: juta(KPI_TARGET),
  paid: nov15.filter((r) => r.status === "paid").length,
  fees: nov15.filter((r) => r.fee).length,
  notices: nov15.filter((r) => r.status === "notice").length,
  activity: ["2026-11-15", "2026-11-13", "2026-11-11"].map((d) => `${shortDate(d)} · ${dayLines(EVENTS, d).join(", ")}`),
};

/** End of the first month. */
export const MONTH_END = {
  paid: nov30.filter((r) => r.status === "paid").length,
  notices: nov30.filter((r) => r.status === "notice").length,
};

export { money };

/** Kinds of business the same agents fit next; boarding houses and minimarkets already run live. */
export const NEXT_BUSINESSES = ["clinics", "tutoring centres", "laundries", "any business with an SOP"];
