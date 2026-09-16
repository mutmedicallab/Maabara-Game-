import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Host from './pages/Host.jsx'
import Join from './pages/Join.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host" element={<Host />} />
        <Route path="/play" element={<Join />} />
      </Routes>
    </div>
  )
}
