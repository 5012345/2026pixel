import React, { useState, useEffect } from 'react';
import { BOARD_SIZE, PLAYERS, createInitialState, canMove, checkWin } from '../engine/GameLogic';
import { subscribeRoom, unsubscribeRoom, updateRoomState, deleteRoom } from '../store/firebase';

function MultiplayerBoard({ roomId, role, onLeave }) {
  const [roomData, setRoomData] = useState(null);
  const [inputX, setInputX] = useState('');
  const [inputY, setInputY] = useState('');

  // 1. 방 상태 구독
  useEffect(() => {
    subscribeRoom(roomId, (data) => {
      if (!data) {
        alert("방이 존재하지 않거나 종료되었습니다.");
        onLeave();
      } else {
        setRoomData(data);
      }
    });

    return () => {
      unsubscribeRoom(roomId);
    };
  }, [roomId, onLeave]);

  // 2. 방 상태 조작 (교사 전용)
  const handleStartGame = () => {
    if (role !== 'teacher') return;
    updateRoomState(roomId, {
      status: 'playing',
      gameState: createInitialState(), // 초기 게임 상태 업로드
      player1: 'teacher', // 교사가 선공(초록돌)이라고 가정하거나 관전모드 구성 (현재는 교사도 플레이어라 가정)
      player2: 'student'
    });
  };

  const handleCloseRoom = () => {
    if (role !== 'teacher') return;
    if (window.confirm("방을 폐쇄하시겠습니까?")) {
      deleteRoom(roomId);
    }
  };

  const handleStudentJoin = () => {
    if (role === 'student' && roomData?.status === 'waiting') {
      updateRoomState(roomId, { players: (roomData.players || 0) + 1 });
    }
  };

  // 학생 최초 접속 시 입장 카운트 증가
  useEffect(() => {
    if (role === 'student' && roomData && roomData.status === 'waiting') {
      // 본인이 입장했다는 의미로 카운트 증가 (간단 구현)
      // 실제로는 중복 증가 방지를 위해 sessionStorage 등을 써야 하지만 프로토타입 수준으로 둠.
    }
  }, [role, roomData]);


  // 3. 게임 조작 (턴 처리)
  const handleMoveSubmit = (e) => {
    e.preventDefault();
    if (roomData.status !== 'playing' || !roomData.gameState) return;
    const { gameState } = roomData;
    
    // 내 턴인지 확인
    const isMyTurn = (role === 'teacher' && gameState.currentPlayer === PLAYERS.PLAYER) || 
                     (role === 'student' && gameState.currentPlayer === PLAYERS.AI);
    
    if (!isMyTurn) {
      alert("상대방의 턴입니다. 기다려주세요.");
      return;
    }
    
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
    
    // 새 상태 계산
    const newBoard = gameState.board.map(row => [...row]);
    const currentStone = gameState.currentPlayer;
    newBoard[gridY][gridX] = currentStone;

    let winner = null;
    if (checkWin(newBoard, currentStone)) {
      winner = currentStone;
    }

    const newGameState = {
      ...gameState,
      board: newBoard,
      sliderX: gridX,
      sliderY: gridY,
      currentPlayer: winner ? gameState.currentPlayer : (currentStone === PLAYERS.PLAYER ? PLAYERS.AI : PLAYERS.PLAYER),
      winner,
      isFirstTurn: false
    };

    // Firebase 업데이트
    updateRoomState(roomId, { gameState: newGameState });
  };

  const getCoordX = (x) => x - 4;
  const getCoordY = (y) => 4 - y;

  if (!roomData) return <div style={{marginTop: '50px', textAlign: 'center'}}>방 정보를 불러오는 중...</div>;

  const { status, gameState } = roomData;
  const amITeacher = role === 'teacher';
  const myColor = amITeacher ? PLAYERS.PLAYER : PLAYERS.AI;

  return (
    <div style={{ textAlign: 'center', marginTop: '20px', backgroundColor: '#e9f5e9', padding: '20px', minHeight: '100vh', fontFamily: '"Malgun Gothic", sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto 20px', padding: '10px 20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div>
          <span style={{ fontSize: '14px', color: '#666' }}>방 번호</span>
          <h2 style={{ margin: 0, color: '#2E7D32', letterSpacing: '2px' }}>{roomId}</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', color: amITeacher ? '#1565C0' : '#E65100' }}>
            {amITeacher ? '👨‍🏫 교사 (녹색 돌)' : '🎓 학생 (상아색 돌)'}
          </div>
          <button onClick={onLeave} style={{ marginTop: '5px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>나가기</button>
        </div>
      </div>

      {status === 'waiting' && (
        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '12px', display: 'inline-block' }}>
          <h3>대기 중...</h3>
          <p>학생들이 방 번호 <strong>{roomId}</strong> 로 접속할 수 있도록 안내해 주세요.</p>
          {amITeacher ? (
            <div style={{ marginTop: '20px' }}>
              <button onClick={handleStartGame} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '10px' }}>게임 시작</button>
              <button onClick={handleCloseRoom} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>방 폐쇄</button>
            </div>
          ) : (
            <p style={{ color: '#757575' }}>선생님이 게임을 시작할 때까지 기다려주세요.</p>
          )}
        </div>
      )}

      {status === 'playing' && gameState && (
        <div>
          <h2 style={{ color: '#3e5c3e' }}>
            {gameState.winner 
              ? (gameState.winner === PLAYERS.PLAYER ? '🎉 교사 승리!' : '🎉 학생 승리!') 
              : (gameState.currentPlayer === PLAYERS.PLAYER ? '교사 턴 (녹색 돌)' : '학생 턴 (상아색 돌)')}
          </h2>
          
          <div style={{ 
            display: 'inline-block', position: 'relative', marginTop: '10px', 
            backgroundColor: '#d2b48c',
            padding: '30px', borderRadius: '15px', 
            boxShadow: '0 8px 16px rgba(93, 64, 55, 0.4)',
            border: '4px solid #8b5a2b'
          }}>
            {/* 보드판 렌더링 (기존 Board.jsx와 동일) */}
            <div style={{ position: 'relative' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 50px)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, 50px)`,
                border: '2px solid #5d4037',
                backgroundColor: 'transparent',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '-10px', left: 'calc(50% - 5px)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid #3e2723', zIndex: 5 }}></div>
                <div style={{ position: 'absolute', top: '-28px', left: 'calc(50% + 10px)', fontWeight: 'bold', fontStyle: 'italic', color: '#3e2723', zIndex: 5 }}>y</div>
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
                      <div key={`${x}-${y}`} style={{ position: 'relative', width: '50px', height: '50px' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: isXAxis ? '2px' : '1px', backgroundColor: isXAxis ? '#3e2723' : '#a1887f', translateY: '-50%', zIndex: 1 }} />
                        <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: isYAxis ? '2px' : '1px', backgroundColor: isYAxis ? '#3e2723' : '#a1887f', translateX: '-50%', zIndex: 1 }} />
                        {isSliderLine && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(76, 175, 80, 0.2)', zIndex: 0 }} />}
                        {isXAxis && x !== 4 && <div style={{ position: 'absolute', left: '50%', top: '48%', height: '8px', width: '2px', backgroundColor: '#3e2723', transform: 'translateX(-50%)', zIndex: 2 }} />}
                        {isYAxis && y !== 4 && <div style={{ position: 'absolute', top: '50%', left: '48%', width: '8px', height: '2px', backgroundColor: '#3e2723', transform: 'translateY(-50%)', zIndex: 2 }} />}
                        {isXAxis && x !== 4 && <div style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translateX(-50%)', fontSize: '11px', color: '#4e342e', zIndex: 3, fontWeight: 'bold' }}>{coordX}</div>}
                        {isYAxis && y !== 4 && <div style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-100%, -50%)', fontSize: '11px', color: '#4e342e', zIndex: 3, fontWeight: 'bold' }}>{coordY}</div>}
                        {isOrigin && <div style={{ position: 'absolute', left: '35%', top: '55%', transform: 'translate(-50%, 0)', fontSize: '12px', color: '#3e2723', zIndex: 3, fontStyle: 'italic', fontWeight: 'bold' }}>O</div>}
                        {cell !== PLAYERS.NONE && (
                          <div style={{
                            position: 'absolute', top: '50%', left: '50%', width: '38px', height: '38px', borderRadius: '50%',
                            background: cell === PLAYERS.PLAYER ? 'radial-gradient(circle at 12px 12px, #4CAF50, #1b5e20)' : 'radial-gradient(circle at 12px 12px, #fdfbf7, #d7ccc8)',
                            transform: 'translate(-50%, -50%)', zIndex: 4, boxShadow: '2px 4px 6px rgba(0,0,0,0.5)',
                          }} />
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold', color: '#4e342e' }}>
              현재 교차점: ({getCoordX(gameState.sliderX)}, {getCoordY(gameState.sliderY)})
            </div>

            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#faf6f0', border: '2px solid #8b5a2b', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
              <form onSubmit={handleMoveSubmit}>
                <label style={{ fontSize: '18px', marginRight: '10px', color: '#5d4037', fontWeight: 'bold' }}>
                  x 좌표:
                  <input type="number" value={inputX} onChange={(e) => setInputX(e.target.value)} min="-4" max="4" disabled={gameState.currentPlayer !== myColor || gameState.winner} style={{ width: '50px', marginLeft: '8px', fontSize: '18px', textAlign: 'center', borderRadius: '4px', border: '1px solid #a1887f' }} required />
                </label>
                <label style={{ fontSize: '18px', marginRight: '20px', color: '#5d4037', fontWeight: 'bold' }}>
                  , y 좌표:
                  <input type="number" value={inputY} onChange={(e) => setInputY(e.target.value)} min="-4" max="4" disabled={gameState.currentPlayer !== myColor || gameState.winner} style={{ width: '50px', marginLeft: '8px', fontSize: '18px', textAlign: 'center', borderRadius: '4px', border: '1px solid #a1887f' }} required />
                </label>
                <button type="submit" disabled={gameState.currentPlayer !== myColor || gameState.winner} style={{ padding: '8px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  돌 놓기
                </button>
              </form>
              <p style={{ fontSize: '14px', color: '#795548', marginTop: '15px', margin: 0 }}>
                ※ 현재 교차점의 <strong>x 또는 y 좌표 중 하나는 반드시 유지</strong>해야 합니다.
              </p>
            </div>
          </div>
          
          {gameState.winner && amITeacher && (
            <div style={{ marginTop: '30px' }}>
              <button onClick={handleStartGame} style={{ padding: '12px 30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', marginRight: '10px' }}>
                다시 하기 (초기화)
              </button>
              <button onClick={handleCloseRoom} style={{ padding: '12px 30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                방 폐쇄
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiplayerBoard;
