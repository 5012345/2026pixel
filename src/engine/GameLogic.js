// 보드 크기 (좌표평면 -4 ~ 4 이므로 9x9)
export const BOARD_SIZE = 9;

// 플레이어 상수 (1부터 numberOfPlayers까지 사용)
export const PLAYERS = {
  NONE: null
};

// 게임 상태 초기화
export function createInitialState(numberOfPlayers = 2) {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(PLAYERS.NONE));
  return {
    board,
    sliderX: 4, // 초기 X (원점 0에 해당하는 인덱스)
    sliderY: 4, // 초기 Y (원점 0에 해당하는 인덱스)
    currentPlayer: 1, // 1부터 시작
    numberOfPlayers,
    winner: null,
    isFirstTurn: true, // 첫 턴에는 교차점에 바로 둘 수 없고 무조건 하나를 움직여야 함
  };
}

// 다음 턴 플레이어 번호 계산
export function getNextPlayer(currentPlayer, numberOfPlayers) {
  return (currentPlayer % numberOfPlayers) + 1;
}

// 착수 가능 여부 검사
export function canMove(gameState, newX, newY) {
  if (gameState.winner) return false;
  
  // 두 슬라이더 중 하나만 움직여야 함
  const isXMoved = newX !== gameState.sliderX;
  const isYMoved = newY !== gameState.sliderY;
  
  if (isXMoved && isYMoved) return false; // 둘 다 움직일 수 없음
  if (!isXMoved && !isYMoved && !gameState.isFirstTurn) return false; // 안 움직일 수 없음 (첫 턴 세팅 제외)

  // 목표 교차점이 비어있어야 함
  if (gameState.board[newY][newX] !== PLAYERS.NONE) return false;

  return true;
}

// 승리 조건 검사 (3목)
export function checkWin(board, player) {
  const target = 3;
  // 모든 칸 순회하며 가로, 세로, 대각선 검사
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== player) continue;
      
      // 가로
      if (x <= BOARD_SIZE - target) {
        if (board[y][x+1] === player && board[y][x+2] === player) return true;
      }
      // 세로
      if (y <= BOARD_SIZE - target) {
        if (board[y+1][x] === player && board[y+2][x] === player) return true;
      }
      // 대각선 (우하향)
      if (x <= BOARD_SIZE - target && y <= BOARD_SIZE - target) {
        if (board[y+1][x+1] === player && board[y+2][x+2] === player) return true;
      }
      // 대각선 (우상향)
      if (x <= BOARD_SIZE - target && y >= target - 1) {
        if (board[y-1][x+1] === player && board[y-2][x+2] === player) return true;
      }
    }
  }
  return false;
}

// 봇의 랜덤 턴 계산 (AI 모드용)
export function getBotMove(gameState) {
  const possibleMoves = [];
  
  // 가로(X)를 고정하고 세로(Y)를 움직이는 경우
  for (let y = 0; y < BOARD_SIZE; y++) {
    if (canMove(gameState, gameState.sliderX, y)) {
      possibleMoves.push({ x: gameState.sliderX, y });
    }
  }
  
  // 세로(Y)를 고정하고 가로(X)를 움직이는 경우
  for (let x = 0; x < BOARD_SIZE; x++) {
    if (canMove(gameState, x, gameState.sliderY)) {
      possibleMoves.push({ x, y: gameState.sliderY });
    }
  }
  
  if (possibleMoves.length === 0) return null; // 이동할 곳이 없음
  
  // 무작위 선택
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
}
