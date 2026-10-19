/**
 * Pack 2, real data only. Sources:
 * - fixtures/minimarket/sop.md and rulebook.json (Minimarket Berkah's SOP and the compiled rules)
 * - fixtures/minimarket/sim-events.json (the events CreateOS run smvdjl83a-1 produced on 18 Oct 2026:
 *   24 items, 30 simulated days, two suppliers)
 * Every figure is counted from those events, through the same pack view the owner app renders.
 */

import type { Rulebook } from "@reeve/core";
import { minimarketPack, type Tone } from "@reeve/core/packs";
import { eventDays, juta, rupiah, shortDate, type SimEventLike } from "@reeve/core/simview";
import rulebookJson from "@reeve/core/fixtures/minimarket/rulebook.json";
import sim from "@reeve/core/fixtures/minimarket/sim-events.json";

export const MM_EVENTS: SimEventLike[] = sim.events;
const RULEBOOK = rulebookJson as unknown as Rulebook;

/** "Rp3.0 jt": one decimal kept, for amounts the owner compares. */
export const jt1 = (n: number) => `Rp${(n / 1e6).toFixed(1)} jt`;
export { juta, rupiah };

const of = (type: string) => MM_EVENTS.filter((e) => e.type === type);
const total = (xs: SimEventLike[]) => xs.reduce((s, e) => s + (e.amount ?? 0), 0);

/** Item names as the shop's list has them ("Beras 5kg"), from the run's status events. */
const NAMES = new Map<string, string>();
for (const e of MM_EVENTS) {
  const label = (e as SimEventLike & { label?: string }).label;
  if (e.type === "status" && label) NAMES.set(e.tenant_id, label);
}
export const itemName = (id: string) => NAMES.get(id) ?? id;
const shortName = (id: string) => itemName(id).split(" ").slice(0, 2).join(" ");

const poCard = RULEBOOK.cards.find((c) => c.type === "po_approval_threshold");
const limitCard = RULEBOOK.cards.find((c) => c.type === "expiring_value_limit");
export const PO_LIMIT = poCard?.type === "po_approval_threshold" ? poCard.po_above : 0;
export const EXPIRY_LIMIT = limitCard?.type === "expiring_value_limit" ? limitCard.max_value : 0;

const runDate = (sim.source.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "2026-10-18").split("-");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const MM_RUN = {
  id: sim.run_id,
  date: `${Number(runDate[2])} ${MONTHS[Number(runDate[1]) - 1]} ${runDate[0]}`,
  sandbox: sim.sandbox,
  receipt: sim.receipt.slice(0, 8),
  verdict: sim.verdict,
  builder: { pass: sim.builder_tests.ran - sim.builder_tests.failed, ran: sim.builder_tests.ran },
  spec: { pass: sim.audit_spec.ran - sim.audit_spec.failed, ran: sim.audit_spec.ran },
  mutants: { killed: sim.mutation.killed, total: sim.mutation.total },
  items: NAMES.size,
};

/* ---------- The simulated month, one entry per day, as the owner app would show it ---------- */

export type ShelfItem = { id: string; name: string; short: string; status: string; tone: Tone; flag?: string; waiting: boolean };
export type MmDay = { date: string; day: string; monday: boolean; alert: boolean; expiring: number; lines: string[]; items: ShelfItem[] };

export const MM_TIMELINE: MmDay[] = eventDays(MM_EVENTS).map((date) => {
  const view = minimarketPack.view(MM_EVENTS, date, RULEBOOK);
  return {
    date,
    day: shortDate(date),
    monday: new Date(`${date}T00:00:00Z`).getUTCDay() === 1,
    alert: MM_EVENTS.some((e) => e.date === date && e.type === "kpi_alert"),
    expiring: view.kpis[0]?.value ?? 0,
    lines: view.lines,
    items: view.entities.map((e) => ({
      id: e.id,
      name: itemName(e.id),
      short: shortName(e.id),
      status: e.status,
      tone: minimarketPack.statuses[e.status]?.tone ?? "idle",
      flag: e.flags.find((f) => f.endsWith("off")),
      waiting: e.flags.includes("waiting for your approval"),
    })),
  };
});

/** The Monday checks of the expiring-stock limit (rule M8). */
export const MONDAYS = MM_TIMELINE.flatMap((d, i) => (d.monday ? [{ index: i, day: d.day, value: d.expiring, alert: d.alert }] : []));

/* ---------- The whole month, counted ---------- */

const approval = of("po_approval_request")[0];
const [approvalSupplier = "A", approvalQty = "0"] = (approval?.note ?? "").split(":");
const kpiAlert = of("kpi_alert")[0];
const lastView = minimarketPack.view(MM_EVENTS, MM_TIMELINE.at(-1)?.date ?? "", RULEBOOK);

const [switchFrom = "A", switchTo = "B"] = (of("supplier_switched")[0]?.note ?? "").split("->");

export const MONTH = {
  switchFrom,
  switchTo,
  orders: of("po_created").length,
  ordersValue: total(of("po_created")),
  switched: of("supplier_switched").length,
  markdowns: of("markdown").length,
  writtenOff: total(of("writeoff")),
  stopped: of("reorder_stopped").length,
  /** Orders above the owner's limit still waiting for the passkey at the end of the month. */
  waiting: lastView.exceptions.filter((x) => x.needsPasskey).length,
};

export const APPROVAL = {
  item: itemName(approval?.tenant_id ?? ""),
  qty: Number(approvalQty),
  supplier: approvalSupplier,
  amount: approval?.amount ?? 0,
  day: shortDate(approval?.date ?? MM_TIMELINE[0]?.date ?? ""),
};

export const ALERT = { day: shortDate(kpiAlert?.date ?? ""), value: kpiAlert?.amount ?? 0 };
