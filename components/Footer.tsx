import OfficeAddress from "./OfficeAddress";

export default function Footer({ showSocial = false }: { showSocial?: boolean }) {
  return (
    <footer className="no-print border-t border-neutral-100 bg-white py-10 mt-auto text-xs text-neutral-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Left: Logo, disclaimer, social */}
          <div className="text-left flex flex-col items-start w-full md:w-auto">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-black text-neutral-800 tracking-wider text-xs uppercase">
                Chaudhary Law Associates
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-normal max-w-xs">
              Expert in Real Estate Matters
            </p>
            {showSocial && (
              <div className="flex items-center gap-3 mt-3">
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          <OfficeAddress />

          {/* Right: Privacy safeguard */}
          <div className="text-left md:text-right flex flex-col md:items-end w-full md:w-auto">
            <p className="font-black text-neutral-800 uppercase tracking-wider text-xs">
              Privacy Safeguard
            </p>
            <p className="text-[11px] text-neutral-500 max-w-xs leading-normal mt-1">
              All calculations happen 100% locally on your computer. No data is stored.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-200/60 text-[10px] tracking-wide text-neutral-400 text-left">
          Developed by{" "}
          <a
            href="https://techvorasoft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-orange hover:underline focus-visible:underline"
          >
            TechVoraSoft
          </a>
        </div>
      </div>
    </footer>
  );
}
