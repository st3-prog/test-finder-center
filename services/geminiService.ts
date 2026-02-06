import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Netlify 등의 빌드 도구는 빌드 시 process.env.API_KEY를 실제 값으로 치환합니다.
// 브라우저 직접 실행 시 에러를 방지하기 위해 안전하게 접근합니다.
const getApiKey = (): string => {
  try {
    // @ts-ignore
    const env = typeof process !== 'undefined' ? process.env : {};
    return env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

export const analyzeItem = async (
  imageContent?: string,
  textPrompt?: string
): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set API_KEY in your environment.");
    return {
      title: "분석 불가 (API 키 없음)",
      category: "기타",
      tags: ["설정오류"],
      description: "API 키가 설정되지 않았습니다. Netlify 환경 변수에 API_KEY를 등록해주세요."
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    당신은 학교 분실물 센터의 도우미입니다. 
    사용자가 제공한 이미지나 텍스트를 바탕으로 분실/습득물을 분석하여 제목, 카테고리, 태그, 설명을 JSON 형식으로 생성하세요.
    카테고리는 다음 중 하나여야 합니다: 전자기기, 의류, 학용품, 지갑/카드, 악세사리, 기타.
    태그는 검색에 용이한 키워드 3~5개를 한국어로 작성하세요.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: '물건의 간단한 명칭' },
      category: { type: Type.STRING, description: '전자기기, 의류, 학용품, 지갑/카드, 악세사리, 기타 중 하나' },
      tags: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: '연관 키워드 리스트'
      },
      description: { type: Type.STRING, description: '물건에 대한 상세한 묘사' }
    },
    required: ['title', 'category', 'tags', 'description']
  };

  const parts: any[] = [];
  if (imageContent) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageContent.split(',')[1] 
      }
    });
  }
  
  if (textPrompt) {
    parts.push({ text: textPrompt });
  } else {
    parts.push({ text: "이 이미지의 물건이 무엇인지 분석해서 정보를 채워주세요." });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      title: "직접 입력 모드",
      category: "기타",
      tags: ["수동입력"],
      description: "AI 분석에 실패했습니다. 물건의 정보를 직접 입력해주세요."
    };
  }
};