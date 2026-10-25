import { Fraction } from "./fraction";
import {
  formatRupees,
  formatProperty,
  type Heir,
  type InheritanceValues,
} from "./engine";

function categoryKey(id: string): string {
  if (id.startsWith("p_son_")) return "predeceased_son";
  if (id.startsWith("p_daughter_")) return "predeceased_daughter";
  if (id.includes("granddaughter")) return "granddaughter";
  if (id.includes("grandson")) return "grandson";
  if (id.includes("widow")) return "widow";
  return id.split("_")[0];
}

const SINGULAR: Record<string, string> = {
  daughter: "Daughter",
  predeceased_daughter: "Predeceased Daughter",
  predeceased_son: "Predeceased Son",
  granddaughter: "Granddaughter",
  grandson: "Grandson",
  son: "Son",
  wife: "Wife",
  widow: "Widow",
  husband: "Husband",
  brother: "Full Brother",
  sister: "Full Sister",
  nephew: "Full Nephew",
};

/** If only one heir of a category exists, drop the trailing " 1" from its name. */
export function groupHeirsList(list: Heir[]): Heir[] {
  const counts: Record<string, number> = {};
  list.forEach((h) => {
    const key = categoryKey(h.id);
    counts[key] = (counts[key] || 0) + 1;
  });
  return list.map((h) => {
    const key = categoryKey(h.id);
    if (counts[key] === 1 && SINGULAR[key]) {
      return { ...h, name: SINGULAR[key] };
    }
    return h;
  });
}

export function sortHeirs(list: Heir[]): Heir[] {
  const priority = (h: Heir): number => {
    const id = h.id;
    if (id.startsWith("wife") || id === "husband") return 1;
    if (id === "father" || id === "mother") return 2;
    if (id.startsWith("son") || id.startsWith("daughter")) return 3;
    if (id.startsWith("predeceased") || id.startsWith("p_son") || id.startsWith("p_daughter"))
      return 4;
    if (id.startsWith("brother") || id.startsWith("sister")) return 5;
    if (id.startsWith("nephew")) return 6;
    return 7;
  };
  return [...list].sort((a, b) => priority(a) - priority(b));
}

export type LivingHeirLabel = string;

/** Build the "Living Heirs" chip labels from the raw distribution. */
export function buildLivingHeirs(distribution: Heir[], vals: InheritanceValues): LivingHeirLabel[] {
  const out: string[] = [];
  const added = new Set<string>();

  distribution.forEach((heir) => {
    const isBranch = heir.type === "mflo_branch" || heir.id.includes("predeceased_");
    if (!isBranch && heir.share.toFloat() > 0) {
      const key = heir.id.split("_")[0];
      if (key === "p") return;

      let count = 1;
      if (key === "daughter") count = parseInt(String(vals.children?.daughters || 0), 10);
      else if (key === "son") count = parseInt(String(vals.children?.sons || 0), 10);
      else if (key === "wife") count = parseInt(String(vals.spouse || 0), 10);
      else if (key === "brother") count = parseInt(String(vals.siblings?.brothers || 0), 10);
      else if (key === "sister") count = parseInt(String(vals.siblings?.sisters || 0), 10);
      else if (key === "nephew") count = parseInt(String(vals.nephews || 0), 10);

      const uniqueKey = `${key}_${count}`;
      if (added.has(uniqueKey)) return;
      added.add(uniqueKey);

      let name = "";
      if (key === "daughter") name = count === 1 ? "Daughter" : `${count} Daughters`;
      else if (key === "son") name = count === 1 ? "Son" : `${count} Sons`;
      else if (key === "wife") name = count === 1 ? "Wife" : `${count} Wives`;
      else if (key === "brother") name = count === 1 ? "Full Brother" : `${count} Full Brothers`;
      else if (key === "sister") name = count === 1 ? "Full Sister" : `${count} Full Sisters`;
      else if (key === "nephew") name = count === 1 ? "Full Nephew" : `${count} Full Nephews`;
      else if (key === "husband") name = "Husband";
      else if (key === "father") name = "Father";
      else if (key === "mother") name = "Mother";
      if (name) out.push(name);
    } else if (isBranch && heir.share.toFloat() > 0) {
      const key = heir.id.includes("son") ? "predeceased_son" : "predeceased_daughter";
      const count = (vals.predeceased || []).filter((c) => {
        const gs = parseInt(String(c.grandsons || 0), 10);
        const gd = parseInt(String(c.granddaughters || 0), 10);
        return c.type === (key === "predeceased_son" ? "son" : "daughter") && gs + gd > 0;
      }).length;

      const uniqueKey = `${key}_${count}`;
      if (added.has(uniqueKey)) return;
      added.add(uniqueKey);

      let name = "";
      if (key === "predeceased_son")
        name = count === 1 ? "Predeceased Son" : `${count} Predeceased Sons`;
      else name = count === 1 ? "Predeceased Daughter" : `${count} Predeceased Daughters`;
      if (name) out.push(name);

      if (heir.subHeirs) {
        heir.subHeirs.forEach((sub) => {
          if (sub.id.includes("widow") || sub.id.includes("husband")) {
            const isWidow = sub.id.includes("widow");
            const subKey = isWidow ? "mflo_widow" : "mflo_widower";
            if (added.has(subKey)) return;
            added.add(subKey);
            out.push(
              isWidow ? "Widow (of predeceased son)" : "Widower (of predeceased daughter)",
            );
          }
        });
      }
    }
  });

  return out;
}

export function buildInheritanceShareText(distribution: Heir[], vals: InheritanceValues): string {
  const estate = vals.estate || { amount: 0, kanals: 0, marlas: 0 };
  const totalMarlas = parseInt(String(estate.kanals || 0), 10) * 20 + parseInt(String(estate.marlas || 0), 10);
  const hasAmount = estate.amount > 0;
  const hasProperty = totalMarlas > 0;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  let txt = "Chaudhary Law Associates — Islamic Inheritance Distribution Report\n";
  txt += `Generated On: ${new Date().toLocaleDateString()}\n`;
  txt += "--------------------------------------------------\n";
  if (hasAmount) txt += `Amount: ${formatRupees(estate.amount)}\n`;
  if (hasProperty) txt += `Property: ${formatProperty(new Fraction(1, 1), totalMarlas, false)}\n`;
  txt += "--------------------------------------------------\n";

  const grouped = sortHeirs(groupHeirsList(distribution));
  grouped.forEach((heir) => {
    const fractionStr = heir.share.toString();
    const pct = (heir.share.toFloat() * 100).toFixed(2) + "%";
    let line = `${heir.name}: Share ${fractionStr} (${pct})`;
    if (hasAmount) line += ` | Amount: ${formatRupees(heir.share.toFloat() * estate.amount)}`;
    if (hasProperty) line += ` | Property: ${formatProperty(heir.share, totalMarlas, hasAmount)}`;
    let expl = "";
    if (heir.type === "mflo_branch" && heir.share.toFloat() > 0) {
      const isSon = heir.id.includes("son");
      expl = ` (Under MFLO Section 4, this share will be distributed to ${isSon ? "his" : "her"} heirs)`;
    }
    txt += `${line}${expl}\n`;
  });
  txt += "--------------------------------------------------\n";
  txt += `Calculate inheritance distribution at: ${shareUrl}\n`;
  return txt;
}
