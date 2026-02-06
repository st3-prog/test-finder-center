
export type ItemType = 'LOST' | 'FOUND';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  imageUrl?: string;
  tags: string[];
  contact: string;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: number;
}

export interface AnalysisResult {
  title: string;
  category: string;
  tags: string[];
  description: string;
}
