import { useState } from 'react'
import Lobby from './screens/Lobby'
import LeaderBoard from './screens/LeaderBoard'
import BandmateView from './screens/BandmateView'
import Settings from './screens/Settings'

export default function App() {
  const [screen, setScreen] = useState('lobby')
  const [roomCode, setRoomCode] = useState(null)
  const [role, setRole] = useState(null) // 'leader' | 'bandmate'

  function handleJoin({ roomCode: code, role: r }) {
    setRoomCode(code)
    setRole(r)
    setScreen(r === 'leader' ? 'leader' : 'bandmate')
  }

  function handleLeave() {
    setRoomCode(null)
    setRole(null)
    setScreen('lobby')
  }

  if (screen === 'lobby') {
    return <Lobby onJoin={handleJoin} />
  }

  if (screen === 'settings' && role === 'leader') {
    return (
      <Settings
        roomCode={roomCode}
        onClose={() => setScreen('leader')}
      />
    )
  }

  if (screen === 'leader' || role === 'leader') {
    return (
      <LeaderBoard
        roomCode={roomCode}
        onOpenSettings={() => setScreen('settings')}
        onLeave={handleLeave}
      />
    )
  }

  return (
    <BandmateView
      roomCode={roomCode}
      onLeave={handleLeave}
    />
  )
}
