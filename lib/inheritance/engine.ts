import { Fraction } from "./fraction";

export type PredeceasedChild = {
  type: "son" | "daughter";
  spouseAlive: "yes" | "no";
  grandsons: number;
  granddaughters: number;
};

export type InheritanceValues = {
  gender: "male" | "female";
  fatherAlive: "yes" | "no";
  motherAlive: "yes" | "no";
  spouse?: number | "yes" | "no";
  children?: { sons: number; daughters: number };
  predeceasedStatus?: "yes" | "no";
  predeceased?: PredeceasedChild[];
  siblings?: { brothers: number; sisters: number };
  nephews?: number;
  estate?: { amount: number; kanals: number; marlas: number };
};

export type Heir = {
  id: string;
  name: string;
  share: Fraction;
  type: string;
  expl: string;
  subHeirs?: Heir[];
};

export function formatRupees(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "Rs. 0";
  return "Rs. " + Math.round(amount).toLocaleString("en-US");
}

// Land formatting: converts a share fraction of totalMarlas into "X Kanal Y Marla".
export function formatProperty(
  shareFraction: Fraction,
  totalMarlas: number,
  abbreviate = false,
): string {
  if (totalMarlas <= 0) return abbreviate ? "0 M" : "0 Marla";
  const totalFloat = shareFraction.toFloat() * totalMarlas;
  if (totalFloat <= 0.00001) return abbreviate ? "0 M" : "0 Marla";
  const kanals = Math.floor(totalFloat / 20);
  const marlas = totalFloat % 20;
  const marlasFormatted = parseFloat(marlas.toFixed(2));
  const parts: string[] = [];
  if (kanals > 0) {
    parts.push(`${kanals} ${abbreviate ? "K" : kanals === 1 ? "Kanal" : "Kanals"}`);
  }
  if (marlasFormatted > 0 || kanals === 0) {
    parts.push(`${marlasFormatted} ${abbreviate ? "M" : marlasFormatted === 1 ? "Marla" : "Marlas"}`);
  }
  return parts.join(" ");
}

