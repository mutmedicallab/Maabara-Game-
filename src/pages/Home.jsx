import { Link } from 'react-router-dom'
import DuelingMascots from '../components/DuelingMascots.jsx'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-10">
      <DuelingMascots />

      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-2">
            club quiz night
          </p>
          <h1 className="font-display font-bold text-5xl tracking-tight text-ink">
            Titer<span className="text-violet"> Up</span>
          </h1>
          <p className="text-ink/60 mt-3">
            First to the well wins. One code, everyone's phone, all the bragging rights.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/host"
            className="lab-panel px-6 py-5 flex items-center justify-between hover:bg-violet hover:text-white hover:border-violet transition-colors group"
          >
            <div>
              <p className="font-display font-semibold text-lg">Host a game</p>
              <p className="text-sm text-ink/60 group-hover:text-white/80">
                Run the quiz from the front of the room
              </p>
            </div>
            <span className="font-mono text-xl">&rarr;</span>
          </Link>

          <Link
            to="/play"
            className="lab-panel px-6 py-5 flex items-center justify-between hover:bg-culture hover:text-white hover:border-culture transition-colors group"
          >
            <div>
              <p className="font-display font-semibold text-lg">Join a game</p>
              <p className="text-sm text-ink/60 group-hover:text-white/80">
                Enter the code from the host's screen
              </p>
            </div>
            <span className="font-mono text-xl">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}