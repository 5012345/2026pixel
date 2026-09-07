import { useState } from 'react'
import Home from './components/Home'
import Board from './components/Board'

function App() {
  const [gameState, setGameState] = useState('HOME');
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const [isAiMode, setIsAiMode] = useState(false);

  const handleStartGame = (mode) => {
    if (mode === 'AI') {
      setNumberOfPlayers(2);
      setIsAiMode(true);
    } else {
      setNumberOfPlayers(mode);
      setIsAiMode(false);
    }
    setGameState('PLAY');
  };

  const handleGoHome = () => {
    setGameState('HOME');
  };

  return (
    <div>
      {gameState === 'HOME' && <Home onStartGame={handleStartGame} />}
      {gameState === 'PLAY' && <Board numberOfPlayers={numberOfPlayers} isAiMode={isAiMode} onGoHome={handleGoHome} />}
    </div>
  )
}

export default App
