
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Item } from './types';
import Dashboard from './pages/Dashboard';
import ItemList from './pages/ItemList';
import ReportItem from './pages/ReportItem';
import ItemDetail from './pages/ItemDetail';
import { itemService } from './services/itemService';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-6 py-3 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:px-12">
      <Link to="/" className="flex flex-col items-center gap-1 md:flex-row md:gap-2 group">
        <span className={`text-2xl transition-transform group-active:scale-90 ${isActive('/') ? 'text-indigo-400' : 'text-slate-500'}`}>🏠</span>
        <span className={`text-[10px] font-bold md:text-base ${isActive('/') ? 'text-indigo-400' : 'text-slate-400'}`}>홈</span>
      </Link>
      <Link to="/lost" className="flex flex-col items-center gap-1 md:flex-row md:gap-2 group">
        <span className={`text-2xl transition-transform group-active:scale-90 ${isActive('/lost') ? 'text-indigo-400' : 'text-slate-500'}`}>🔍</span>
        <span className={`text-[10px] font-bold md:text-base ${isActive('/lost') ? 'text-indigo-400' : 'text-slate-400'}`}>분실물</span>
      </Link>
      <Link to="/found" className="flex flex-col items-center gap-1 md:flex-row md:gap-2 group">
        <span className={`text-2xl transition-transform group-active:scale-90 ${isActive('/found') ? 'text-indigo-400' : 'text-slate-500'}`}>🎁</span>
        <span className={`text-[10px] font-bold md:text-base ${isActive('/found') ? 'text-indigo-400' : 'text-slate-400'}`}>습득물</span>
      </Link>
      <Link to="/report" className="flex flex-col items-center gap-1 md:flex-row md:gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
        <span className="text-xl">➕</span>
        <span className="text-[10px] font-black md:text-base">등록</span>
      </Link>
    </nav>
  );
};

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasConfig, setHasConfig] = useState(itemService.checkConfig());

  useEffect(() => {
    if (!hasConfig) return;

    setIsSyncing(true);
    const unsubscribe = itemService.subscribeItems((newItems) => {
      setItems(newItems);
      setIsLoaded(true);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [hasConfig]);

  const addItem = async (newItem: Omit<Item, 'id'>) => {
    setIsSyncing(true);
    try {
      await itemService.create(newItem);
    } catch (e) {
      alert("등록 실패: Firebase 설정을 확인하세요.");
    } finally {
      setIsSyncing(false);
    }
  };

  const resolveItem = async (id: string) => {
    setIsSyncing(true);
    try {
      await itemService.updateStatus(id, 'RESOLVED');
    } catch (e) {
      alert("처리 실패");
    } finally {
      setIsSyncing(false);
    }
  };

  // 설정이 안 되어 있을 때 보여줄 안내 화면
  if (!hasConfig) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="text-6xl">⚙️</div>
        <h1 className="text-2xl font-bold text-white">Firebase 설정이 필요합니다</h1>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-400 text-sm space-y-4 max-w-md">
          <p>1. <span className="text-indigo-400 font-bold">services/itemService.ts</span> 파일을 엽니다.</p>
          <p>2. Firebase 콘솔에서 복사한 <span className="text-indigo-400 font-bold">firebaseConfig</span>를 붙여넣으세요.</p>
          <p>3. Firestore <span className="text-indigo-400 font-bold">'규칙(Rules)'</span> 탭에서 <code className="bg-slate-800 px-1 rounded text-rose-400">allow read, write: if true;</code>로 수정하세요.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold"
        >
          설정 완료 후 새로고침
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-400 font-bold animate-pulse text-center px-4">
          학교 클라우드에 연결 중입니다...<br/>
          <span className="text-xs font-normal text-slate-500">(연결이 너무 오래 걸리면 규칙 설정을 확인하세요)</span>
        </p>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen pb-24 md:pb-0 md:pt-16 bg-slate-950 selection:bg-indigo-500/30">
        {isSyncing && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 z-[100] animate-pulse"></div>
        )}
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard items={items} />} />
            <Route path="/lost" element={<ItemList type="LOST" items={items} />} />
            <Route path="/found" element={<ItemList type="FOUND" items={items} />} />
            <Route path="/report" element={<ReportItem onAdd={addItem} />} />
            <Route path="/item/:id" element={<ItemDetail items={items} onResolve={resolveItem} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
