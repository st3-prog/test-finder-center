
import React, { useState } from 'react';
import { Item, ItemType } from '../types';
import ItemCard from '../components/ItemCard';

interface ItemListProps {
  type: ItemType;
  items: Item[];
}

const ItemList: React.FC<ItemListProps> = ({ type, items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('전체');

  const categories = ['전체', '전자기기', '의류', '학용품', '지갑/카드', '악세사리', '기타'];

  const filteredItems = items
    .filter(item => item.type === type && item.status === 'ACTIVE')
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = category === '전체' || item.category === category;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {type === 'LOST' ? '🔍 분실물 찾기' : '🎁 주인을 기다리는 습득물'}
        </h1>
        
        <div className="relative">
          <input 
            type="text"
            placeholder="물건 이름, 태그, 위치 검색..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => <ItemCard key={item.id} item={item} />)
        ) : (
          <div className="col-span-full py-24 text-center">
            <p className="text-4xl mb-4">😶</p>
            <p className="text-slate-500 font-medium">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemList;
