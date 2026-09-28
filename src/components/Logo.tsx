export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="wbyi-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0a84ff" />
          <stop offset="0.55" stopColor="#7d4cdb" />
          <stop offset="1" stopColor="#e3246b" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#wbyi-g)" />
      <path d="M11.5 23.5 20 15l8.5 8.5" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 29.5h12" stroke="#fff" strokeOpacity=".7" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={26} />
      <span className="text-[17px] font-semibold tracking-[-0.022em]">We Build Your Ideas</span>
    </span>
  );
}
