
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Item } from './types';
import Dashboard from './pages/Dashboard';
import ItemList from './pages/ItemList';
import ReportItem from './pages/ReportItem';
import ItemDetail from './pages/ItemDetail';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-6 py-3 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:px-12">
      <Link to="/" className="flex flex-col items-center gap-1 md:flex-row md:gap-2">
        <span className={`text-2xl ${isActive('/') ? 'text-indigo-400' : 'text-slate-500'}`}>🏠</span>
        <span className={`text-xs font-medium md:text-lg ${isActive('/') ? 'text-indigo-400' : 'text-slate-300'}`}>홈</span>
      </Link>
      <Link to="/lost" className="flex flex-col items-center gap-1 md:flex-row md:gap-2">
        <span className={`text-2xl ${isActive('/lost') ? 'text-indigo-400' : 'text-slate-500'}`}>🔍</span>
        <span className={`text-xs font-medium md:text-lg ${isActive('/lost') ? 'text-indigo-400' : 'text-slate-300'}`}>분실물</span>
      </Link>
      <Link to="/found" className="flex flex-col items-center gap-1 md:flex-row md:gap-2">
        <span className={`text-2xl ${isActive('/found') ? 'text-indigo-400' : 'text-slate-500'}`}>🎁</span>
        <span className={`text-xs font-medium md:text-lg ${isActive('/found') ? 'text-indigo-400' : 'text-slate-300'}`}>습득물</span>
      </Link>
      <Link to="/report" className="flex flex-col items-center gap-1 md:flex-row md:gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full text-white transition-colors shadow-lg shadow-indigo-500/20">
        <span className="text-xl">➕</span>
        <span className="text-xs font-bold md:text-base">등록하기</span>
      </Link>
    </nav>
  );
};

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('school_items');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      const mockItems: Item[] = [
        {
          id: '1',
          type: 'LOST',
          title: '검은색 에어팟 프로',
          category: '전자기기',
          description: '케이스에 노란색 스마일리 스티커가 붙어있습니다.',
          location: '2층 도서관 입구',
          date: '2024-05-15',
          tags: ['에어팟', '이어폰', '전자기기'],
          contact: '010-1234-5678',
          status: 'ACTIVE',
          createdAt: Date.now() - 86400000,
          imageUrl: 'https://picsum.photos/seed/airpods/400/300'
        },
        {
          id: '2',
          type: 'FOUND',
          title: '수학의 정석 교재',
          category: '학용품',
          description: '이름이 안 적혀있는 깨끗한 책입니다.',
          location: '운동장 스탠드',
          date: '2024-05-16',
          tags: ['수학', '교재', '책'],
          contact: '학생회실 보관 중',
          status: 'ACTIVE',
          createdAt: Date.now() - 3600000,
          imageUrl: 'https://picsum.photos/seed/book/400/300'
        }
      ];
      setItems(mockItems);
      localStorage.setItem('school_items', JSON.stringify(mockItems));
    }
  }, []);

  const addItem = (newItem: Item) => {
    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem('school_items', JSON.stringify(updated));
  };

  const resolveItem = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, status: 'RESOLVED' as const } : item);
    setItems(updated);
    localStorage.setItem('school_items', JSON.stringify(updated));
  };

  return (
    <HashRouter>
      <div className="min-h-screen pb-24 md:pb-0 md:pt-20 bg-slate-950">
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
