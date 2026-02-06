
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  // POST 요청만 허용
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { image, prompt } = JSON.parse(event.body);
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API_KEY_MISSING", message: "서버에 API 키가 설정되지 않았습니다." })
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-flash-preview';

    const systemInstruction = `
      당신은 학교 분실물 센터의 AI 도우미입니다. 
      제공된 이미지나 텍스트를 분석하여 다음 정보를 JSON으로 반환하세요:
      - title: 물건의 이름 (예: 파란색 필통)
      - category: 전자기기, 의류, 학용품, 지갑/카드, 악세사리, 기타 중 선택
      - tags: 검색에 유용한 키워드 3개 리스트
      - description: 물건의 특징 (색상, 상태 등)
    `;

    const parts: any[] = [];
    if (image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: image.split(',')[1]
        }
      });
    }
    parts.push({ text: prompt || "이 물건에 대해 설명해줘." });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING }
          },
          required: ['title', 'category', 'tags', 'description']
        }
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: response.text
    };
  } catch (error: any) {
    console.error("Function Error:", error);
    
    let errorType = "SERVER_ERROR";
    if (error.message?.includes("quota") || error.status === 429) errorType = "QUOTA_EXCEEDED";
    if (error.message?.includes("permission") || error.status === 403) errorType = "PERMISSION_DENIED";

    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ error: errorType, message: error.message })
    };
  }
};
