const SHAPES = {
  microbe: (
    <path d="M50 10c-8 0-14 6-14 14 0-4-6-8-11-6-6 2-8 9-4 14-8 2-13 10-9 18 3 6 10 8 16 6-2 8 4 16 13 16h18c9 0 15-8 13-16 6 2 13 0 16-6 4-8-1-16-9-18 4-5 2-12-4-14-5-2-11 2-11 6 0-8-6-14-14-14z" />
  ),
  flask: (
    <path d="M40 10h20v18l16 32c3 6-1 12-7 12H31c-6 0-10-6-7-12l16-32V10z" />
  ),
  droplet: (
    <path d="M50 10c14 20 22 32 22 44a22 22 0 11-44 0c0-12 8-24 22-44z" />
  ),
  dna: (
    <path
      d="M30 10c0 20 40 20 40 40s-40 20-40 40M70 10c0 20-40 20-40 40s40 20 40 40"
      fill="none"
      strokeWidth="6"
      strokeLinecap="round"
    />
  ),
}

const ITEMS = [
  { shape: 'microbe', color: 'text-violet', top: '8%', left: '6%', size: 90, duration: '16s', delay: '0s' },
  { shape: 'flask', color: 'text-safranin', top: '62%', left: '8%', size: 70, duration: '19s', delay: '1.5s' },
  { shape: 'droplet', color: 'text-culture', top: '18%', left: '84%', size: 60, duration: '15s', delay: '0.8s' },
  { shape: 'microbe', color: 'text-amber', top: '72%', left: '82%', size: 85, duration: '21s', delay: '2.5s' },
  { shape: 'dna', color: 'text-violet', top: '42%', left: '46%', size: 110, duration: '24s', delay: '0.3s' },
]

// Purely decorative, low-opacity cartoon shapes drifting behind the landing
// page content. Sits above the background photo/scrim but below everything
// else, and never intercepts clicks.
export default function FloatingMascots() {
  return (
    <div className="fixed inset-0 -z-[5] overflow-hidden pointer-events-none" aria-hidden="true">
      {ITEMS.map((item, i) => (
        <svg
          key={i}
          viewBox="0 0 100 100"
          className={`absolute animate-float ${item.color}`}
          style={{
            top: item.top,
            left: item.left,
            width: item.size,
            height: item.size,
            opacity: 0.16,
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}
          fill="currentColor"
          stroke="currentColor"
        >
          {SHAPES[item.shape]}
        </svg>
      ))}
    </div>
  )
}