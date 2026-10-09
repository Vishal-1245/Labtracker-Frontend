import React from 'react';

// Renders an accurate, informative schematic and circuit diagram illustration for syllabus experiments
const ExperimentImage = ({ code = '', height = 140 }) => {
  const c = code.toUpperCase();

  // ECE-EDC-01: Diode V-I Characteristics Circuit
  if (c.includes('EDC-01')) {
    return (
      <svg width="100%" height={height} viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <rect width="320" height="140" fill="#f8fafc" />
        {/* Title badge */}
        <rect x="10" y="8" width="130" height="18" rx="3" fill="#eff6ff" stroke="#bfdbfe" />
        <text x="75" y="21" fill="#1e40af" fontSize="9" fontWeight="bold" textAnchor="middle">Diode V-I Test Circuit</text>

        {/* DC Source */}
        <circle cx="45" cy="70" r="18" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
        <text x="45" y="66" fill="#1e293b" fontSize="11" fontWeight="bold" textAnchor="middle">+</text>
        <text x="45" y="80" fill="#1e293b" fontSize="11" fontWeight="bold" textAnchor="middle">-</text>
        <text x="45" y="100" fill="#64748b" fontSize="8" textAnchor="middle">RPS (0-30V)</text>

        {/* Wire top */}
        <line x1="45" y1="52" x2="45" y2="40" stroke="#1e293b" strokeWidth="2" />
        <line x1="45" y1="40" x2="90" y2="40" stroke="#1e293b" strokeWidth="2" />

        {/* Resistor R (1k) */}
        <rect x="90" y="32" width="40" height="16" fill="#fef3c7" stroke="#d97706" strokeWidth="2" rx="2" />
        <text x="110" y="44" fill="#92400e" fontSize="8" fontWeight="bold" textAnchor="middle">R = 1kΩ</text>
        <line x1="130" y1="40" x2="155" y2="40" stroke="#1e293b" strokeWidth="2" />

        {/* Ammeter */}
        <circle cx="170" cy="40" r="14" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
        <text x="170" y="44" fill="#2563eb" fontSize="10" fontWeight="bold" textAnchor="middle">mA</text>
        <line x1="184" y1="40" x2="215" y2="40" stroke="#1e293b" strokeWidth="2" />

        {/* Diode */}
        <line x1="215" y1="40" x2="215" y2="55" stroke="#1e293b" strokeWidth="2" />
        <polygon points="205,55 225,55 215,72" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="205" y1="72" x2="225" y2="72" stroke="#1e293b" strokeWidth="2.5" />
        <text x="238" y="66" fill="#0f172a" fontSize="9" fontWeight="bold">1N4007</text>
        <line x1="215" y1="72" x2="215" y2="105" stroke="#1e293b" strokeWidth="2" />

        {/* Voltmeter in parallel with diode */}
        <line x1="215" y1="50" x2="270" y2="50" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="270" y1="50" x2="270" y2="56" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="270" cy="70" r="14" fill="#ffffff" stroke="#059669" strokeWidth="2" />
        <text x="270" y="74" fill="#059669" fontSize="11" fontWeight="bold" textAnchor="middle">V</text>
        <line x1="270" y1="84" x2="270" y2="92" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="270" y1="92" x2="215" y2="92" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Ground wire bottom */}
        <line x1="215" y1="105" x2="45" y2="105" stroke="#1e293b" strokeWidth="2" />
        <line x1="45" y1="105" x2="45" y2="88" stroke="#1e293b" strokeWidth="2" />
      </svg>
    );
  }

  // ECE-EDC-02: Rectifier Circuit Diagram
  if (c.includes('EDC-02')) {
    return (
      <svg width="100%" height={height} viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <rect width="320" height="140" fill="#f8fafc" />
        <rect x="10" y="8" width="140" height="18" rx="3" fill="#fef3c7" stroke="#fde68a" />
        <text x="80" y="21" fill="#b45309" fontSize="9" fontWeight="bold" textAnchor="middle">Full Wave Rectifier + Filter</text>

        {/* Transformer Coils */}
        <path d="M 30,35 C 38,35 38,50 30,50 C 38,50 38,65 30,65 C 38,65 38,80 30,80 C 38,80 38,95 30,95" fill="none" stroke="#b45309" strokeWidth="2.5" />
        <line x1="45" y1="35" x2="45" y2="95" stroke="#94a3b8" strokeWidth="2" />
        <line x1="49" y1="35" x2="49" y2="95" stroke="#94a3b8" strokeWidth="2" />
        <path d="M 64,35 C 56,35 56,50 64,50 C 56,50 56,65 64,65 C 56,65 56,80 64,80 C 56,80 56,95 64,95" fill="none" stroke="#b45309" strokeWidth="2.5" />

        {/* Top Diode D1 */}
        <line x1="64" y1="35" x2="110" y2="35" stroke="#1e293b" strokeWidth="2" />
        <polygon points="110,27 126,35 110,43" fill="#1e293b" />
        <line x1="126" y1="27" x2="126" y2="43" stroke="#1e293b" strokeWidth="2.5" />
        <text x="118" y="23" fill="#1e293b" fontSize="8" fontWeight="bold">D1</text>
        <line x1="126" y1="35" x2="180" y2="35" stroke="#1e293b" strokeWidth="2" />

        {/* Bottom Diode D2 */}
        <line x1="64" y1="95" x2="110" y2="95" stroke="#1e293b" strokeWidth="2" />
        <polygon points="110,87 126,95 110,103" fill="#1e293b" />
        <line x1="126" y1="87" x2="126" y2="103" stroke="#1e293b" strokeWidth="2.5" />
        <text x="118" y="113" fill="#1e293b" fontSize="8" fontWeight="bold">D2</text>
        <line x1="126" y1="95" x2="180" y2="95" stroke="#1e293b" strokeWidth="2" />

        {/* Join cathode outputs */}
        <line x1="180" y1="35" x2="180" y2="95" stroke="#1e293b" strokeWidth="2" />
        <line x1="180" y1="65" x2="220" y2="65" stroke="#1e293b" strokeWidth="2" />

        {/* Filter Capacitor C */}
        <line x1="220" y1="65" x2="220" y2="80" stroke="#1e293b" strokeWidth="2" />
        <line x1="212" y1="80" x2="228" y2="80" stroke="#2563eb" strokeWidth="2.5" />
        <line x1="212" y1="86" x2="228" y2="86" stroke="#2563eb" strokeWidth="2.5" />
        <text x="238" y="85" fill="#2563eb" fontSize="8" fontWeight="bold">C=10µF</text>
        <line x1="220" y1="86" x2="220" y2="105" stroke="#1e293b" strokeWidth="2" />

        {/* Load Resistor RL */}
        <line x1="220" y1="65" x2="270" y2="65" stroke="#1e293b" strokeWidth="2" />
        <rect x="264" y="74" width="12" height="24" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
        <text x="290" y="88" fill="#92400e" fontSize="8" fontWeight="bold">RL = 1kΩ</text>
        <line x1="270" y1="65" x2="270" y2="74" stroke="#1e293b" strokeWidth="2" />
        <line x1="270" y1="98" x2="270" y2="105" stroke="#1e293b" strokeWidth="2" />

        {/* Center tap to ground line */}
        <line x1="64" y1="65" x2="100" y2="65" stroke="#1e293b" strokeWidth="2" />
        <line x1="100" y1="65" x2="100" y2="105" stroke="#1e293b" strokeWidth="2" />
        <line x1="100" y1="105" x2="270" y2="105" stroke="#1e293b" strokeWidth="2" />
      </svg>
    );
  }

  // ECE-DSP-01: Discrete Convolution Diagram
  if (c.includes('DSP-01')) {
    return (
      <svg width="100%" height={height} viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <rect width="320" height="140" fill="#f8fafc" />
        <rect x="10" y="8" width="130" height="18" rx="3" fill="#f0fdf4" stroke="#bbf7d0" />
        <text x="75" y="21" fill="#166534" fontSize="9" fontWeight="bold" textAnchor="middle">LTI Discrete Convolution</text>

        {/* Input Signal x[n] stems */}
        <text x="35" y="44" fill="#1e293b" fontSize="10" fontWeight="bold">x[n] Input</text>
        <line x1="20" y1="90" x2="65" y2="90" stroke="#64748b" strokeWidth="1.5" />
        <line x1="28" y1="90" x2="28" y2="70" stroke="#2563eb" strokeWidth="2" />
        <circle cx="28" cy="70" r="3" fill="#2563eb" />
        <line x1="40" y1="90" x2="40" y2="55" stroke="#2563eb" strokeWidth="2" />
        <circle cx="40" cy="55" r="3" fill="#2563eb" />
        <line x1="52" y1="90" x2="52" y2="62" stroke="#2563eb" strokeWidth="2" />
        <circle cx="52" cy="62" r="3" fill="#2563eb" />

        {/* Arrow to DSP block */}
        <line x1="70" y1="72" x2="105" y2="72" stroke="#1e293b" strokeWidth="2" />
        <polygon points="105,68 113,72 105,76" fill="#1e293b" />

        {/* LTI System Filter Block */}
        <rect x="115" y="46" width="90" height="52" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <text x="160" y="68" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">h[n] System</text>
        <text x="160" y="84" fill="#94a3b8" fontSize="8" textAnchor="middle">y[n] = x[n] * h[n]</text>

        {/* Arrow to Output */}
        <line x1="205" y1="72" x2="235" y2="72" stroke="#1e293b" strokeWidth="2" />
        <polygon points="235,68 243,72 235,76" fill="#1e293b" />

        {/* Output Signal y[n] stems */}
        <text x="270" y="44" fill="#1e293b" fontSize="10" fontWeight="bold">y[n] Output</text>
        <line x1="245" y1="90" x2="305" y2="90" stroke="#64748b" strokeWidth="1.5" />
        <line x1="255" y1="90" x2="255" y2="75" stroke="#059669" strokeWidth="2" />
        <circle cx="255" cy="75" r="3" fill="#059669" />
        <line x1="267" y1="90" x2="267" y2="52" stroke="#059669" strokeWidth="2" />
        <circle cx="267" cy="52" r="3" fill="#059669" />
        <line x1="279" y1="90" x2="279" y2="60" stroke="#059669" strokeWidth="2" />
        <circle cx="279" cy="60" r="3" fill="#059669" />
        <line x1="291" y1="90" x2="291" y2="70" stroke="#059669" strokeWidth="2" />
        <circle cx="291" cy="70" r="3" fill="#059669" />
      </svg>
    );
  }

  // ECE-MPMC-01: 8086 Microprocessor Block Diagram
  if (c.includes('MPMC-01')) {
    return (
      <svg width="100%" height={height} viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <rect width="320" height="140" fill="#f8fafc" />
        <rect x="10" y="8" width="145" height="18" rx="3" fill="#fdf4ff" stroke="#f0abfc" />
        <text x="82" y="21" fill="#86198f" fontSize="9" fontWeight="bold" textAnchor="middle">8086 CPU & Memory Bus</text>

        {/* 8086 CPU Box */}
        <rect x="20" y="40" width="110" height="80" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <text x="75" y="58" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">8086 CPU</text>
        <rect x="30" y="66" width="38" height="20" rx="2" fill="#334155" />
        <text x="49" y="79" fill="#f8fafc" fontSize="8" textAnchor="middle">AX/BX/CX</text>
        <rect x="76" y="66" width="44" height="20" rx="2" fill="#334155" />
        <text x="98" y="79" fill="#f8fafc" fontSize="8" textAnchor="middle">ALU 16-Bit</text>
        <text x="75" y="106" fill="#94a3b8" fontSize="8" textAnchor="middle">BIU + EU Architecture</text>

        {/* 20-bit Address / 16-bit Data Bus */}
        <line x1="130" y1="65" x2="190" y2="65" stroke="#b45309" strokeWidth="3" />
        <polygon points="190,62 196,65 190,68" fill="#b45309" />
        <text x="160" y="58" fill="#b45309" fontSize="7" fontWeight="bold" textAnchor="middle">20-bit AD Bus</text>

        <line x1="190" y1="95" x2="130" y2="95" stroke="#2563eb" strokeWidth="3" />
        <polygon points="130,92 124,95 130,98" fill="#2563eb" />
        <text x="160" y="108" fill="#2563eb" fontSize="7" fontWeight="bold" textAnchor="middle">16-bit Data Bus</text>

        {/* Memory Array (Block Transfer) */}
        <rect x="196" y="40" width="105" height="80" rx="6" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
        <text x="248" y="56" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">Memory (RAM)</text>
        <rect x="206" y="66" width="85" height="18" fill="#eff6ff" stroke="#93c5fd" />
        <text x="248" y="78" fill="#1e40af" fontSize="8" textAnchor="middle">Source Block: 2000H</text>
        <rect x="206" y="90" width="85" height="18" fill="#f0fdf4" stroke="#86efac" />
        <text x="248" y="102" fill="#166534" fontSize="8" textAnchor="middle">Dest Block: 3000H</text>
      </svg>
    );
  }

  // ECE-VLSI-01: CMOS Inverter Circuit & VTC
  if (c.includes('VLSI-01')) {
    return (
      <svg width="100%" height={height} viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <rect width="320" height="140" fill="#f8fafc" />
        <rect x="10" y="8" width="135" height="18" rx="3" fill="#e0f2fe" stroke="#7dd3fc" />
        <text x="77" y="21" fill="#0369a1" fontSize="9" fontWeight="bold" textAnchor="middle">CMOS Inverter Schematic</text>

        {/* Vdd power rail */}
        <line x1="45" y1="28" x2="75" y2="28" stroke="#1e293b" strokeWidth="2" />
        <text x="60" y="22" fill="#0f172a" fontSize="8" fontWeight="bold" textAnchor="middle">Vdd = 5V</text>
        <line x1="60" y1="28" x2="60" y2="40" stroke="#1e293b" strokeWidth="2" />

        {/* pMOS Transistor */}
        <circle cx="48" cy="52" r="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="54" y="40" width="12" height="24" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
        <text x="76" y="54" fill="#2563eb" fontSize="8" fontWeight="bold">pMOS</text>
        <line x1="60" y1="64" x2="60" y2="76" stroke="#1e293b" strokeWidth="2" />

        {/* Common Output node */}
        <circle cx="60" cy="70" r="3" fill="#0f172a" />
        <line x1="60" y1="70" x2="110" y2="70" stroke="#1e293b" strokeWidth="2" />
        <text x="120" y="74" fill="#0f172a" fontSize="9" fontWeight="bold">Vout</text>

        {/* Common Input node */}
        <line x1="20" y1="70" x2="35" y2="70" stroke="#1e293b" strokeWidth="2" />
        <text x="14" y="73" fill="#0f172a" fontSize="9" fontWeight="bold" textAnchor="end">Vin</text>
        <line x1="35" y1="52" x2="35" y2="88" stroke="#1e293b" strokeWidth="2" />
        <line x1="35" y1="52" x2="45" y2="52" stroke="#1e293b" strokeWidth="2" />
        <line x1="35" y1="88" x2="54" y2="88" stroke="#1e293b" strokeWidth="2" />

        {/* nMOS Transistor */}
        <rect x="54" y="76" width="12" height="24" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
        <text x="76" y="90" fill="#d97706" fontSize="8" fontWeight="bold">nMOS</text>
        <line x1="60" y1="100" x2="60" y2="114" stroke="#1e293b" strokeWidth="2" />
        {/* Ground */}
        <line x1="50" y1="114" x2="70" y2="114" stroke="#1e293b" strokeWidth="2" />
        <line x1="55" y1="118" x2="65" y2="118" stroke="#1e293b" strokeWidth="2" />

        {/* VTC Transfer Graph on Right */}
        <rect x="160" y="30" width="140" height="90" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="230" y="44" fill="#0f172a" fontSize="9" fontWeight="bold" textAnchor="middle">VTC Curve</text>
        <line x1="175" y1="105" x2="285" y2="105" stroke="#64748b" strokeWidth="1.5" />
        <line x1="175" y1="105" x2="175" y2="48" stroke="#64748b" strokeWidth="1.5" />
        <text x="285" y="116" fill="#64748b" fontSize="7">Vin (V)</text>
        <text x="175" y="44" fill="#64748b" fontSize="7">Vout (V)</text>
        {/* Inverter VTC Curve */}
        <path d="M 175,52 Q 225,52 230,76 T 280,103" fill="none" stroke="#dc2626" strokeWidth="2.5" />
        <circle cx="230" cy="76" r="3" fill="#dc2626" />
        <text x="245" y="78" fill="#dc2626" fontSize="8" fontWeight="bold">Vm</text>
      </svg>
    );
  }

  // ECE-VLSI-02: 4-Bit Ripple Carry Adder Cascade
  if (c.includes('VLSI-02')) {
    return (
      <svg width="100%" height={height} viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <rect width="320" height="140" fill="#f8fafc" />
        <rect x="10" y="8" width="155" height="18" rx="3" fill="#ecfdf5" stroke="#a7f3d0" />
        <text x="87" y="21" fill="#047857" fontSize="9" fontWeight="bold" textAnchor="middle">4-Bit Ripple Carry Adder (FPGA)</text>

        {/* 4 Cascaded Full Adders */}
        {[
          { label: 'FA0', x: 235 },
          { label: 'FA1', x: 165 },
          { label: 'FA2', x: 95 },
          { label: 'FA3', x: 25 },
        ].map((fa, idx) => (
          <g key={fa.label}>
            {/* Box */}
            <rect x={fa.x} y="44" width="55" height="56" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <text x={fa.x + 27} y="68" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">{fa.label}</text>
            <text x={fa.x + 27} y="82" fill="#cbd5e1" fontSize="7" textAnchor="middle">A{3 - idx}, B{3 - idx}</text>

            {/* Sum Out Arrow bottom */}
            <line x1={fa.x + 27} y1="100" x2={fa.x + 27} y2="122" stroke="#2563eb" strokeWidth="2" />
            <polygon points={`${fa.x + 24},120 ${fa.x + 30},120 ${fa.x + 27},126`} fill="#2563eb" />
            <text x={fa.x + 27} y="134" fill="#2563eb" fontSize="8" fontWeight="bold" textAnchor="middle">S{3 - idx}</text>
          </g>
        ))}

        {/* Carry Ripple Arrows */}
        {/* Cin into FA0 */}
        <line x1="310" y1="72" x2="290" y2="72" stroke="#d97706" strokeWidth="2" />
        <polygon points="292,69 292,75 288,72" fill="#d97706" />
        <text x="306" y="66" fill="#d97706" fontSize="8" fontWeight="bold">Cin</text>

        {/* FA0 -> FA1 */}
        <line x1="235" y1="72" x2="220" y2="72" stroke="#d97706" strokeWidth="2" />
        <polygon points="222,69 222,75 218,72" fill="#d97706" />

        {/* FA1 -> FA2 */}
        <line x1="165" y1="72" x2="150" y2="72" stroke="#d97706" strokeWidth="2" />
        <polygon points="152,69 152,75 148,72" fill="#d97706" />

        {/* FA2 -> FA3 */}
        <line x1="95" y1="72" x2="80" y2="72" stroke="#d97706" strokeWidth="2" />
        <polygon points="82,69 82,75 78,72" fill="#d97706" />

        {/* Cout from FA3 */}
        <line x1="25" y1="72" x2="10" y2="72" stroke="#d97706" strokeWidth="2" />
        <polygon points="12,69 12,75 8,72" fill="#d97706" />
        <text x="14" y="64" fill="#d97706" fontSize="8" fontWeight="bold">Cout</text>
      </svg>
    );
  }

  // Default Generic Schematic
  return (
    <svg width="100%" height={height} viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <rect width="320" height="140" fill="#f8fafc" />
      <rect x="20" y="30" width="280" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      <text x="160" y="65" fill="#1e293b" fontSize="13" fontWeight="bold" textAnchor="middle">ECE Practical Laboratory Circuit</text>
      <text x="160" y="85" fill="#64748b" fontSize="10" textAnchor="middle">{code} Experimental Setup</text>
    </svg>
  );
};

export default ExperimentImage;
