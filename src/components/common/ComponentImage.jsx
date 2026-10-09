import React from 'react';

// Renders an accurate, polished electronic component or equipment pictorial illustration
const ComponentImage = ({ name = '', category = '', size = 80 }) => {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  // Resistor
  if (lowerName.includes('resistor')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {/* Terminal leads */}
        <line x1="10" y1="50" x2="25" y2="50" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="75" y1="50" x2="90" y2="50" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        {/* Resistor body (beige/tan) */}
        <rect x="25" y="36" width="50" height="28" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
        {/* Color bands */}
        <rect x="34" y="36" width="4" height="28" fill="#991b1b" />
        <rect x="44" y="36" width="4" height="28" fill="#1e293b" />
        <rect x="54" y="36" width="4" height="28" fill="#b45309" />
        <rect x="66" y="36" width="4" height="28" fill="#d97706" />
      </svg>
    );
  }

  // Diode (1N4007 / Zener)
  if (lowerName.includes('diode')) {
    const isZener = lowerName.includes('zener');
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {/* Leads */}
        <line x1="10" y1="50" x2="30" y2="50" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="70" y1="50" x2="90" y2="50" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        {/* Diode body */}
        <rect x="30" y="38" width="40" height="24" rx="4" fill={isZener ? '#fca5a5' : '#1e293b'} stroke="#0f172a" strokeWidth="2" />
        {/* Cathode band */}
        <rect x="62" y="38" width="5" height="24" fill={isZener ? '#1e293b' : '#cbd5e1'} />
        {/* Schematic symbol hint below */}
        <polygon points="44,45 44,55 52,50" fill="#ffffff" />
        <line x1="52" y1="45" x2="52" y2="55" stroke="#ffffff" strokeWidth="2" />
      </svg>
    );
  }

  // Transistor (BC547 / BJT)
  if (lowerName.includes('transistor') || lowerName.includes('bjt') || lowerName.includes('bc547')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {/* Three terminal pins */}
        <line x1="36" y1="62" x2="36" y2="88" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="62" x2="50" y2="88" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <line x1="64" y1="62" x2="64" y2="88" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        {/* TO-92 plastic body */}
        <path d="M 30,62 C 30,30 70,30 70,62 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <text x="50" y="52" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">BC547</text>
      </svg>
    );
  }

  // Capacitor
  if (lowerName.includes('capacitor')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {/* Radial leads */}
        <line x1="42" y1="68" x2="42" y2="90" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <line x1="58" y1="68" x2="58" y2="90" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        {/* Electrolytic can cylinder */}
        <rect x="32" y="24" width="36" height="46" rx="5" fill="#1e40af" stroke="#172554" strokeWidth="2" />
        {/* Negative stripe */}
        <rect x="56" y="24" width="8" height="46" fill="#cbd5e1" />
        <line x1="58" y1="36" x2="62" y2="36" stroke="#1e293b" strokeWidth="2" />
        <line x1="58" y1="46" x2="62" y2="46" stroke="#1e293b" strokeWidth="2" />
        <text x="44" y="50" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">10µF</text>
      </svg>
    );
  }

  // Integrated Circuit (IC / CD4007 / 74LS00 / 74LS08)
  if (lowerName.includes('ic') || lowerName.includes('74ls') || lowerName.includes('cd4007') || lowerCat.includes('ic')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {/* Left pins */}
        {[30, 42, 54, 66].map((y) => (
          <rect key={`l-${y}`} x="16" y={y} width="10" height="4" fill="#94a3b8" rx="1" />
        ))}
        {/* Right pins */}
        {[30, 42, 54, 66].map((y) => (
          <rect key={`r-${y}`} x="74" y={y} width="10" height="4" fill="#94a3b8" rx="1" />
        ))}
        {/* DIP IC body */}
        <rect x="24" y="22" width="52" height="56" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        {/* Notch */}
        <circle cx="50" cy="22" r="5" fill="#0f172a" />
        {/* Text */}
        <text x="50" y="52" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
          {lowerName.includes('4007') ? 'CD4007' : lowerName.includes('74') ? '74LS00' : 'IC-DIP'}
        </text>
      </svg>
    );
  }

  // FPGA / Development Board
  if (lowerName.includes('fpga') || lowerName.includes('spartan') || lowerName.includes('basys')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#064e3b" stroke="#047857" strokeWidth="2" />
        {/* FPGA central BGA chip */}
        <rect x="34" y="34" width="32" height="32" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <rect x="42" y="42" width="16" height="16" fill="#334155" />
        <text x="50" y="52" fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">FPGA</text>
        {/* Connectors / Slide switches */}
        <rect x="14" y="80" width="8" height="6" fill="#cbd5e1" />
        <rect x="26" y="80" width="8" height="6" fill="#cbd5e1" />
        <rect x="38" y="80" width="8" height="6" fill="#cbd5e1" />
        <rect x="14" y="14" width="18" height="10" fill="#94a3b8" rx="2" />
        {/* LEDs */}
        <circle cx="80" cy="20" r="3" fill="#22c55e" />
        <circle cx="80" cy="30" r="3" fill="#ef4444" />
      </svg>
    );
  }

  // Microprocessor / DSP Trainer Kit
  if (lowerName.includes('8086') || lowerName.includes('dsp') || lowerName.includes('trainer') || lowerName.includes('kit')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        {/* CPU Chip */}
        <rect x="16" y="20" width="28" height="42" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <text x="30" y="44" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">
          {lowerName.includes('8086') ? '8086' : 'DSP'}
        </text>
        {/* 7-Segment displays */}
        <rect x="52" y="20" width="34" height="20" rx="2" fill="#450a0a" stroke="#ef4444" strokeWidth="1" />
        <text x="69" y="34" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">8888</text>
        {/* Hex Keypad */}
        <rect x="52" y="46" width="34" height="34" rx="2" fill="#334155" />
        {[56, 64, 72, 80].map((x) => (
          <circle key={x} cx={x} cy="54" r="2" fill="#94a3b8" />
        ))}
        {[56, 64, 72, 80].map((x) => (
          <circle key={x} cx={x} cy="64" r="2" fill="#94a3b8" />
        ))}
        {[56, 64, 72, 80].map((x) => (
          <circle key={x} cx={x} cy="74" r="2" fill="#94a3b8" />
        ))}
      </svg>
    );
  }

  // Oscilloscope (DSO)
  if (lowerName.includes('oscilloscope') || lowerName.includes('dso')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        {/* CRT / LCD screen */}
        <rect x="14" y="20" width="46" height="44" rx="3" fill="#022c22" stroke="#059669" strokeWidth="1.5" />
        {/* Sine Wave */}
        <path d="M 16,42 Q 27,24 37,42 T 58,42" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        {/* Control Knobs */}
        <circle cx="76" cy="28" r="6" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="76" cy="46" r="6" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        {/* BNC Channel 1 & 2 Inputs */}
        <circle cx="28" cy="78" r="5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
        <circle cx="48" cy="78" r="5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
        <text x="76" y="74" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">100MHz</text>
      </svg>
    );
  }

  // Function Generator
  if (lowerName.includes('function generator') || lowerName.includes('fg')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        {/* Frequency LCD readout */}
        <rect x="14" y="20" width="48" height="22" rx="3" fill="#172554" stroke="#3b82f6" strokeWidth="1" />
        <text x="38" y="35" fill="#60a5fa" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">10.00 kHz</text>
        {/* Waveform selection buttons */}
        <rect x="14" y="52" width="12" height="10" rx="2" fill="#334155" />
        <path d="M 16,57 Q 20,53 24,57" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="30" y="52" width="12" height="10" rx="2" fill="#334155" />
        <path d="M 32,59 L 35,54 L 39,59" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Dial knob */}
        <circle cx="76" cy="40" r="10" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
        {/* 50 ohm BNC out */}
        <circle cx="76" cy="74" r="6" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
      </svg>
    );
  }

  // Power Supply (RPS)
  if (lowerName.includes('power supply') || lowerName.includes('rps')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        {/* Dual 7-segment meters */}
        <rect x="14" y="18" width="32" height="20" rx="2" fill="#450a0a" stroke="#ef4444" strokeWidth="1" />
        <text x="30" y="32" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">12.0 V</text>
        <rect x="54" y="18" width="32" height="20" rx="2" fill="#042f2e" stroke="#10b981" strokeWidth="1" />
        <text x="70" y="32" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">1.50 A</text>
        {/* Binding posts (Red / Black / Green) */}
        <circle cx="28" cy="72" r="6" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
        <circle cx="50" cy="72" r="6" fill="#1e293b" stroke="#020617" strokeWidth="1.5" />
        <circle cx="72" cy="72" r="6" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" />
      </svg>
    );
  }

  // Multimeter (DMM)
  if (lowerName.includes('multimeter') || lowerName.includes('dmm')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {/* Yellow rubber holster */}
        <rect x="22" y="12" width="56" height="76" rx="8" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
        {/* LCD screen */}
        <rect x="30" y="20" width="40" height="18" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
        <text x="50" y="33" fill="#0f172a" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0.702 V</text>
        {/* Rotary switch */}
        <circle cx="50" cy="54" r="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <line x1="50" y1="54" x2="50" y2="47" stroke="#ffffff" strokeWidth="2" />
        {/* Probe terminals */}
        <circle cx="40" cy="76" r="3" fill="#ef4444" />
        <circle cx="60" cy="76" r="3" fill="#020617" />
      </svg>
    );
  }

  // Default Electronic Module / Cable / Generic
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="50" cy="50" r="22" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      <path d="M 40,50 L 50,40 L 60,50 L 50,60 Z" fill="#3b82f6" />
      <text x="50" y="86" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">ECE HW</text>
    </svg>
  );
};

export default ComponentImage;