export function calculateInheritance(values: InheritanceValues): Heir[] {
  const gender = values.gender;
  const fatherAlive = values.fatherAlive === "yes";
  const motherAlive = values.motherAlive === "yes";
  const wivesCount = gender === "male" ? parseInt(String(values.spouse || 0), 10) : 0;
  const husbandAlive = gender === "female" ? values.spouse === "yes" : false;

  const sonsCount = parseInt(String(values.children ? values.children.sons : 0), 10);
  const daughtersCount = parseInt(String(values.children ? values.children.daughters : 0), 10);

  const predeceasedInput = values.predeceased || [];
  const predeceasedChildren = predeceasedInput.filter((c) => {
    const gs = parseInt(String(c.grandsons || 0), 10);
    const gd = parseInt(String(c.granddaughters || 0), 10);
    return gs + gd > 0;
  });

  const predeceasedSons = predeceasedChildren.filter((c) => c.type === "son");
  const predeceasedDaughters = predeceasedChildren.filter((c) => c.type === "daughter");
  const pSonsCount = predeceasedSons.length;
  const pDaughtersCount = predeceasedDaughters.length;

  const virtualSonsCount = sonsCount + pSonsCount;
  const virtualDaughtersCount = daughtersCount + pDaughtersCount;

  const hasPredeceasedSonWithGrandson = predeceasedInput.some((c) => {
    const gs = parseInt(String(c.grandsons || 0), 10);
    return c.type === "son" && gs > 0;
  });
  const isSiblingsBlocked = fatherAlive || sonsCount > 0 || hasPredeceasedSonWithGrandson;

  const brothersCount = isSiblingsBlocked
    ? 0
    : parseInt(String((values.siblings && values.siblings.brothers) || 0), 10);
  const sistersCount = isSiblingsBlocked
    ? 0
    : parseInt(String((values.siblings && values.siblings.sisters) || 0), 10);
  const siblingCount = brothersCount + sistersCount;

  const isNephewsBlocked =
    fatherAlive ||
    sonsCount > 0 ||
    hasPredeceasedSonWithGrandson ||
    brothersCount > 0 ||
    (sistersCount > 0 && virtualDaughtersCount > 0);
  const nephewsCount = isNephewsBlocked ? 0 : parseInt(String(values.nephews || 0), 10);

  const heirs: Heir[] = [];
  const addHeir = (id: string, name: string, share: Fraction, type: string, expl: string) => {
    heirs.push({ id, name, share, type, expl });
  };

  const hasChildren = virtualSonsCount + virtualDaughtersCount > 0;

  // 1. Spouse fixed share
  let spouseShare = new Fraction(0);
  if (gender === "male" && wivesCount > 0) {
    spouseShare = hasChildren ? new Fraction(1, 8) : new Fraction(1, 4);
    const individualShare = spouseShare.divNumber(wivesCount);
    for (let i = 1; i <= wivesCount; i++) {
      addHeir(
        `wife_${i}`,
        `Wife ${i}`,
        individualShare,
        "sharer",
        `Wife receives ${spouseShare.toString()} (shared equally) because the deceased left ${hasChildren ? "descendants" : "no descendants"}.`,
      );
    }
  } else if (gender === "female" && husbandAlive) {
    spouseShare = hasChildren ? new Fraction(1, 4) : new Fraction(1, 2);
    addHeir(
      "husband",
      "Husband",
      spouseShare,
      "sharer",
      `Husband receives ${spouseShare.toString()} because the deceased left ${hasChildren ? "descendants" : "no descendants"}.`,
    );
  }

  // 2. Mother fixed share
  if (motherAlive) {
    const isUmariyyatayn =
      !hasChildren && siblingCount === 0 && fatherAlive && (wivesCount > 0 || husbandAlive);
    if (isUmariyyatayn) {
      const residueAfterSpouse = new Fraction(1).sub(spouseShare);
      const motherShare = residueAfterSpouse.divNumber(3);
      addHeir(
        "mother",
        "Mother",
        motherShare,
        "sharer",
        "Mother receives 1/3 of the residue after spouse's share (Umariyyatayn rule).",
      );
    } else {
      const motherOneSixth = hasChildren || siblingCount >= 2;
      const motherShare = motherOneSixth ? new Fraction(1, 6) : new Fraction(1, 3);
      addHeir(
        "mother",
        "Mother",
        motherShare,
        "sharer",
        `Mother receives ${motherShare.toString()} because ${
          hasChildren
            ? "descendants exist"
            : siblingCount >= 2
              ? "multiple siblings survive"
              : "no descendants and at most one sibling survive"
        }.`,
      );
    }
  }

  // 3. Father fixed share / residuary status
  let fatherIsResiduaryOnly = false;
  if (fatherAlive) {
    if (virtualSonsCount > 0) {
      addHeir(
        "father",
        "Father",
        new Fraction(1, 6),
        "sharer",
        "Father receives 1/6 as a fixed Quranic share because male descendants exist.",
      );
    } else if (virtualDaughtersCount > 0) {
      addHeir(
        "father",
        "Father",
        new Fraction(1, 6),
        "sharer_and_residuary",
        "Father receives 1/6 as a fixed Quranic share plus residue because only female descendants exist.",
      );
    } else {
      fatherIsResiduaryOnly = true;
    }
  }

  // 4. Daughters fixed share (only if no sons)
  let daughtersAreResiduaries = false;
  if (virtualDaughtersCount > 0) {
    if (virtualSonsCount > 0) {
      daughtersAreResiduaries = true;
    } else {
      const daughtersFixedShare =
        virtualDaughtersCount === 1 ? new Fraction(1, 2) : new Fraction(2, 3);
      const individualDaughterShare = daughtersFixedShare.divNumber(virtualDaughtersCount);
      for (let i = 1; i <= daughtersCount; i++) {
        addHeir(
          `daughter_${i}`,
          `Daughter ${i}`,
          individualDaughterShare,
          "sharer",
          `Daughter receives share of ${daughtersFixedShare.toString()} (shared equally) as no sons exist.`,
        );
      }
      for (let i = 1; i <= pDaughtersCount; i++) {
        addHeir(
          `p_daughter_${i}`,
          `Predeceased Daughter ${i} (Virtual)`,
          individualDaughterShare,
          "virtual_p_daughter",
          "Predeceased daughter's virtual share.",
        );
      }
    }
  }

  // 5. Sisters fixed share
  let sistersAreResiduaries = false;
  if (sistersCount > 0 && !isSiblingsBlocked) {
    if (brothersCount > 0 || virtualDaughtersCount > 0) {
      sistersAreResiduaries = true;
    } else {
      const sistersFixedShare = sistersCount === 1 ? new Fraction(1, 2) : new Fraction(2, 3);
      const individualSisterShare = sistersFixedShare.divNumber(sistersCount);
      for (let i = 1; i <= sistersCount; i++) {
        addHeir(
          `sister_${i}`,
          `Full Sister ${i}`,
          individualSisterShare,
          "sharer",
          `Sister receives share of ${sistersFixedShare.toString()} (shared equally) as a fixed Quranic share.`,
        );
      }
    }
  }

  // 6. Aul (increase)
  let totalFixed = new Fraction(0);
  heirs.forEach((h) => {
    totalFixed = totalFixed.add(h.share);
  });

  if (totalFixed.toFloat() > 1) {
    heirs.forEach((h) => {
      h.share = h.share.div(totalFixed);
      h.expl += ` [Adjusted by Aul to ${h.share.toString()}]`;
    });
    if (brothersCount > 0) {
      for (let i = 1; i <= brothersCount; i++) {
        addHeir(
          `brother_${i}`,
          `Full Brother ${i}`,
          new Fraction(0),
          "residuary",
          "Brother inherits as Asabah (Residuary) but receives 0 share as estate is fully exhausted.",
        );
      }
    }
    if (sistersAreResiduaries && sistersCount > 0) {
      for (let i = 1; i <= sistersCount; i++) {
        addHeir(
          `sister_${i}`,
          `Full Sister ${i}`,
          new Fraction(0),
          "residuary",
          "Sister inherits as Asabah (Residuary) but receives 0 share as estate is fully exhausted.",
        );
      }
    }
    return finalizeDistribution(heirs, predeceasedInput);
  }

  // 7. Distribute residue (Asabah)
  let residue = new Fraction(1).sub(totalFixed);

  if (residue.toFloat() > 0) {
    if (virtualSonsCount > 0) {
      const totalSonsParts = virtualSonsCount * 2;
      const totalDaughtersParts = virtualDaughtersCount;
      const totalParts = totalSonsParts + totalDaughtersParts;
      const sonPartShare = residue.mul(new Fraction(2, totalParts));
      const daughterPartShare = residue.mul(new Fraction(1, totalParts));

      for (let i = 1; i <= sonsCount; i++) {
        addHeir(
          `son_${i}`,
          `Son ${i}`,
          sonPartShare,
          "residuary",
          "Son inherits as a Residuary (Asabah) in a 2:1 ratio.",
        );
      }
      for (let i = 1; i <= pSonsCount; i++) {
        addHeir(
          `p_son_${i}`,
          `Predeceased Son ${i} (Virtual)`,
          sonPartShare,
          "virtual_p_son",
          "Predeceased son's virtual share.",
        );
      }
      if (daughtersAreResiduaries) {
        for (let i = 1; i <= daughtersCount; i++) {
          addHeir(
            `daughter_${i}`,
            `Daughter ${i}`,
            daughterPartShare,
            "residuary",
            "Daughter inherits as a Residuary (Asabah) in a 1:2 ratio alongside sons.",
          );
        }
        for (let i = 1; i <= pDaughtersCount; i++) {
          addHeir(
            `p_daughter_${i}`,
            `Predeceased Daughter ${i} (Virtual)`,
            daughterPartShare,
            "virtual_p_daughter",
            "Predeceased daughter's virtual share.",
          );
        }
      }
      residue = new Fraction(0);
    } else if (fatherAlive && fatherIsResiduaryOnly) {
      addHeir(
        "father",
        "Father",
        residue,
        "residuary",
        "Father inherits all remaining estate as a Residuary (Asabah) because no children exist.",
      );
      residue = new Fraction(0);
    } else if (fatherAlive && virtualDaughtersCount > 0) {
      const fatherHeir = heirs.find((h) => h.id === "father");
      if (fatherHeir) {
        fatherHeir.share = fatherHeir.share.add(residue);
        fatherHeir.expl += ` [Plus residue of ${residue.toString()} as Residuary]`;
      }
      residue = new Fraction(0);
    } else if (!isSiblingsBlocked && (brothersCount > 0 || sistersAreResiduaries)) {
      if (brothersCount > 0) {
        const totalParts = brothersCount * 2 + sistersCount;
        const broPart = residue.mul(new Fraction(2, totalParts));
        const sisPart = residue.mul(new Fraction(1, totalParts));
        for (let i = 1; i <= brothersCount; i++) {
          addHeir(
            `brother_${i}`,
            `Full Brother ${i}`,
            broPart,
            "residuary",
            sistersCount > 0
              ? "Brother inherits as Asabah (Residuary) in a 2:1 ratio alongside sisters."
              : "Brother inherits residue as Asabah (Residuary).",
          );
        }
        for (let i = 1; i <= sistersCount; i++) {
          addHeir(
            `sister_${i}`,
            `Full Sister ${i}`,
            sisPart,
            "residuary",
            "Sister inherits as Asabah (Residuary) in a 1:2 ratio alongside brothers.",
          );
        }
      } else {
        const sisPart = residue.divNumber(sistersCount);
        for (let i = 1; i <= sistersCount; i++) {
          addHeir(
            `sister_${i}`,
            `Full Sister ${i}`,
            sisPart,
            "residuary",
            "Sister inherits residue as Asabah alongside daughters.",
          );
        }
      }
      residue = new Fraction(0);
    } else if (!isNephewsBlocked && nephewsCount > 0) {
      const nephewPart = residue.divNumber(nephewsCount);
      for (let i = 1; i <= nephewsCount; i++) {
        addHeir(
          `nephew_${i}`,
          `Full Nephew ${i}`,
          nephewPart,
          "residuary",
          "Nephew inherits residue as Asabah (Residuary) in the absence of closer residuaries.",
        );
      }
      residue = new Fraction(0);
    }
  }

  // 8. Radd (return)
  if (residue.toFloat() > 0.00001) {
    const raddHeirs = heirs.filter(
      (h) => h.type === "sharer" && h.id !== "husband" && !h.id.startsWith("wife_"),
    );
    if (raddHeirs.length > 0) {
      let totalRaddShares = new Fraction(0);
      raddHeirs.forEach((h) => {
        totalRaddShares = totalRaddShares.add(h.share);
      });
      raddHeirs.forEach((h) => {
        const proportion = h.share.div(totalRaddShares);
        const raddPortion = residue.mul(proportion);
        h.share = h.share.add(raddPortion);
        h.expl += ` [Increased by Radd by ${raddPortion.toString()}]`;
      });
      residue = new Fraction(0);
    } else {
      const wives = heirs.filter((h) => h.id.startsWith("wife_"));
      const spouseHeir = heirs.find((h) => h.id === "husband" || h.id.startsWith("wife_"));
      if (wives.length > 0) {
        const splitResidue = residue.divNumber(wives.length);
        wives.forEach((w) => {
          w.share = w.share.add(splitResidue);
          w.expl += " [Received residue by Radd as sole heir type]";
        });
        residue = new Fraction(0);
      } else if (spouseHeir) {
        spouseHeir.share = spouseHeir.share.add(residue);
        spouseHeir.expl += " [Received full residue by Radd as sole heir]";
        residue = new Fraction(0);
      }
    }
  }

  return finalizeDistribution(heirs, predeceasedInput);
}

