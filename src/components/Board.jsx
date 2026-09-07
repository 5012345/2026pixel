import React, { useState, useEffect } from 'react';
import { BOARD_SIZE, PLAYERS, createInitialState, canMove, checkWin, getNextPlayer, getBotMove } from '../engine/GameLogic';

// 플레이어별 색상 매핑
const PLAYER_STYLES = {
  1: { name: '1P (초록)', color: '#4CAF50', gradient: 'radial-gradient(circle at 12px 12px, #4CAF50, #1b5e20)', bgColor: '#e8f5e9' },
  2: { name: '2P (빨강)', color: '#F44336', gradient: 'radial-gradient(circle at 12px 12px, #FF8A80, #b71c1c)', bgColor: '#ffebee' },
  3: { name: '3P (파랑)', color: '#2196F3', gradient: 'radial-gradient(circle at 12px 12px, #82B1FF, #0D47A1)', bgColor: '#e3f2fd' },
  4: { name: '4P (노랑)', color: '#FFC107', gradient: 'radial-gradient(circle at 12px 12px, #FFE57F, #FF6F00)', bgColor: '#fff8e1' },
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

  const currentBgColor = gameState.winner ? winnerStyle.bgColor : currentPlayerStyle.bgColor;

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      backgroundColor: currentBgColor, transition: 'background-color 0.5s ease',
      padding: '10px', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '"Malgun Gothic", sans-serif' 
    }}>
      
      <h2 style={{ color: gameState.winner ? winnerStyle.color : currentPlayerStyle.color, fontSize: '2rem', margin: '0 0 15px 0', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
        {gameState.winner 
          ? `🎉 ${winnerStyle.name} 승리! 🎉` 
          : `${currentPlayerStyle.name}의 턴`}
      </h2>
      
      <div style={{ 
        display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'stretch',
        backgroundColor: '#d2b48c', padding: '25px', borderRadius: '15px', 
        boxShadow: '0 10px 20px rgba(93, 64, 55, 0.4)', border: '4px solid #8b5a2b',
        maxWidth: '100%', boxSizing: 'border-box'
      }}>
        
        {/* 왼쪽: 보드판 영역 */}
        <div style={{ position: 'relative' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 50px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 50px)`,
            border: '2px solid #5d4037',
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
                  <div key={`${x}-${y}`} style={{ position: 'relative', width: '50px', height: '50px', cursor: 'default' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: isXAxis ? '2px' : '1px', backgroundColor: isXAxis ? '#3e2723' : '#a1887f', transform: 'translateY(-50%)', zIndex: 1 }} />
                    <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: isYAxis ? '2px' : '1px', backgroundColor: isYAxis ? '#3e2723' : '#a1887f', transform: 'translateX(-50%)', zIndex: 1 }} />
                    {isSliderLine && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.25)', zIndex: 0 }} />}
                    {isXAxis && x !== 4 && <div style={{ position: 'absolute', left: '50%', top: '48%', height: '8px', width: '2px', backgroundColor: '#3e2723', transform: 'translateX(-50%)', zIndex: 2 }} />}
                    {isYAxis && y !== 4 && <div style={{ position: 'absolute', top: '50%', left: '48%', width: '8px', height: '2px', backgroundColor: '#3e2723', transform: 'translateY(-50%)', zIndex: 2 }} />}
                    {isXAxis && x !== 4 && <div style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translateX(-50%)', fontSize: '11px', color: '#4e342e', zIndex: 3, fontWeight: 'bold' }}>{coordX}</div>}
                    {isYAxis && y !== 4 && <div style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-100%, -50%)', fontSize: '11px', color: '#4e342e', zIndex: 3, fontWeight: 'bold' }}>{coordY}</div>}
                    {isOrigin && <div style={{ position: 'absolute', left: '35%', top: '55%', transform: 'translate(-50%, 0)', fontSize: '12px', color: '#3e2723', zIndex: 3, fontStyle: 'italic', fontWeight: 'bold' }}>O</div>}
                    {cell !== PLAYERS.NONE && (
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', width: '38px', height: '38px', borderRadius: '50%',
                        background: PLAYER_STYLES[cell]?.gradient, transform: 'translate(-50%, -50%)', zIndex: 4,
                        boxShadow: '2px 4px 6px rgba(0,0,0,0.5)',
                      }} />
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
        
        {/* 오른쪽: 정보 및 입력 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '280px', justifyContent: 'space-between' }}>
          
          <div>
            {/* 상단 정보 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.4)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#555', fontSize: '15px' }}>
                {isAiMode ? '🤖 연습 모드' : `👥 ${numberOfPlayers}인 플레이`}
              </span>
              <button onClick={onGoHome} style={{ padding: '6px 10px', fontSize: '14px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                처음으로
              </button>
            </div>

            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4e342e', textAlign: 'center', marginBottom: '15px', backgroundColor: '#eefeef', border: '2px solid #81c784', padding: '10px', borderRadius: '8px' }}>
              현재 교차점: ({getCoordX(gameState.sliderX)}, {getCoordY(gameState.sliderY)})
            </div>

            {/* 좌표 입력 폼 */}
            <div style={{ padding: '20px', backgroundColor: '#faf6f0', border: '2px solid #8b5a2b', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
              <form onSubmit={handleMoveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '18px', color: '#5d4037', fontWeight: 'bold' }}>x 좌표 :</label>
                  <input 
                    type="number" value={inputX} onChange={(e) => setInputX(e.target.value)} min="-4" max="4" required
                    disabled={!!gameState.winner || (isAiMode && gameState.currentPlayer !== 1)}
                    style={{ width: '80px', height: '35px', fontSize: '18px', textAlign: 'center', borderRadius: '6px', border: '2px solid #a1887f' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '18px', color: '#5d4037', fontWeight: 'bold' }}>y 좌표 :</label>
                  <input 
                    type="number" value={inputY} onChange={(e) => setInputY(e.target.value)} min="-4" max="4" required
                    disabled={!!gameState.winner || (isAiMode && gameState.currentPlayer !== 1)}
                    style={{ width: '80px', height: '35px', fontSize: '18px', textAlign: 'center', borderRadius: '6px', border: '2px solid #a1887f' }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!!gameState.winner || (isAiMode && gameState.currentPlayer !== 1)}
                  style={{ marginTop: '10px', padding: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: currentPlayerStyle.color, color: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', transition: 'transform 0.1s' }}
                >
                  돌 놓기
                </button>
              </form>
              <p style={{ fontSize: '13px', color: '#795548', marginTop: '15px', lineHeight: '1.4', wordBreak: 'keep-all', margin: '15px 0 0 0' }}>
                ※ 현재 교차점의 <strong>x 또는 y 좌표 중 하나는 반드시 유지</strong>해야 합니다.
              </p>
            </div>
          </div>

          {/* 하단 다시하기 버튼 영역 */}
          <div style={{ marginTop: '15px' }}>
            {gameState.winner ? (
              <button onClick={() => setGameState(createInitialState(numberOfPlayers))} style={{ width: '100%', padding: '15px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                다시 하기
              </button>
            ) : (
              <div style={{ height: '51px' }}></div> // 버튼 높이만큼 공간 확보
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Board;
