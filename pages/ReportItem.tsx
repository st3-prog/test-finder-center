
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item, ItemType } from '../types';
import { analyzeItem } from '../services/geminiService';

interface ReportItemProps {
  onAdd: (item: Omit<Item, 'id'>) => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ onAdd }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'FOUND' as ItemType,
    title: '',
    category: '기타',
    location: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    contact: '',
    imageUrl: '',
    tags: [] as string[]
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorStatus(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, imageUrl: base64 }));
      
      try {
        const analysis = await analyzeItem(base64);
        setFormData(prev => ({
          ...prev,
          title: analysis.title,
          category: analysis.category,
          description: analysis.description,
          tags: analysis.tags
        }));
      } catch (err: any) {
        console.error("Analysis Error:", err);
        setErrorStatus("AI 분석에 실패했습니다. 직접 내용을 입력해주세요.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.contact) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        ...formData,
        status: 'ACTIVE',
        createdAt: Date.now()
      });
      navigate(formData.type === 'LOST' ? '/lost' : '/found');
    } catch (err) {
      alert("서버 전송에 실패했습니다. Firebase 설정을 확인하세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-slideUp">
      <header>
        <h1 className="text-3xl font-bold text-white">물건 등록하기</h1>
        <p className="text-slate-400">사진을 올리면 AI가 정보를 자동으로 채워줍니다.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 타입 선택 버튼 (분실/습득) */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${formData.type === 'FOUND' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setFormData(prev => ({ ...prev, type: 'FOUND' }))}
          >
            🎁 습득물
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${formData.type === 'LOST' ? 'bg-slate-800 text-rose-400 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setFormData(prev => ({ ...prev, type: 'LOST' }))}
          >
            🔍 분실물
          </button>
        </div>

        {/* 이미지 업로드 영역 */}
        <div className="space-y-3">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-video bg-slate-900 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors overflow-hidden ${errorStatus ? 'border-rose-900/50' : 'border-slate-800'}`}
          >
            {formData.imageUrl ? (
              <>
                <img src={formData.imageUrl} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold">사진 변경</span>
                </div>
              </>
            ) : (
              <>
                <span className="text-4xl mb-2">📸</span>
                <p className="text-slate-300 font-medium">사진을 업로드하세요</p>
                <p className="text-xs text-slate-500 mt-1">AI가 자동으로 분석합니다</p>
              </>
            )}
            {loading && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-10">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-bold animate-pulse text-sm">AI 분석 중...</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          
          {errorStatus && (
            <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-xl flex items-start gap-2">
              <span className="text-rose-500">⚠️</span>
              <p className="text-xs text-rose-400">{errorStatus}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">물건 이름 *</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white outline-none"
              placeholder="예: 파란색 필통"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">카테고리</label>
              <select 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none appearance-none"
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                {['전자기기', '의류', '학용품', '지갑/카드', '악세사리', '기타'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">날짜</label>
              <input 
                type="date"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none [color-scheme:dark]"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">발견/분실 장소 *</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white outline-none"
              placeholder="예: 3층 도서관"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">연락처/보관장소 *</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white outline-none"
              placeholder="예: 학생회실 보관 중"
              value={formData.contact}
              onChange={e => setFormData(prev => ({ ...prev, contact: e.target.value }))}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-500 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? '서버에 저장 중...' : '등록 완료'}
        </button>
      </form>
    </div>
  );
};

export default ReportItem;
