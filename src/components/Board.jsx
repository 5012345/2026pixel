import React, { useState, useEffect } from 'react';
import { BOARD_SIZE, PLAYERS, createInitialState, canMove, checkWin, getNextPlayer, getBotMove } from '../engine/GameLogic';

// 플레이어별 색상 매핑
const PLAYER_STYLES = {
  1: { name: '1P (초록)', color: '#4CAF50', gradient: 'radial-gradient(circle at 12px 12px, #4CAF50, #1b5e20)' },
  2: { name: '2P (빨강)', color: '#F44336', gradient: 'radial-gradient(circle at 12px 12px, #FF8A80, #b71c1c)' },
  3: { name: '3P (파랑)', color: '#2196F3', gradient: 'radial-gradient(circle at 12px 12px, #82B1FF, #0D47A1)' },
  4: { name: '4P (노랑)', color: '#FFC107', gradient: 'radial-gradient(circle at 12px 12px, #FFE57F, #FF6F00)' },
};

function Board({ numberOfPlayers, isAiMode, onGoHome }) {
  const [gameState, setGameState] = useState(createInitialState(numberOfPlayers));
  const [inputX, setInputX] = useState('');
  const [inputY, setInputY] = useState('');

  // 인원수나 모드가 바뀌면 초기화
  useEffect(() => {
    setGameState(createInitialState(numberOfPlayers));
    setInputX('');
    setInputY('');
  }, [numberOfPlayers, isAiMode]);

  const applyMove = (x, y, player) => {
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[y][x] = player;

    let winner = null;
    if (checkWin(newBoard, player)) {
      winner = player;
    }

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      sliderX: x,
      sliderY: y,
      currentPlayer: winner ? prev.currentPlayer : getNextPlayer(prev.currentPlayer, prev.numberOfPlayers),
      winner,
      isFirstTurn: false
    }));
  };

  // AI 턴 처리
  useEffect(() => {
    if (isAiMode && gameState.currentPlayer === 2 && !gameState.winner) {
      const timer = setTimeout(() => {
        const move = getBotMove(gameState);
        if (move) {
          applyMove(move.x, move.y, 2);
        } else {
          alert("AI가 더 이상 둘 곳이 없습니다.");
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState, isAiMode]);

  const handleMoveSubmit = (e) => {
    e.preventDefault();
    if (gameState.winner) return;
    if (isAiMode && gameState.currentPlayer !== 1) return; // AI 모드일 땐 1P만 조작 가능
    
    const parsedX = parseInt(inputX, 10);
    const parsedY = parseInt(inputY, 10);

    if (isNaN(parsedX) || isNaN(parsedY) || parsedX < -4 || parsedX > 4 || parsedY < -4 || parsedY > 4) {
      alert("-4부터 4 사이의 정수 좌표를 입력하세요.");
      return;
    }

    const gridX = parsedX + 4;
    const gridY = 4 - parsedY;

    if (!canMove(gameState, gridX, gridY)) {
      alert("움직일 수 없는 위치입니다. 현재 교차점에서 가로 또는 세로로만 이동할 수 있으며, 빈 칸이어야 합니다.");
      return;
    }
    
    setInputX('');
    setInputY('');
    applyMove(gridX, gridY, gameState.currentPlayer);
  };

  const getCoordX = (x) => x - 4;
  const getCoordY = (y) => 4 - y;
  
  const currentPlayerStyle = { ...PLAYER_STYLES[gameState.currentPlayer] };
  if (isAiMode && gameState.currentPlayer === 2) {
    currentPlayerStyle.name = '🤖 AI 봇 (빨강)';
  }
  
  const winnerStyle = gameState.winner ? { ...PLAYER_STYLES[gameState.winner] } : null;
  if (isAiMode && gameState.winner === 2) {
    winnerStyle.name = '🤖 AI 봇 (빨강)';
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '0', backgroundColor: '#e9f5e9', padding: '20px', minHeight: '100vh', fontFamily: '"Malgun Gothic", sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto 10px' }}>
        <button onClick={onGoHome} style={{ padding: '8px 15px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}>
          ⬅️ 처음으로
        </button>
        <span style={{ fontWeight: 'bold', color: '#555' }}>{isAiMode ? 'AI 연습 모드' : `총 ${numberOfPlayers}인 플레이`}</span>
      </div>

      <h2 style={{ color: gameState.winner ? winnerStyle.color : currentPlayerStyle.color, fontSize: '2rem', marginTop: '10px' }}>
        {gameState.winner 
          ? `🎉 ${winnerStyle.name} 승리! 🎉` 
          : `${currentPlayerStyle.name}의 턴`}
      </h2>
      
      <div style={{ 
        display: 'inline-block', position: 'relative', marginTop: '10px', 
        backgroundColor: '#d2b48c', // 나무 느낌의 부드러운 갈색 배경
        padding: '30px', borderRadius: '15px', 
        boxShadow: '0 8px 16px rgba(93, 64, 55, 0.4)',
        border: '4px solid #8b5a2b'
      }}>
        
        {/* 화살표 및 x, y 라벨 축 */}
        <div style={{ position: 'relative' }}>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 50px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 50px)`,
            border: '2px solid #5d4037', // 짙은 갈색 테두리
            backgroundColor: 'transparent',
            position: 'relative'
          }}>
            
            {/* 맨 위 y축 화살표 */}
            <div style={{ position: 'absolute', top: '-10px', left: 'calc(50% - 5px)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid #3e2723', zIndex: 5 }}></div>
            <div style={{ position: 'absolute', top: '-28px', left: 'calc(50% + 10px)', fontWeight: 'bold', fontStyle: 'italic', color: '#3e2723', zIndex: 5 }}>y</div>
            
            {/* 맨 오른쪽 x축 화살표 */}
            <div style={{ position: 'absolute', top: 'calc(50% - 5px)', right: '-10px', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '10px solid #3e2723', zIndex: 5 }}></div>
            <div style={{ position: 'absolute', top: 'calc(50% + 10px)', right: '-20px', fontWeight: 'bold', fontStyle: 'italic', color: '#3e2723', zIndex: 5 }}>x</div>

            {gameState.board.map((row, y) => (
              row.map((cell, x) => {
                const isXAxis = y === 4;
                const isYAxis = x === 4;
                const isOrigin = isXAxis && isYAxis;
                const isSliderLine = x === gameState.sliderX || y === gameState.sliderY;
                const coordX = getCoordX(x);
                const coordY = getCoordY(y);
                
                return (
                  <div 
                    key={`${x}-${y}`}
                    style={{ position: 'relative', width: '50px', height: '50px', cursor: 'default' }}
                  >
                    {/* 가로선 */}
                    <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: isXAxis ? '2px' : '1px', backgroundColor: isXAxis ? '#3e2723' : '#a1887f', transform: 'translateY(-50%)', zIndex: 1 }} />
                    {/* 세로선 */}
                    <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: isYAxis ? '2px' : '1px', backgroundColor: isYAxis ? '#3e2723' : '#a1887f', transform: 'translateX(-50%)', zIndex: 1 }} />

                    {/* 슬라이더 라인 하이라이트 */}
                    {isSliderLine && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.25)', zIndex: 0 }} />
                    )}

                    {/* 눈금선 */}
                    {isXAxis && x !== 4 && <div style={{ position: 'absolute', left: '50%', top: '48%', height: '8px', width: '2px', backgroundColor: '#3e2723', transform: 'translateX(-50%)', zIndex: 2 }} />}
                    {isYAxis && y !== 4 && <div style={{ position: 'absolute', top: '50%', left: '48%', width: '8px', height: '2px', backgroundColor: '#3e2723', transform: 'translateY(-50%)', zIndex: 2 }} />}

                    {/* 숫자 */}
                    {isXAxis && x !== 4 && <div style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translateX(-50%)', fontSize: '11px', color: '#4e342e', zIndex: 3, fontWeight: 'bold' }}>{coordX}</div>}
                    {isYAxis && y !== 4 && <div style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-100%, -50%)', fontSize: '11px', color: '#4e342e', zIndex: 3, fontWeight: 'bold' }}>{coordY}</div>}
                    {isOrigin && <div style={{ position: 'absolute', left: '35%', top: '55%', transform: 'translate(-50%, 0)', fontSize: '12px', color: '#3e2723', zIndex: 3, fontStyle: 'italic', fontWeight: 'bold' }}>O</div>}

                    {/* 둥근 돌(칩) */}
                    {cell !== PLAYERS.NONE && (
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: PLAYER_STYLES[cell]?.gradient,
                        transform: 'translate(-50%, -50%)', zIndex: 4,
                        boxShadow: '2px 4px 6px rgba(0,0,0,0.5)',
                      }} />
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
        
        {/* 슬라이더 위치 표시 */}
        <div style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold', color: '#4e342e' }}>
          현재 교차점: ({getCoordX(gameState.sliderX)}, {getCoordY(gameState.sliderY)})
        </div>

        {/* 좌표 입력 폼 */}
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#faf6f0', border: '2px solid #8b5a2b', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleMoveSubmit}>
            <label style={{ fontSize: '18px', marginRight: '10px', color: '#5d4037', fontWeight: 'bold' }}>
              x 좌표:
              <input 
                type="number" 
                value={inputX} 
                onChange={(e) => setInputX(e.target.value)}
                min="-4" max="4"
                disabled={!!gameState.winner || (isAiMode && gameState.currentPlayer !== 1)}
                style={{ width: '50px', marginLeft: '8px', fontSize: '18px', textAlign: 'center', borderRadius: '4px', border: '1px solid #a1887f' }}
                required
              />
            </label>
            <label style={{ fontSize: '18px', marginRight: '20px', color: '#5d4037', fontWeight: 'bold' }}>
              , y 좌표:
              <input 
                type="number" 
                value={inputY} 
                onChange={(e) => setInputY(e.target.value)}
                min="-4" max="4"
                disabled={!!gameState.winner || (isAiMode && gameState.currentPlayer !== 1)}
                style={{ width: '50px', marginLeft: '8px', fontSize: '18px', textAlign: 'center', borderRadius: '4px', border: '1px solid #a1887f' }}
                required
              />
            </label>
            <button 
              type="submit" 
              disabled={!!gameState.winner || (isAiMode && gameState.currentPlayer !== 1)}
              style={{ padding: '8px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: currentPlayerStyle.color, color: 'white', border: 'none', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            >
              돌 놓기
            </button>
          </form>
          <p style={{ fontSize: '14px', color: '#795548', marginTop: '15px', margin: 0 }}>
            ※ 현재 교차점의 <strong>x 또는 y 좌표 중 하나는 반드시 유지</strong>해야 합니다.
          </p>
        </div>
      </div>
      
      {gameState.winner && (
        <div style={{ marginTop: '30px' }}>
          <button onClick={() => setGameState(createInitialState(numberOfPlayers))} style={{ padding: '12px 30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            다시 하기
          </button>
        </div>
      )}
    </div>
  );
}

export default Board;
