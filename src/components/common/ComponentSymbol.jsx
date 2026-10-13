const ComponentSymbol = ({ name = '', size = 72 }) => {
  const normalizedName = name.toLowerCase();
  let symbol;

  if (normalizedName.includes('resistor')) {
    symbol = <polyline points="8,50 22,50 29,37 39,63 49,37 59,63 69,37 76,50 92,50" />;
  } else if (normalizedName.includes('capacitor')) {
    symbol = <>
      <path d="M8 50h34M58 50h34M42 30v40M58 30v40" />
    </>;
  } else if (normalizedName.includes('diode')) {
    symbol = <>
      <path d="M8 50h28M64 50h28M38 32v36l26-18-26-18Z" />
      <path d={normalizedName.includes('zener') ? 'M64 31l-6 6 6 6M64 57l6 6-6 6' : 'M64 32v36'} />
      {normalizedName.includes('led') && <path d="M48 27l10-10m-6 1 6-1-1 6M59 36l10-10m-6 1 6-1-1 6" />}
    </>;
  } else if (normalizedName.includes('transistor') || normalizedName.includes('bjt') || normalizedName.includes('bc547')) {
    symbol = <>
      <circle cx="52" cy="50" r="24" />
      <path d="M10 50h30M40 31v38M40 38l26-17M40 62l26 17" />
      <path d="m59 72 7 7-10 1" />
    </>;
  } else if (normalizedName.includes('ic') || normalizedName.includes('74ls') || normalizedName.includes('cd4007')) {
    symbol = <>
      <rect x="34" y="26" width="36" height="48" rx="2" />
      <path d="M34 34H18m16 12H18m16 12H18m16 12H18m52-36h16m-16 12h16m-16 12h16m-16 12h16" />
    </>;
  } else {
    symbol = <>
      <path d="M8 50h24m40 0h20" />
      <rect x="32" y="34" width="40" height="32" rx="3" />
      <path d="M42 42h20M42 50h20M42 58h20" />
    </>;
  }

  return (
    <svg
      width={size}
      height={Math.round(size * 0.62)}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${name} circuit symbol`}
      className="component-symbol"
    >
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {symbol}
      </g>
      {normalizedName.includes('capacitor') && normalizedName.includes('electrolytic') && (
        <text x="27" y="25" fill="currentColor" fontSize="12" fontWeight="700">+</text>
      )}
    </svg>
  );
};

export default ComponentSymbol;
