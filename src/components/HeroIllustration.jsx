// Original illustration -- Nova (our established violet microbe mascot)
// sitting in a "lab landscape": flasks standing in for cacti, layered
// canyon-style silhouettes, a warm gradient sky, and floating dust motes.
// Flat/geometric on purpose to match the app's square-cornered design
// system rather than a painterly render.
export default function HeroIllustration() {
  return (
    <div className="w-full max-w-2xl mx-auto border border-white/10 overflow-hidden shadow-xl">
      <svg viewBox="0 0 720 460" className="w-full h-auto block" role="img" aria-label="Illustration of Nova the microbe in a lab landscape">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b3a8e" />
            <stop offset="55%" stopColor="#8a63b8" />
            <stop offset="100%" stopColor="#d99a3d" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8553d" />
            <stop offset="100%" stopColor="#a8432f" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect x="0" y="0" width="720" height="460" fill="url(#sky)" />

        {/* sun glow */}
        <circle cx="590" cy="90" r="70" fill="#d99a3d" opacity="0.35" />
        <circle cx="590" cy="90" r="46" fill="#d99a3d" opacity="0.55" />
        <circle cx="590" cy="90" r="26" fill="#f3c877" opacity="0.9" />

        {/* dust motes */}
        {[
          [60, 60], [140, 130], [210, 50], [340, 90], [420, 40],
          [500, 160], [650, 60], [90, 220], [610, 220], [30, 330],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 4 : 2.5} fill="#f3c877" opacity="0.6" />
        ))}

        {/* far canyon layer */}
        <polygon points="0,300 90,230 180,290 260,210 360,290 460,220 560,300 650,240 720,300 720,460 0,460" fill="#47306e" opacity="0.55" />
        {/* mid canyon layer */}
        <polygon points="0,340 120,270 240,330 340,260 420,330 540,270 640,330 720,300 720,460 0,460" fill="#5b3a8e" opacity="0.7" />

        {/* ground */}
        <rect x="0" y="360" width="720" height="100" fill="url(#ground)" />
        <rect x="0" y="358" width="720" height="4" fill="#d99a3d" opacity="0.7" />

        {/* flask "cacti" */}
        <g opacity="0.95">
          <path d="M96 250h16v14l13 26c2 5-1 9-6 9H89c-5 0-8-4-6-9l13-26v-14z" fill="#3f7d58" />
          <path d="M120 270h14v12l11 22c2 4-1 8-5 8h-26c-4 0-7-4-5-8l11-22v-12z" fill="#2f5f43" />
        </g>
        <g opacity="0.95">
          <path d="M600 270h14v12l11 23c2 4-1 8-5 8h-26c-4 0-7-4-5-8l11-23v-12z" fill="#3f7d58" />
        </g>
        <g opacity="0.9">
          <path d="M40 300h10v8l8 17c1 3-1 6-4 6H36c-3 0-5-3-4-6l8-17v-8z" fill="#2f5f43" />
        </g>

        {/* ---- Nova, sitting front and center ---- */}
        <g transform="translate(360,330)">
          {/* shadow */}
          <ellipse cx="0" cy="108" rx="92" ry="14" fill="#15201c" opacity="0.18" />

          {/* body */}
          <ellipse cx="0" cy="20" rx="92" ry="82" fill="#5b3a8e" />
          <circle cx="-64" cy="-30" r="17" fill="#5b3a8e" />
          <circle cx="66" cy="-24" r="14" fill="#5b3a8e" />
          <circle cx="54" cy="60" r="16" fill="#5b3a8e" />
          <circle cx="-58" cy="58" r="13" fill="#5b3a8e" />

          {/* belly patch */}
          <ellipse cx="0" cy="46" rx="52" ry="38" fill="#8a63b8" opacity="0.55" />

          {/* eyes */}
          <circle cx="-26" cy="-4" r="20" fill="white" />
          <circle cx="28" cy="-4" r="20" fill="white" />
          <circle cx="-22" cy="0" r="9" fill="#15201c" />
          <circle cx="32" cy="0" r="9" fill="#15201c" />
          <circle cx="-25" cy="-4" r="3" fill="white" />
          <circle cx="29" cy="-4" r="3" fill="white" />

          {/* smile */}
          <path d="M-18 30 Q0 44 18 30" stroke="#15201c" strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* little arms waving */}
          <path d="M-88 30 Q-110 10 -100 -14" stroke="#5b3a8e" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M88 30 Q108 46 96 70" stroke="#5b3a8e" strokeWidth="14" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}