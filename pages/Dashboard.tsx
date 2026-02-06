
import React from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../types';
import ItemCard from '../components/ItemCard';

interface DashboardProps {
  items: Item[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const activeItems = items.filter(i => i.status === 'ACTIVE');
  const lostCount = activeItems.filter(i => i.type === 'LOST').length;
  const foundCount = activeItems.filter(i => i.type === 'FOUND').length;
  const recentItems = activeItems.slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">우리 학교 분실물 센터 🏫</h1>
        <p className="text-slate-400">잃어버린 물건을 찾고, 주인을 기다리는 물건을 확인하세요.</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/lost" className="bg-rose-950/30 p-6 rounded-2xl border border-rose-900/50 hover:bg-rose-900/40 transition-all shadow-lg shadow-rose-950/10">
          <p className="text-rose-400 font-semibold mb-1">찾고 있어요</p>
          <h2 className="text-2xl font-bold text-rose-100">{lostCount}건</h2>
          <p className="text-xs text-rose-500/80 mt-2">최근 분실물 현황</p>
        </Link>
        <Link to="/found" className="bg-emerald-950/30 p-6 rounded-2xl border border-emerald-900/50 hover:bg-emerald-900/40 transition-all shadow-lg shadow-emerald-950/10">
          <p className="text-emerald-400 font-semibold mb-1">주인을 기다려요</p>
          <h2 className="text-2xl font-bold text-emerald-100">{foundCount}건</h2>
          <p className="text-xs text-emerald-500/80 mt-2">최근 습득물 현황</p>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-bold text-slate-100">최근 등록된 물건</h3>
          <Link to="/lost" className="text-sm text-indigo-400 font-medium hover:text-indigo-300">전체보기 &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentItems.length > 0 ? (
            recentItems.map(item => <ItemCard key={item.id} item={item} />)
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700 text-slate-500">
              최근 등록된 내역이 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col items-center text-center gap-4 shadow-xl shadow-indigo-900/20">
        <h3 className="text-xl font-bold">물건을 습득하거나 분실하셨나요?</h3>
        <p className="opacity-90 max-w-md">AI 기술로 물건을 쉽고 빠르게 분석하여 등록할 수 있습니다.</p>
        <Link to="/report" className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
          지금 등록하기
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
