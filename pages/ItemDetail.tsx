
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item } from '../types';

interface ItemDetailProps {
  items: Item[];
  onResolve: (id: string) => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ items, onResolve }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);

  if (!item) {
    return (
      <div className="py-24 text-center">
        <p className="text-4xl mb-4">😿</p>
        <p className="text-slate-500">물건을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-bold">홈으로 돌아가기</button>
      </div>
    );
  }

  const isLost = item.type === 'LOST';

  const handleResolve = () => {
    if (confirm("정말로 처리를 완료하시겠습니까? (이후 목록에서 사라집니다)")) {
      onResolve(item.id);
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
        <span>&larr;</span> 뒤로가기
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <div className="relative aspect-video bg-slate-100">
          <img 
            src={item.imageUrl || 'https://picsum.photos/seed/lost/800/600'} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
          <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-md ${isLost ? 'bg-rose-500' : 'bg-emerald-500'}`}>
            {isLost ? '분실물' : '습득물'}
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-slate-900">{item.title}</h1>
              <span className="text-slate-400 font-medium">{item.date}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{item.category}</span>
              {item.tags.map(tag => (
                <span key={tag} className="text-slate-500 text-xs py-1">#{tag}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">위치</p>
              <p className="text-slate-900 font-medium flex items-center gap-1">📍 {item.location}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">연락처/보관장소</p>
              <p className="text-slate-900 font-medium flex items-center gap-1">📱 {item.contact}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900">상세 설명</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="pt-8 flex gap-4">
            <a 
              href={`tel:${item.contact.replace(/[^0-9]/g, '')}`} 
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-center shadow-lg hover:bg-indigo-700 transition-colors"
            >
              연락하기
            </a>
            <button 
              onClick={handleResolve}
              className="px-6 py-4 rounded-2xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              해결 완료
            </button>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
        <h4 className="font-bold text-amber-800 mb-2">💡 안전한 거래를 위한 안내</h4>
        <ul className="text-sm text-amber-700 space-y-2 list-disc list-inside">
          <li>물건을 돌려줄 때는 사람이 많은 공공장소에서 만나는 것이 안전합니다.</li>
          <li>학교 밖의 장소보다는 학생회실, 교무실 등을 활용하세요.</li>
          <li>허위 정보를 등록할 경우 서비스 이용이 제한될 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default ItemDetail;
