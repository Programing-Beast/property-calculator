import Link from "next/link";

type ActiveCalc = "none" | "registry" | "inheritance";

export default function Header({ active = "none" }: { active?: ActiveCalc }) {
  return (
    <header className="no-print border-b border-neutral-100 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-extrabold text-sm sm:text-lg tracking-tight text-neutral-900 hover:opacity-90 flex items-center gap-2.5"
        >
          <span className="header-title-text">Chaudhary Law Associates</span>
        </Link>

        {active !== "none" && (
          <div className="flex items-center gap-2 sm:gap-4">
            <CalcToggle active={active} />
          </div>
        )}
      </div>
    </header>
  );
}

function CalcToggle({ active }: { active: ActiveCalc }) {
  const base =
    "flex-1 text-center text-[9px] sm:text-xs font-bold z-10 transition-colors duration-300 py-1";
  return (
    <div className="relative flex items-center bg-neutral-100 p-[2px] rounded border border-neutral-200 w-36 sm:w-44 h-8 select-none">
      <div
        className="absolute top-[2px] bottom-[2px] w-[calc(50%-2px)] bg-white rounded border border-neutral-200 shadow-sm transition-all duration-300 ease-in-out"
        style={{ left: active === "inheritance" ? "50%" : "2px" }}
      />
      <Link
        href="/tools/calculators/property-registry-expenses"
        className={`${base} ${active === "registry" ? "text-neutral-900" : "text-neutral-400"}`}
      >
        Registry
      </Link>
      <Link
        href="/tools/calculators/islamic-inheritance"
        className={`${base} ${active === "inheritance" ? "text-neutral-900" : "text-neutral-400"}`}
      >
        Inheritance
      </Link>
    </div>
  );
}
