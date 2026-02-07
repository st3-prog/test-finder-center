// @ts-ignore - Environment specific type resolution fix for Firebase modular exports
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  Firestore
} from "firebase/firestore";
import { Item } from "../types";

/**
 * Firebase 설정 (사용자 프로젝트: test-finder-center)
 */
const firebaseConfig = {
  apiKey: "AIzaSyCJCxD5iSz3L384NCkWf8HAFVw_UUUyoGs",
  authDomain: "test-finder-center.firebaseapp.com",
  projectId: "test-finder-center",
  storageBucket: "test-finder-center.firebasestorage.app",
  messagingSenderId: "181806619780",
  appId: "1:181806619780:web:03c900861b776e8c70b6d1"
};

// 앱 초기화 및 Firestore 인스턴스 획득
let db: Firestore;
try {
  // @ts-ignore - Ensure app is only initialized once even in hot-reload environments
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase 초기화 에러:", error);
}

export const itemService = {
  /** 
   * 설정 확인
   */
  checkConfig() {
    return !!db;
  },

  /** 
   * 실시간 데이터 구독
   */
  subscribeItems(callback: (items: Item[]) => void) {
    if (!db) return () => {};

    const itemsCol = collection(db, "items");
    const q = query(itemsCol, orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Item[];
      callback(items);
    }, (error) => {
      console.error("Firestore 수신 에러:", error);
    });
  },

  /** 새 아이템 등록 */
  async create(item: Omit<Item, 'id'>): Promise<string> {
    if (!db) throw new Error("DB 연결 없음");
    const itemsCol = collection(db, "items");
    const docRef = await addDoc(itemsCol, {
      ...item,
      createdAt: Date.now(),
      status: 'ACTIVE'
    });
    return docRef.id;
  },

  /** 상태 업데이트 */
  async updateStatus(id: string, status: 'ACTIVE' | 'RESOLVED'): Promise<void> {
    if (!db) throw new Error("DB 연결 없음");
    const itemRef = doc(db, "items", id);
    await updateDoc(itemRef, { status });
  }
};