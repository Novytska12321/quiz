import { BrowserRouter, Route, Routes } from 'react-router'
import { GameView } from '@/views/game'
import { HomeView } from '@/views/home'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/game" element={<GameView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
