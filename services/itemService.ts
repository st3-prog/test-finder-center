
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

// 가짜 텍스트 확인
const isConfigEmpty = firebaseConfig.apiKey.includes("여기에");

// 앱 초기화 및 Firestore 인스턴스 획득을 안전하게 수행
let db: Firestore | null = null;
try {
  if (!isConfigEmpty) {
    // 이미 초기화된 앱이 있으면 그것을 쓰고, 없으면 새로 초기화합니다.
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Firebase 초기화 중 에러 발생:", error);
}

export const itemService = {
  /** 
   * 설정 확인용 헬퍼
   */
  checkConfig() {
    return !isConfigEmpty && db !== null;
  },

  /** 
   * 실시간 데이터 리스너 설정
   */
  subscribeItems(callback: (items: Item[]) => void) {
    if (!db) {
      console.warn("Firestore가 연결되지 않았습니다.");
      return () => {};
    }

    const itemsCol = collection(db, "items");
    const q = query(itemsCol, orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Item[];
      callback(items);
    }, (error) => {
      console.error("데이터 수신 에러:", error);
    });
  },

  /** 새 아이템 등록하기 */
  async create(item: Omit<Item, 'id'>): Promise<string> {
    if (!db) throw new Error("데이터베이스 연결 실패");
    const itemsCol = collection(db, "items");
    const docRef = await addDoc(itemsCol, {
      ...item,
      createdAt: Date.now(),
      status: 'ACTIVE'
    });
    return docRef.id;
  },

  /** 아이템 상태 변경 */
  async updateStatus(id: string, status: 'ACTIVE' | 'RESOLVED'): Promise<void> {
    if (!db) throw new Error("데이터베이스 연결 실패");
    const itemRef = doc(db, "items", id);
    await updateDoc(itemRef, { status });
  }
};
