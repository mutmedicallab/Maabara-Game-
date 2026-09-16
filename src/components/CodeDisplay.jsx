export default function CodeDisplay({ code }) {
  return (
    <div className="lab-panel px-6 py-8 text-center">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-3">Sample code</p>
      <p className="font-display font-bold text-6xl sm:text-7xl tracking-widest text-violet">
        {code}
      </p>
      <p className="text-ink/60 text-sm mt-3">Players enter this at the Join screen</p>
    </div>
  )
}
