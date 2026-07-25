import type { WizardStep, StepRenderProps } from "@/components/wizard/types";
import {
  SelectGrid,
  CurrencyInput,
  BigCounter,
  CounterRow,
} from "@/components/wizard/fields";
import type { PredeceasedChild } from "./engine";

function EstateStep({ value, patch }: StepRenderProps) {
  const estate = value || { amount: 0, kanals: 0, marlas: 0 };
  const update = (next: Partial<typeof estate>) =>
    patch("estate", { amount: estate.amount || 0, kanals: estate.kanals || 0, marlas: estate.marlas || 0, ...next });

  return (
    <div className="space-y-6 text-left">
      <div>
        <label className="block text-sm font-bold text-neutral-800 mb-2">Amount (PKR)</label>
        <CurrencyInput value={estate.amount} onChange={(n) => update({ amount: n })} />
      </div>
      <div>
        <label className="block mb-2 text-left">
          <span className="text-sm font-bold text-neutral-800">Property</span>{" "}
          <span className="text-xs text-neutral-500 font-normal">(Land, house e.t.c)</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-xs text-neutral-500 mb-1">Kanals</span>
            <input
              type="number"
              min={0}
              className="block w-full px-4 py-3 border-2 border-neutral-200 rounded-lg text-neutral-800 font-bold"
              placeholder="0"
              value={estate.kanals || ""}
              onChange={(e) => {
                let v = parseInt(e.target.value, 10) || 0;
                if (v < 0) v = 0;
                update({ kanals: v });
              }}
            />
          </div>
          <div>
            <span className="block text-xs text-neutral-500 mb-1">Marlas</span>
            <input
              type="number"
              min={0}
              className="block w-full px-4 py-3 border-2 border-neutral-200 rounded-lg text-neutral-800 font-bold"
              placeholder="0"
              value={estate.marlas || ""}
              onChange={(e) => {
                let v = parseInt(e.target.value, 10) || 0;
                if (v < 0) v = 0;
                let k = estate.kanals || 0;
                if (v >= 20) {
                  k += Math.floor(v / 20);
                  v = v % 20;
                }
                update({ kanals: k, marlas: v });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PredeceasedStep({ value, patch, refresh }: StepRenderProps) {
  const list: PredeceasedChild[] = value && value.length ? value : [];
  if (list.length === 0) {
    // Seed with one default child.
    const seeded = [{ type: "son", spouseAlive: "no", grandsons: 0, granddaughters: 0 }];
    setTimeout(() => patch("predeceased", seeded), 0);
  }

  const commit = (next: PredeceasedChild[]) => {
    patch("predeceased", next);
    refresh();
  };

  return (
    <div className="space-y-6 text-left">
      {list.map((child, idx) => (
        <div
          key={idx}
          className="p-5 border border-neutral-200 rounded-2xl bg-white shadow-sm space-y-4 relative"
        >
          {list.length > 1 && (
            <button
              type="button"
              className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
              onClick={() => {
                const next = [...list];
                next.splice(idx, 1);
                commit(next);
              }}
            >
              Remove
            </button>
          )}
          <h4 className="text-sm font-black text-neutral-800 uppercase tracking-wider mb-2">
            Predeceased Child #{idx + 1}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-bold text-neutral-500 mb-1">Gender</span>
              <select
                className="w-full border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 font-bold"
                value={child.type}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = { ...child, type: e.target.value as "son" | "daughter" };
                  commit(next);
                }}
              >
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
              </select>
            </div>
            <div>
              <span className="block text-xs font-bold text-neutral-500 mb-1">Spouse Alive?</span>
              <select
                className="w-full border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 font-bold"
                value={child.spouseAlive}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = { ...child, spouseAlive: e.target.value as "yes" | "no" };
                  commit(next);
                }}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-bold text-neutral-500 mb-1">Grandsons count</span>
              <input
                type="number"
                min={0}
                className="w-full border border-neutral-300 rounded-lg p-2.5 font-bold"
                placeholder="0"
                value={child.grandsons === 0 ? "" : child.grandsons}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = { ...child, grandsons: parseInt(e.target.value, 10) || 0 };
                  commit(next);
                }}
              />
            </div>
            <div>
              <span className="block text-xs font-bold text-neutral-500 mb-1">
                Granddaughters count
              </span>
              <input
                type="number"
                min={0}
                className="w-full border border-neutral-300 rounded-lg p-2.5 font-bold"
                placeholder="0"
                value={child.granddaughters === 0 ? "" : child.granddaughters}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = { ...child, granddaughters: parseInt(e.target.value, 10) || 0 };
                  commit(next);
                }}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary w-full py-3 rounded-lg font-bold text-xs cursor-pointer shadow-sm border border-neutral-200"
        onClick={() =>
          commit([...list, { type: "son", spouseAlive: "no", grandsons: 0, granddaughters: 0 }])
        }
      >
        + Add Another Predeceased Child
      </button>
    </div>
  );
}

