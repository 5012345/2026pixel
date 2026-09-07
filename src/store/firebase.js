import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off, update, remove } from 'firebase/database';

let app = null;
let db = null;

// 저장된 설정 가져오기
export function getStoredConfig() {
  const config = localStorage.getItem('pixel_firebase_config');
  return config ? JSON.parse(config) : null;
}

// Firebase 초기화
export function initFirebase(config) {
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    db = getDatabase(app);
    return true;
  } catch (error) {
    console.error("Firebase 초기화 에러:", error);
    return false;
  }
}

// 방 생성 (교사)
export async function createRoom() {
  if (!db) return null;
  // 4자리 랜덤 핀 번호 생성
  const roomId = Math.floor(1000 + Math.random() * 9000).toString();
  const roomRef = ref(db, `rooms/${roomId}`);
  
  await set(roomRef, {
    status: 'waiting', // waiting, playing, closed
    players: 0,
    gameState: null,
    createdAt: Date.now()
  });
  return roomId;
}

// 방 상태 구독
export function subscribeRoom(roomId, callback) {
  if (!db) return;
  const roomRef = ref(db, `rooms/${roomId}`);
  onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
}

// 방 구독 취소
export function unsubscribeRoom(roomId) {
  if (!db) return;
  const roomRef = ref(db, `rooms/${roomId}`);
  off(roomRef);
}

// 방 상태 업데이트
export async function updateRoomState(roomId, updates) {
  if (!db) return;
  const roomRef = ref(db, `rooms/${roomId}`);
  await update(roomRef, updates);
}

// 방 폭파 (교사)
export async function deleteRoom(roomId) {
  if (!db) return;
  const roomRef = ref(db, `rooms/${roomId}`);
  await remove(roomRef);
}

// 시작 시 자동 초기화 시도
const storedConfig = getStoredConfig();
if (storedConfig) {
  initFirebase(storedConfig);
}

export { db };
