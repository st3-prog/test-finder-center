
import React from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const isLost = item.type === 'LOST';

  return (
    <Link to={`/item/${item.id}`} className="block group">
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800 group-hover:border-slate-700 group-hover:shadow-md transition-all h-full flex flex-col">
        <div className="relative h-48 bg-slate-800">
          <img 
            src={item.imageUrl || 'https://picsum.photos/seed/lost/400/300'} 
            alt={item.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${isLost ? 'bg-rose-500' : 'bg-emerald-500'}`}>
            {isLost ? '분실' : '습득'}
          </div>
          {item.status === 'RESOLVED' && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white text-slate-950 px-4 py-1 rounded-full text-sm font-bold">처리완료</span>
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">{item.title}</h4>
            <span className="text-xs text-slate-500 shrink-0">{item.date}</span>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
          <div className="pt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">#{tag}</span>
            ))}
          </div>
          <div className="pt-2 mt-auto border-t border-slate-800 flex items-center gap-1 text-slate-500 text-[11px]">
            <span>📍 {item.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
