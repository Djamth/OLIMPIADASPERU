interface CountryFlagProps {
  code?: string | null;
  countryName?: string | null;
  className?: string;
}

export function CountryFlag({ code, countryName, className = "" }: CountryFlagProps) {
  const normalizedCode = code?.trim().toLowerCase();
  const isValidCode = Boolean(normalizedCode && /^[a-z]{2}$/.test(normalizedCode));
  const label = countryName ? `Bandera de ${countryName}` : "Bandera del país";

  if (!isValidCode) {
    return (
      <span
        aria-label={label}
        className={`inline-flex h-4 w-6 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-[8px] font-black uppercase text-slate-400 ring-1 ring-slate-200 ${className}`}
      >
        {normalizedCode || "--"}
      </span>
    );
  }

  return (
    <span
      aria-label={label}
      role="img"
      className={`fi fi-${normalizedCode} shrink-0 overflow-hidden rounded-sm shadow-sm ring-1 ring-slate-200 ${className}`}
    />
  );
}
