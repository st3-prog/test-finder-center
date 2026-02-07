
import { getStore } from "@netlify/blobs";

export const handler = async (event: any) => {
  const store = getStore("school-finder-items");
  const ITEM_KEY = "global-items-v1";

  // 기본 목데이터 (데이터가 없을 경우 사용)
  const defaultItems = [
    {
      id: '1',
      type: 'LOST',
      title: '검은색 에어팟 프로 (예시)',
      category: '전자기기',
      description: '케이스에 노란색 스마일리 스티커가 붙어있습니다.',
      location: '2층 도서관 입구',
      date: '2024-05-15',
      tags: ['에어팟', '이어폰'],
      contact: '학생회실',
      status: 'ACTIVE',
      createdAt: Date.now()
    }
  ];

  try {
    // 1. 데이터 조회 (GET)
    if (event.httpMethod === "GET") {
      const data = await store.get(ITEM_KEY, { type: "json" }) || defaultItems;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      };
    }

    // 2. 데이터 등록 (POST)
    if (event.httpMethod === "POST") {
      const newItem = JSON.parse(event.body);
      const currentItems: any[] = await store.get(ITEM_KEY, { type: "json" }) || defaultItems;
      const updatedItems = [newItem, ...currentItems];
      await store.setJSON(ITEM_KEY, updatedItems);
      
      return {
        statusCode: 201,
        body: JSON.stringify(newItem)
      };
    }

    // 3. 데이터 상태 업데이트 (PATCH - 처리 완료 등)
    if (event.httpMethod === "PATCH") {
      const { id, status } = JSON.parse(event.body);
      const currentItems: any[] = await store.get(ITEM_KEY, { type: "json" }) || defaultItems;
      const updatedItems = currentItems.map(item => 
        item.id === id ? { ...item, status } : item
      );
      await store.setJSON(ITEM_KEY, updatedItems);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (error: any) {
    console.error("Storage Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "STORAGE_ERROR", message: error.message })
    };
  }
};