const aliveDeceased = (who: string) => [
  { value: "yes", label: "Alive", desc: `${who} will receive ${who === "Mother" ? "her" : "his"} legal share.` },
  { value: "no", label: "Deceased", desc: `${who} will be excluded.` },
];

export const inheritanceSteps: WizardStep[] = [
  {
    id: "estateAssets",
    field: "estate",
    question: "Assets",
    validate: (val) => {
      if (!val) return false;
      const amount = parseFloat(val.amount || 0);
      const kanals = parseInt(val.kanals || 0, 10);
      const marlas = parseInt(val.marlas || 0, 10);
      return (amount > 0 || kanals > 0 || marlas > 0) && amount >= 0 && kanals >= 0 && marlas >= 0;
    },
    render: (props) => <EstateStep {...props} />,
  },
  {
    id: "gender",
    field: "gender",
    question: "Deceased",
    autoSubmit: true,
    validate: (val) => ["male", "female"].includes(val),
    render: ({ value, setValue }) => (
      <SelectGrid
        value={value}
        onSelect={(v) => setValue("gender", v)}
        options={[
          { value: "male", label: "Male", desc: "Calculations will ask for surviving wives." },
          { value: "female", label: "Female", desc: "Calculations will ask for surviving husband." },
        ]}
      />
    ),
  },
  {
    id: "fatherAlive",
    field: "fatherAlive",
    question: "Father",
    autoSubmit: true,
    validate: (val) => ["yes", "no"].includes(val),
    render: ({ value, setValue }) => (
      <SelectGrid value={value} onSelect={(v) => setValue("fatherAlive", v)} options={aliveDeceased("Father")} />
    ),
  },
  {
    id: "motherAlive",
    field: "motherAlive",
    question: "Mother",
    autoSubmit: true,
    validate: (val) => ["yes", "no"].includes(val),
    render: ({ value, setValue }) => (
      <SelectGrid value={value} onSelect={(v) => setValue("motherAlive", v)} options={aliveDeceased("Mother")} />
    ),
  },
  {
    id: "spouseStatus",
    field: "spouse",
    question: (values) => (values.gender === "male" ? "Living Wives" : "Husband"),
    autoSubmit: (values) => values.gender === "female",
    validate: (val, values) => {
      if (values.gender === "male") {
        if (val === undefined || val === null) return true;
        const count = parseInt(String(val), 10);
        return !isNaN(count) && count >= 0 && count <= 4;
      }
      return ["yes", "no"].includes(val);
    },
    render: ({ value, values, setValue, patch }) => {
      if (values.gender === "male") {
        const count = parseInt(String(value || 0), 10);
        return <BigCounter value={count} min={0} max={4} onChange={(n) => patch("spouse", n)} />;
      }
      return (
        <SelectGrid value={value} onSelect={(v) => setValue("spouse", v)} options={aliveDeceased("Husband")} />
      );
    },
  },
  {
    id: "livingChildren",
    field: "children",
    question: "Living Children",
    validate: (val) => {
      if (val === undefined || val === null) return true;
      const sons = parseInt(val.sons || 0, 10);
      const daughters = parseInt(val.daughters || 0, 10);
      return sons >= 0 && daughters >= 0;
    },
    render: ({ value, patch }) => {
      const children = value || { sons: 0, daughters: 0 };
      const set = (next: { sons?: number; daughters?: number }) =>
        patch("children", { sons: children.sons || 0, daughters: children.daughters || 0, ...next });
      return (
        <div className="space-y-6 text-left">
          <CounterRow
            title="Sons"
            desc="Sons inherit as Residuaries (Asabah)"
            value={children.sons || 0}
            onChange={(n) => set({ sons: n })}
          />
          <CounterRow
            title="Daughters"
            desc="Daughters inherit fixed shares or residue with sons"
            value={children.daughters || 0}
            onChange={(n) => set({ daughters: n })}
          />
        </div>
      );
    },
  },
  {
    id: "predeceasedStatus",
    field: "predeceasedStatus",
    question: "Predeceased Children",
    autoSubmit: true,
    validate: (val) => ["yes", "no"].includes(val),
    render: ({ value, setValue, patch }) => (
      <SelectGrid
        value={value}
        onSelect={(v) => {
          if (v === "no") patch("predeceased", []);
          setValue("predeceasedStatus", v);
        }}
        options={[
          { value: "yes", label: "Yes", desc: "Any children died before the deceased." },
          { value: "no", label: "No", desc: "No predeceased children." },
        ]}
      />
    ),
  },
  {
    id: "predeceasedDetails",
    field: "predeceased",
    question: "Predeceased Child",
    shouldSkip: (values) => values.predeceasedStatus !== "yes",
    validate: (val) => {
      if (!val || val.length === 0) return false;
      return val.every((c: PredeceasedChild) => {
        const gs = parseInt(String(c.grandsons || 0), 10);
        const gd = parseInt(String(c.granddaughters || 0), 10);
        return gs >= 0 && gd >= 0;
      });
    },
    render: (props) => <PredeceasedStep {...props} />,
  },
  {
    id: "siblingsStatus",
    field: "siblings",
    question: "Living Siblings",
    shouldSkip: (values) => {
      const fatherAlive = values.fatherAlive === "yes";
      const sonsCount = values.children ? parseInt(String(values.children.sons || 0), 10) : 0;
      const predeceasedInput: PredeceasedChild[] = values.predeceased || [];
      const hasPredeceasedSonWithGrandson = predeceasedInput.some(
        (c) => c.type === "son" && parseInt(String(c.grandsons || 0), 10) > 0,
      );
      return fatherAlive || sonsCount > 0 || hasPredeceasedSonWithGrandson;
    },
    validate: (val) => {
      if (!val) return false;
      const b = parseInt(val.brothers || 0, 10);
      const s = parseInt(val.sisters || 0, 10);
      return b >= 0 && s >= 0;
    },
    render: ({ value, patch }) => {
      const sibs = value || { brothers: 0, sisters: 0 };
      const set = (next: { brothers?: number; sisters?: number }) =>
        patch("siblings", { brothers: sibs.brothers || 0, sisters: sibs.sisters || 0, ...next });
      return (
        <div className="space-y-6 text-left">
          <CounterRow
            title="Full Brothers"
            desc="Brothers inherit residue as Residuaries"
            value={sibs.brothers || 0}
            onChange={(n) => set({ brothers: n })}
          />
          <CounterRow
            title="Full Sisters"
            desc="Sisters inherit as fixed sharers or residuaries"
            value={sibs.sisters || 0}
            onChange={(n) => set({ sisters: n })}
          />
        </div>
      );
    },
  },
  {
    id: "nephewsStatus",
    field: "nephews",
    question: "Nephews",
    shouldSkip: (values) => {
      const fatherAlive = values.fatherAlive === "yes";
      const sonsCount = values.children ? parseInt(String(values.children.sons || 0), 10) : 0;
      const predeceasedInput: PredeceasedChild[] = values.predeceased || [];
      const hasPredeceasedSonWithGrandson = predeceasedInput.some(
        (c) => c.type === "son" && parseInt(String(c.grandsons || 0), 10) > 0,
      );
      const sibs = values.siblings || { brothers: 0, sisters: 0 };
      const brothersCount = parseInt(String(sibs.brothers || 0), 10);
      const sistersCount = parseInt(String(sibs.sisters || 0), 10);
      const daughtersCount = values.children ? parseInt(String(values.children.daughters || 0), 10) : 0;
      const predeceasedDaughters = predeceasedInput.filter((c) => {
        const gs = parseInt(String(c.grandsons || 0), 10);
        const gd = parseInt(String(c.granddaughters || 0), 10);
        return c.type === "daughter" && gs + gd > 0;
      });
      const virtualDaughtersCount = daughtersCount + predeceasedDaughters.length;
      return (
        fatherAlive ||
        sonsCount > 0 ||
        hasPredeceasedSonWithGrandson ||
        brothersCount > 0 ||
        (sistersCount > 0 && virtualDaughtersCount > 0)
      );
    },
    validate: (val) => {
      if (val === undefined || val === null) return true;
      const count = parseInt(String(val), 10);
      return !isNaN(count) && count >= 0;
    },
    render: ({ value, patch }) => {
      const count = parseInt(String(value || 0), 10);
      return (
        <div className="space-y-6 text-left">
          <CounterRow
            title="Living Full Nephews"
            desc="Brother's sons inherit residue as Residuaries"
            value={count}
            onChange={(n) => patch("nephews", n)}
          />
        </div>
      );
    },
  },
];
