export default function DuelingMascots() {
  return (
    <div className="relative w-full max-w-md mx-auto select-none" aria-hidden="true">
      <svg viewBox="0 0 400 260" className="w-full h-auto overflow-visible">
        {/* impact burst behind them */}
        <g className="duel-burst" style={{ transformOrigin: '200px 140px' }}>
          {[...Array(8)].map((_, i) => (
            <rect
              key={i}
              x="196"
              y="60"
              width="8"
              height="34"
              fill="#d99a3d"
              transform={`rotate(${i * 45} 200 140)`}
            />
          ))}
        </g>

        {/* ---- left mascot: Nova the microbe ---- */}
        <g className="duel-left" style={{ transformOrigin: '110px 150px' }}>
          <ellipse cx="110" cy="150" rx="52" ry="48" fill="#5b3a8e" />
          {/* wobble bumps around body */}
          <circle cx="70" cy="115" r="10" fill="#5b3a8e" />
          <circle cx="150" cy="118" r="8" fill="#5b3a8e" />
          <circle cx="140" cy="188" r="9" fill="#5b3a8e" />
          {/* eyes */}
          <circle cx="94" cy="140" r="11" fill="white" />
          <circle cx="128" cy="140" r="11" fill="white" />
          <circle className="duel-eye" cx="97" cy="142" r="5" fill="#15201c" />
          <circle className="duel-eye" cx="131" cy="142" r="5" fill="#15201c" />
          {/* determined eyebrows */}
          <path d="M84 122 L104 130" stroke="#15201c" strokeWidth="3" strokeLinecap="round" />
          <path d="M136 122 L116 130" stroke="#15201c" strokeWidth="3" strokeLinecap="round" />
          {/* mouth */}
          <path d="M98 165 Q110 172 122 165" stroke="#15201c" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* glove */}
          <circle className="duel-glove-left" cx="168" cy="152" r="20" fill="#c8553d" />
        </g>

        {/* ---- right mascot: Rex the phage ---- */}
        <g className="duel-right" style={{ transformOrigin: '290px 150px' }}>
          <polygon points="290,95 320,150 290,205 260,150" fill="#c8553d" />
          <circle cx="290" cy="150" r="30" fill="#c8553d" />
          {/* spiky legs */}
          <path d="M270 178 L258 198" stroke="#c8553d" strokeWidth="6" strokeLinecap="round" />
          <path d="M310 178 L322 198" stroke="#c8553d" strokeWidth="6" strokeLinecap="round" />
          {/* eyes */}
          <circle cx="278" cy="145" r="10" fill="white" />
          <circle cx="304" cy="145" r="10" fill="white" />
          <circle className="duel-eye" cx="275" cy="147" r="4.5" fill="#15201c" />
          <circle className="duel-eye" cx="301" cy="147" r="4.5" fill="#15201c" />
          <path d="M268 130 L286 136" stroke="#15201c" strokeWidth="3" strokeLinecap="round" />
          <path d="M312 130 L294 136" stroke="#15201c" strokeWidth="3" strokeLinecap="round" />
          <path d="M280 165 Q290 158 300 165" stroke="#15201c" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* glove */}
          <circle className="duel-glove-right" cx="232" cy="152" r="20" fill="#5b3a8e" />
        </g>
      </svg>
    </div>
  )
}