// Resolve predeceased child branches under MFLO Section 4.
function finalizeDistribution(allHeirs: Heir[], predeceasedInput: PredeceasedChild[]): Heir[] {
  const finalHeirs: Heir[] = [];

  allHeirs.forEach((h) => {
    if (!h.id.startsWith("p_son_") && !h.id.startsWith("p_daughter_")) {
      finalHeirs.push(h);
    }
  });

  let virtualSonIdx = 1;
  let virtualDaughterIdx = 1;

  predeceasedInput.forEach((childInput, index) => {
    const idx = index + 1;
    const isSon = childInput.type === "son";

    const gs = parseInt(String(childInput.grandsons || 0), 10);
    const gd = parseInt(String(childInput.granddaughters || 0), 10);
    const hasGrandchildren = gs + gd > 0;

    let virtualHeir: Heir | undefined;
    if (hasGrandchildren) {
      if (isSon) {
        virtualHeir = allHeirs.find((h) => h.id === `p_son_${virtualSonIdx}`);
        virtualSonIdx++;
      } else {
        virtualHeir = allHeirs.find((h) => h.id === `p_daughter_${virtualDaughterIdx}`);
        virtualDaughterIdx++;
      }
    }

    const branchHeir: Heir = {
      id: isSon ? `p_son_${idx}` : `p_daughter_${idx}`,
      name: isSon ? `Predeceased Son ${idx}` : `Predeceased Daughter ${idx}`,
      share: virtualHeir && hasGrandchildren ? virtualHeir.share : new Fraction(0),
      type: "mflo_branch",
      expl: isSon
        ? "Under MFLO Section 4, this share will be distributed to his heirs"
        : "Under MFLO Section 4, this share will be distributed to her heirs",
      subHeirs: [],
    };

    if (hasGrandchildren && branchHeir.share.toFloat() > 0) {
      const branchShare = branchHeir.share;
      const spouseAlive = childInput.spouseAlive === "yes";

      let childrenShare = branchShare;
      if (spouseAlive) {
        const spouseFraction = isSon ? new Fraction(1, 8) : new Fraction(1, 4);
        const spShare = branchShare.mul(spouseFraction);
        childrenShare = branchShare.sub(spShare);
        branchHeir.subHeirs!.push({
          id: isSon ? `p_son_${idx}_widow` : `p_daughter_${idx}_husband`,
          name: isSon ? "Widow" : "Widower",
          share: spShare,
          type: "mflo_spouse",
          expl: `Receives ${isSon ? "1/8" : "1/4"} of the branch share (${branchShare.toString()}) under MFLO Section 4.`,
        });
      }

      const totalParts = gs * 2 + gd;
      if (totalParts > 0) {
        const gsShare = childrenShare.mul(new Fraction(2, totalParts));
        const gdShare = childrenShare.mul(new Fraction(1, totalParts));
        for (let i = 1; i <= gs; i++) {
          branchHeir.subHeirs!.push({
            id: isSon ? `p_son_${idx}_grandson_${i}` : `p_daughter_${idx}_grandson_${i}`,
            name: `Grandson ${i}`,
            share: gsShare,
            type: "mflo_child",
            expl: `Inherits from branch share (${branchShare.toString()}) under MFLO Section 4 (2:1 ratio).`,
          });
        }
        for (let i = 1; i <= gd; i++) {
          branchHeir.subHeirs!.push({
            id: isSon ? `p_son_${idx}_granddaughter_${i}` : `p_daughter_${idx}_granddaughter_${i}`,
            name: `Granddaughter ${i}`,
            share: gdShare,
            type: "mflo_child",
            expl: `Inherits from branch share (${branchShare.toString()}) under MFLO Section 4 (1:2 ratio).`,
          });
        }
      }
    } else {
      branchHeir.share = new Fraction(0);
      branchHeir.expl =
        "No surviving children (grandchildren of the deceased) exist, so this branch receives 0 share.";
    }

    finalHeirs.push(branchHeir);
  });

  return finalHeirs;
}
