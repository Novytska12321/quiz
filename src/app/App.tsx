import { BrowserRouter, Route, Routes } from 'react-router'
import { GameView } from '@/views/game'
import { HomeView } from '@/views/home'
import { ResultView } from '@/views/result'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/game" element={<GameView />} />
        <Route path="/result" element={<ResultView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
