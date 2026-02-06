
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
        <h1 className="text-3xl font-bold text-slate-900">우리 학교 분실물 센터 🏫</h1>
        <p className="text-slate-500">잃어버린 물건을 찾고, 주인을 기다리는 물건을 확인하세요.</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/lost" className="bg-rose-50 p-6 rounded-2xl border border-rose-100 hover:shadow-md transition-shadow">
          <p className="text-rose-600 font-semibold mb-1">찾고 있어요</p>
          <h2 className="text-2xl font-bold text-rose-900">{lostCount}건</h2>
          <p className="text-xs text-rose-500 mt-2">최근 분실물 현황</p>
        </Link>
        <Link to="/found" className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow">
          <p className="text-emerald-600 font-semibold mb-1">주인을 기다려요</p>
          <h2 className="text-2xl font-bold text-emerald-900">{foundCount}건</h2>
          <p className="text-xs text-emerald-500 mt-2">최근 습득물 현황</p>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-bold text-slate-800">최근 등록된 물건</h3>
          <Link to="/lost" className="text-sm text-indigo-600 font-medium">전체보기 &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentItems.length > 0 ? (
            recentItems.map(item => <ItemCard key={item.id} item={item} />)
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
              최근 등록된 내역이 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col items-center text-center gap-4">
        <h3 className="text-xl font-bold">물건을 습득하거나 분실하셨나요?</h3>
        <p className="opacity-90">AI 기술로 물건을 쉽고 빠르게 분석하여 등록할 수 있습니다.</p>
        <Link to="/report" className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
          지금 등록하기
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
