import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-emerald-500 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

type Card = {
  href: string;
  title: string;
  desc: string;
  features: string[];
  icon: React.ReactNode;
};

const cards: Card[] = [
  {
    href: "/tools/calculators/property-registry-expenses",
    title: "Registry Expenses Calculator",
    desc: "Calculate buyer and seller property registration taxes, stamp duty, TMA fees, and withholding taxes in Pakistan.",
    features: [
      "Filer & Non-filer tax rates matching latest schedules",
      "Detailed client-ready PDF invoice generation",
      "Guided step-by-step onboarding",
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/tools/calculators/islamic-inheritance",
    title: "Inheritance Calculator",
    desc: "Calculate legal shares of amount and property under Fiqh Hanafi and MFLO Section 4 of the Muslim Family Laws Ordinance 1961.",
    features: [
      "Supports Fiqh Hanafi rules (Sharers, Asabah, Aul, Radd)",
      "Full implementation of MFLO 1961 Section 4",
      "Exact fractional engine for complete accuracy",
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col justify-center items-center py-10 sm:py-16 px-4">
        <div className="w-full max-w-5xl text-center mb-10 sm:mb-14">
          <span className="text-xs font-bold text-brand-orange tracking-widest uppercase mb-2 block">
            Chaudhary Law Associates
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight mb-4">
            Property Calculators
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Select a calculator below to start legal and property calculations. Safe, private, and
            offline-ready.
          </p>
        </div>

        <div className="w-full max-w-4xl px-2 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {cards.map((card) => (
            <div
              key={card.href}
              className="group bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-brand-orange mb-6 border border-orange-100 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-3">
                  {card.title}
                </h2>
                <p className="text-neutral-500 text-sm leading-relaxed mb-6">{card.desc}</p>
                <ul className="text-xs text-neutral-600 space-y-3 mb-8">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={card.href}
                className="w-full text-center py-3.5 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-sm block"
              >
                Launch Calculator
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
